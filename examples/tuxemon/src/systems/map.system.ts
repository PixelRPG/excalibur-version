import { System, SystemType, Logger, Entity, Actor, vec, Color } from 'excalibur';
import { MapScene } from '../scenes/map.scene';
import { TiledObjectGroup } from '@excaliburjs/plugin-tiled';
import { PrpgMapComponent } from '../components';
import { PrpgTeleportActor, PrpgPlayerActor } from '../actors';
import { newSpawnPointEntity } from '../entities';
import { PrpgComponentType, SpawnPointType, GameOptions, Direction } from '../types';
import { stringToDirection } from '../utilities/direction';
import { resources } from '../managers/resource.manager';

export class PrpgMapSystem extends System<
PrpgMapComponent, MapScene> {
    public readonly types = [PrpgComponentType.TILED_MAP] as const;
    public priority = 100;
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
      tiledMap.map.addTiledMapToScene(this.scene);
      this._initProperties(tiledMap);
    }

    /**
     * Init properties defined in tiled map
     */
    private _initProperties(tiledMap: PrpgMapComponent) {
      const tiledObjectGroups = tiledMap.map.data.getExcaliburObjects();
      if (tiledObjectGroups.length > 0) {
        
        for (const tiledObjectGroup of tiledObjectGroups) {
          console.debug(tiledMap.name, tiledObjectGroup);
          this._initPolyLines(tiledObjectGroup);
          this._initPolygons(tiledObjectGroup);
          this._initTeleports(tiledObjectGroup);
          this._initSpawnPoints(tiledObjectGroup);
        }
      }
    }

    /**
     * Init spawn points defined on the map, e.g. players first spawn point.
     * Creates a new spawn point entity and adds it to the scene.
     */
    private _initSpawnPoints(tiledObjectGroup: TiledObjectGroup) {
      if (!this.scene) {
        this.logger.error('No scene found!');
        return;
      }
      let hasStartPoint = false;
      const starts = tiledObjectGroup.getObjectsByClass('player-start');
      if (starts.length > 0) {
        for (let i = 0; i < starts.length; i++) {
          const start = starts[i];
          const z = start.getProperty<number>('zindex')?.value || 0;
          const playerNumber = start.getProperty<number>('player')?.value || (i + 1);
          const direction = start.getProperty<string>('direction')?.value;
          const player = PrpgPlayerActor.newPlayer(this.gameOptions, { spriteSheet: resources.sprites.scientist, playerNumber, direction: Direction.DOWN });
          
          this.scene.add(player);
          this.scene.add(newSpawnPointEntity({
            type: SpawnPointType.START,
            x: start.x,
            y: start.y,
            z,
            direction: stringToDirection(direction),
            entityName: player.name,
            mapScene: this.scene,
          }));
        }
      }
      return hasStartPoint;
    }

    /** Currently just an example */
    private _initPolyLines(tiledObjectGroup: TiledObjectGroup) {
      if (!this.scene) {
        this.logger.error('No scene found!');
        return;
      }
      // Use polyline for patrols
      const lines = tiledObjectGroup.getPolyLines();
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
    private _initPolygons(tiledObjectGroup: TiledObjectGroup) {
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

    private _initTeleports(tiledObjectGroup: TiledObjectGroup) {
      if (!this.scene) {
        this.logger.error('No scene found!');
        return;
      }
      const teleports = tiledObjectGroup.getObjectsByType('teleport');
      for (const teleObj of teleports) {
        const mapName = teleObj.getProperty<string>('map-name')?.value;
        const spawnName = teleObj.getProperty<string>('teleport-spawn-name')?.value;
        const z = teleObj.getProperty<number>('zindex')?.value || 0;
        const x = teleObj.x + Math.round((teleObj.width ?? 0) / 2);
        const y = teleObj.y + Math.round((teleObj.height ?? 0) / 2);

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
          width: teleObj.width,
          height: teleObj.height,
          z
        });
        this.scene.add(teleport);
      }
    }

    public initialize(scene: MapScene) {
      super.initialize?.(scene);
      this.logger.debug('[PrpgMapSystem] initialize');
      this.scene = scene;
      this._initTiledMapComponents();
    }

    public update(entities: Entity[], delta: number) {
      //
    }
}