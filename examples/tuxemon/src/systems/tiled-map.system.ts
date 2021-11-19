import { System, SystemType, Logger, Entity, Actor, vec, Color } from 'excalibur';
import { MapScene } from '../scenes/map.scene';
import { TiledObjectGroup } from '@excaliburjs/plugin-tiled/src/index';
import { PrpgTiledMapComponent } from '../components';
import { PrpgTeleportActor, PrpgPlayerActor } from '../actors';
import { newSpawnPointEntity } from '../entities';
import { PrpgComponentType, SpawnPointType } from '../types';
import { stringToDirection } from '../utilities/direction';
import { resources } from '../resources';

export class PrpgTiledMapSystem extends System<
PrpgTiledMapComponent> {
    public readonly types = [PrpgComponentType.TILED_MAP] as const;
    public priority = 100;
    public systemType = SystemType.Update;
    private scene: MapScene;
    private logger = Logger.getInstance();

    constructor() {
      super();
    }

    private _initTiledMapComponents() {
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
    private _initProperties(tiledMap: PrpgTiledMapComponent) {
      const tiledObjectGroups = tiledMap.map.data.getExcaliburObjects();
      if (tiledObjectGroups.length > 0) {
        for (const tiledObjectGroup of tiledObjectGroups) {
          this._initPolyLines(tiledObjectGroup);
          this._initPolygons(tiledObjectGroup);
          this._initTeleporter(tiledObjectGroup);
          this._initSpawnPoints(tiledObjectGroup);
        }
      }
    }

    /**
     * Players first spawn point e.g. on a new game
     */
    private _initSpawnPoints(tiledObjectGroup: TiledObjectGroup) {
      let hasStartPoint = false;
      const start = tiledObjectGroup.getObjectByName('player-start');
      if (start) {
        hasStartPoint = true;
        const z = start.getProperty<number>('zindex')?.value || 0;
        const direction = start.getProperty<string>('direction')?.value;
        const player = PrpgPlayerActor.getInstance({spriteSheet: resources.sprites.scientist, playerNumber: 1});

        this.scene.add(player);
        this.scene.add(newSpawnPointEntity(SpawnPointType.START, start.x, start.y, z, stringToDirection(direction)));
      }
      return hasStartPoint;
    }

    /** Currently just an example */
    private _initPolyLines(tiledObjectGroup: TiledObjectGroup) {
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

    private _initTeleporter(tiledObjectGroup: TiledObjectGroup) {
      const teleporters = tiledObjectGroup.getObjectsByType('teleporter');
      for (const teleObj of teleporters) {
        const mapName = teleObj.getProperty<string>('map-name')?.value;
        const spawnName = teleObj.getProperty<string>('teleport-spawn-name')?.value;
        const z = teleObj.getProperty<number>('zindex')?.value || 0;
        const x = teleObj.x + Math.round((teleObj.width ?? 0) / 2);
        const y = teleObj.y + Math.round((teleObj.height ?? 0) / 2);

        if (!mapName) {
          this.logger.warn('"mapName" property for teleporter not found!', teleObj);
          continue;
        }

        if (!spawnName) {
          this.logger.warn('"teleport-spawn-name" property for teleporter not found!', teleObj);
          continue;
        }

        const teleporter = new PrpgTeleportActor({
          mapName,
          spawnName,
          pos: vec(x, y),
          width: teleObj.width,
          height: teleObj.height,
          z
        });
        this.scene.add(teleporter);
      }
    }

    public initialize?(scene: MapScene) {
      this.logger.debug('[PrpgTiledMapSystem] initialize');
      this.scene = scene;
      this._initTiledMapComponents();
    }

    public update(entities: Entity[], delta: number) {
      //
    }
}