import { System, SystemType, Logger, Entity, Actor, vec, Color, Query, World } from 'excalibur';
import { MapScene } from '../scenes/map.scene';
import { TiledResource } from '@excaliburjs/plugin-tiled';

import { PrpgMapComponent } from '../components';
import { PrpgTeleportActor, PrpgPlayerActor } from '../actors';
import { newSpawnPointEntity } from '../entities';
import { PrpgComponentType, SpawnPointType, GameOptions, Direction } from '../types';
import { stringToDirection } from '../utilities/direction';
import { resources } from '../managers/resource.manager';

export class PrpgMapSystem extends System {
    public readonly types = [PrpgComponentType.MAP] as const;
    public priority = 900;
    public systemType = SystemType.Update;
    private scene?: MapScene;
    private logger = Logger.getInstance();

    constructor(protected readonly gameOptions: GameOptions) {
      super();
    }

    private _initTiledMapComponents() {
      if (!this.scene) {
        this.logger.error('No scene found!');
        return;
      }
      const tiledMap = this.scene.getMap();
      if (!tiledMap) {
        this.logger.warn('No tiled map found!');
        return;
      }
      tiledMap.state.map.addToScene(this.scene);
      this._initProperties(tiledMap);
    }

    /**
     * Init properties defined in tiled map
     */
    private _initProperties(tiledMap: PrpgMapComponent) {
      const tiledResource = tiledMap.state.map;
      // console.debug("_initProperties", tiledObjectGroups)
      // TODO
      // this._initPolyLines(tiledMap.state.map);
      // this._initPolygons(tiledMap.state.map);
      this._initTeleports(tiledMap.state.map);
      this._initSpawnPoints(tiledMap.state.map);
    }

    /**
     * Init spawn points defined on the map, e.g. players first spawn point.
     * Creates a new spawn point entity and adds it to the scene.
     */
    private _initSpawnPoints(tiledResource: TiledResource) {
      console.debug("init spawn point")
      if (!this.scene) {
        this.logger.error('No scene found!');
        return;
      }
      let hasStartPoint = false;
      const starts = tiledResource.getObjectsByClassName('player-start');
      if (starts.length > 0) {
        for (let i = 0; i < starts.length; i++) {
          const start = starts[i];
          const z = start.properties.get('zindex') as number || 0;
          const playerNumber = start.properties.get('player') as number || (i + 1);
          const direction = start.properties.get('direction') as string;
          if(playerNumber > this.gameOptions.players) {
            this.logger.error(`Player number ${playerNumber} is higher than the number of players ${this.gameOptions.players}`);
            continue;
          }

          // TODO: Store player sprite in PrpgCharacterComponent
          const spriteSheet = resources.sprites.scientist;

          if(!spriteSheet) {
            throw new Error('Sprite sheet not found');
          }
          
          const player = PrpgPlayerActor.newPlayer(this.gameOptions, {}, {
            character: { spriteSheet, direction: Direction.DOWN },
            player: { playerNumber }
          });
          
          this.scene.addPlayer(player, true, true);
          this.scene.add(newSpawnPointEntity({
            type: SpawnPointType.START,
            x: start.x,
            y: start.y,
            z,
            direction: stringToDirection(direction),
            entityName: player.name,
            sceneName: this.scene.name,
          }));
        }
      }
      return hasStartPoint;
    }

    /** Currently just an example */
    private _initPolyLines(tiledResource: TiledResource) {
      if (!this.scene) {
        this.logger.error('No scene found!');
        return;
      }
      // Use polyline for patrols
      const lines = tiledResource.getPolyLines();
      for (const line of lines) {
        if (line && line.polyline) {
          const start = vec(line.x, line.y);
          const firstpoint = line.polyline[0];
          const patrol = new Actor({
            x: Math.round(start.x + firstpoint.x),
            y: Math.round(start.y + firstpoint.y),
            color: Color.Green, width: 5, height: 5
          });
          patrol.actions.repeat(ctx => {
            if (!line.polyline) {
              return;
            }
            for (let i = 1; i < line.polyline.length; i++) {
              const p = line.polyline[i];
              const x = Math.round(p.x + line.x);
              const y = Math.round(p.y + line.y);
              ctx.moveTo(x, y, 20);
            }
            ctx.moveTo(line.x + firstpoint.x, line.y + firstpoint.y, 20); // move to start position
          });
          this.scene.add(patrol);
        }
      }
    }

    /** Currently just an example */
    private _initPolygons(tiledObjectGroup: TiledResource) {
      if (!this.scene) {
        this.logger.error('No scene found!');
        return;
      }
      // Use polygon for patrols
      const polys = tiledObjectGroup.getPolygons();
      for (const poly of polys) {
        if (poly && poly.polygon) {
          const firstpoint = poly.polygon[0];
          const start = vec(poly.x, poly.y);
          const patrol = new Actor({
            x: Math.round(start.x + firstpoint.x),
            y: Math.round(start.y + firstpoint.y),
            color: Color.Blue, width: 5, height: 5
          });
          patrol.actions.repeat(ctx => {
            if (!poly.polygon) {
              return;
            }
            for (let i = 1; i < poly.polygon.length; i++) {
              const p = poly.polygon[i];
              const x = Math.round(p.x + poly.x);
              const y = Math.round(p.y + poly.y);
              ctx.moveTo(x, y, 20);
            }
            ctx.moveTo(poly.x + firstpoint.x, poly.y + firstpoint.y, 20); // move to start position
          });
          this.scene.add(patrol);
        }
      }
    }

    private _initTeleports(tiledObjectGroup: TiledResource) {
      if (!this.scene) {
        this.logger.error('No scene found!');
        return;
      }
      const teleports = tiledObjectGroup.getObjectsByName('teleport');
      for (const teleObj of teleports) {
        const mapName = teleObj.properties.get('map-name') as string;
        const spawnName = teleObj.properties.get('teleport-spawn-name') as string;
        const z = teleObj.properties.get('zindex') as number || 0;
        const x = teleObj.x + Math.round((teleObj.tiledObject?.width ?? 0) / 2);
        const y = teleObj.y + Math.round((teleObj.tiledObject?.height ?? 0) / 2);

        if (!mapName) {
          this.logger.warn('"mapName" property for teleport not found!', teleObj);
          continue;
        }

        if (!spawnName) {
          this.logger.warn('"teleport-spawn-name" property for teleport not found!', teleObj);
          continue;
        }

        const teleport = new PrpgTeleportActor({
          mapName,
          spawnName,
          pos: vec(x, y),
          width: teleObj.tiledObject?.width,
          height: teleObj.tiledObject?.height,
          z
        });
        this.scene.add(teleport);
      }
    }

    public initialize(world: World, scene: MapScene) {
      super.initialize?.(world, scene);
      this.logger.debug('[PrpgMapSystem] initialize');
      this.scene = scene;
      this._initTiledMapComponents();
    }

    public update(delta: number) {
      //
    }
}