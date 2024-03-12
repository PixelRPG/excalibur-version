import {
  System,
  SystemType,
  Logger,
  Entity,
  Scene,
  BodyComponent,
  ScreenElement,
  Actor,
  Query,
  World,
} from 'excalibur';
import { PrpgScreenPositionComponent, PrpgTileboxComponent } from '../components';
import { PrpgComponentType, ScreenAutoPosition } from '../types';

/**
 * A system to position elements on the screen coordinate plane using the PrpgScreenPositionComponent.
 */
export class PrpgScreenSystem extends System {
  public readonly types = [PrpgComponentType.SCREEN_POSITION] as const;
  public priority = 1000;
  public systemType = SystemType.Update;
  private logger = Logger.getInstance();
  private scene?: Scene;
  private query?: Query<typeof PrpgScreenPositionComponent>

  private _firstRun = true;

  public initialize(world: World, scene: Scene) {
    super.initialize?.(world, scene);
    this.scene = scene;
    this.query = world.queryManager.createQuery([
      PrpgScreenPositionComponent
    ]);
  }

  public setX(auto: ScreenAutoPosition, vw: number, width: number) {
    switch(auto) {
      case ScreenAutoPosition.CENTER:
        return (vw / 2) - (width / 2);
      case ScreenAutoPosition.LEFT:
        return 0;
      case ScreenAutoPosition.RIGHT:
        return vw - width;
      default:
        return 0;
    }
  }

  public setY(auto: ScreenAutoPosition, vh: number, height: number) {
    switch(auto) {
      case ScreenAutoPosition.CENTER:
        return (vh / 2) - (height / 2);
      case ScreenAutoPosition.TOP:
        return 0;
      case ScreenAutoPosition.BOTTOM:
        return vh - height;
      default:
        return 0;
    }
  }

  public updatePosition(entities: Entity[]) {
    if(!this.scene) {
      throw new Error('PrpgBodySystem: Scene not found');
    }

    const engine = this.scene.engine;
    const vw = engine.screen.contentArea.width;
    const vh = engine.screen.contentArea.height;

    this.logger.debug('screen size', vw, vh);

    // TODO: Only update if screen size changed
    for (const entity of entities) {
      const screenPosition = entity.get(PrpgScreenPositionComponent);
      if(!screenPosition) {
        throw new Error('PrpgBodySystem: ScreenPositionComponent not found');
      }

      if(screenPosition.auto.x) {
        screenPosition.x = this.setX(screenPosition.auto.x, vw, 16 * 5); // TODO get width from tilemap
      }

      if(screenPosition.auto.y) {
        screenPosition.y = this.setY(screenPosition.auto.y, vh, 16 * 5); // TODO get height from tilemap
      }

      const body = entity.get(BodyComponent);
      if(body) {
        body.pos.x = screenPosition.x;
        body.pos.y = screenPosition.y;
      }

      if(entity instanceof Actor || entity instanceof ScreenElement) {
        entity.pos.x = screenPosition.x;
        entity.pos.y = screenPosition.y;
      }

      const tilebox = entity.get(PrpgTileboxComponent);

      if(tilebox) {
        tilebox.tilemap.pos.x = screenPosition.x
        tilebox.tilemap.pos.y = screenPosition.y;
      }
    }
  }

  public update( delta: number) {
    const entities = this.query?.getEntities() ?? [];
    // TODO: Update if screen size changed
    if(this._firstRun) {
      this.updatePosition(entities);
    }
    this._firstRun = false;
  }
}