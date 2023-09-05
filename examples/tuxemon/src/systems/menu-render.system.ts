import {
  System,
  SystemType,
  Logger,
  BodyComponent,
  Entity,
  ScreenElement,
  Polygon,
  vec,
  Color,
  Scene,
  TransformComponent,
  CoordPlane,
  CollisionType,
  PointerComponent,
  GraphicsComponent,
  Tile,
} from 'excalibur';
import { PrpgMenuComponent, PrpgMenuVisibleComponent, PrpgScreenPositionComponent, PrpgTileboxComponent } from '../components';
import { MapScene } from '../scenes/index';
import { PrpgComponentType } from '../types';
import { resources } from '../managers/index';
import { TiledTilesetResource } from '../resources/tiled-tileset.resource';


export class PrpgMenuRenderSystem extends System<PrpgMenuComponent | PrpgScreenPositionComponent> {
  public readonly types = [PrpgComponentType.MENU, PrpgComponentType.SCREEN_POSITION ] as const;
  public priority = 500;
  public systemType = SystemType.Update;
  protected logger = Logger.getInstance();
  protected scene?: Scene;
  

  public initialize(scene: Scene) {
    super.initialize?.(scene);
    this.scene = scene;
  }
   
  public update(entities: ScreenElement[], delta: number) {
    for (const entity of entities) {
      const screen = entity.get<PrpgScreenPositionComponent>(PrpgComponentType.SCREEN_POSITION);
      if(!screen) {
        this.logger.error('PrpgScreenPositionComponent not found!');
        continue;
      }

      const tilebox = entity.get<PrpgTileboxComponent>(PrpgComponentType.TILEBOX);
      const tileboxGraphics = tilebox ? tilebox.tilemap.get(GraphicsComponent) : undefined;

      const visible = entity.get<PrpgMenuVisibleComponent>(PrpgComponentType.MENU_VISIBLE);
      const menuIsVisible = !!visible;

      entity.graphics.visible = menuIsVisible;
      if(tileboxGraphics) {
        tileboxGraphics.visible = menuIsVisible;
      }

    }
  }
}