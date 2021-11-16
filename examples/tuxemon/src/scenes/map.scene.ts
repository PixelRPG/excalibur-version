import { Scene, Engine, vec, Actor, Color, Logger } from 'excalibur';
import { TiledMapResource, TiledObjectGroup } from '@excaliburjs/plugin-tiled/src/index';
import { PrpgCharacterSystem } from '../systems/character.system';
import { PrpgPlayerSystem } from '../systems/player.system';
import { PrpgTeleporterSystem } from '../systems/teleporter.system';
import { PrpgPlayerActor } from '../actors/player.actor';
import { resources } from '../resources';
import { PrpgTeleportActor } from '../actors/teleport.actor';

export class MapScene extends Scene {

  public logger = Logger.getInstance();

  constructor(readonly activeTiledMap: TiledMapResource) {
    super();
  }

  /**
   * Init properties defined in tiled map
   * TODO move this to a polygon system?
   */
  private _initTiledMapProperties() {
    const tiledObjectGroups = this.activeTiledMap.data.getExcaliburObjects();
    if (tiledObjectGroups.length > 0) {
      // this.logger.debug('tiledObjectGroups', tiledObjectGroups);
      for (const tiledObjectGroup of tiledObjectGroups) {
        this._initTiledMapPolyLines(tiledObjectGroup);
        this._initTiledMapPolygons(tiledObjectGroup);
        this._initTiledMapTeleporter(tiledObjectGroup);
      }
    }
  }

  /** Currently just an example */
  private _initTiledMapPolyLines(tiledObjectGroup: TiledObjectGroup) {
    // Use polyline for patrols
    const lines = tiledObjectGroup.getPolyLines();
    // this.logger.debug('polylines', lines);
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
        this.add(patrol);
      }
    }
  }

  /** Currently just an example */
  private _initTiledMapPolygons(tiledObjectGroup: TiledObjectGroup) {
    // Use polygon for patrols
    const polys = tiledObjectGroup.getPolygons();
    // this.logger.debug('polygons', polys);
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
        this.add(patrol);
      }
    }
  }

  private _initTiledMapTeleporter(tiledObjectGroup: TiledObjectGroup) {
    const teleporters = tiledObjectGroup.getObjectsByType('teleporter');
    // this.logger.debug('teleporters', teleporters);
    for (const teleObj of teleporters) {
      this.logger.debug('teleObj', teleObj);
      const map = teleObj.getProperty<string>('map')?.value;
      const addressee = teleObj.getProperty<string>('addressee')?.value;
      const z = teleObj.getProperty<number>('zindex')?.value || 0;
      const x = teleObj.x + Math.round((teleObj.width ?? 0) / 2);
      const y = teleObj.y + Math.round((teleObj.height ?? 0) / 2);

      if (!map) {
        this.logger.warn('map property for teleporter not found!', teleObj);
        continue;
      }

      if (!addressee) {
        this.logger.warn('addressee property for teleporter not found!', teleObj);
        continue;
      }

      const teleporter = new PrpgTeleportActor({
        map,
        addressee,
        pos: vec(x, y),
        width: teleObj.width,
        height: teleObj.height,
        z
      });
      this.add(teleporter);
      // this.logger.debug('Add teleporter', teleporter, x, y);
    }
  }

  public onInitialize(engine: Engine) {
    this.activeTiledMap.addTiledMapToScene(this);
    this.world.add(new PrpgCharacterSystem());
    this.world.add(new PrpgPlayerSystem());
    this.world.add(new PrpgTeleporterSystem());

    this._initTiledMapProperties();

    const player = new PrpgPlayerActor(resources.sprites.scientist);
    this.add(player);
  }

  public onActivate(_oldScene: Scene, _newScene: Scene): void {
    //

  }
}