import {
  System,
  SystemType,
  Logger,
  ScreenElement,
  Scene,
  GraphicsComponent,
} from 'excalibur';
import { PrpgMenuComponent, PrpgMenuVisibleComponent, PrpgScreenPositionComponent, PrpgTileboxComponent } from '../components';
import { PrpgComponentType } from '../types';


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
      

      const tilebox = entity.get<PrpgTileboxComponent>(PrpgComponentType.TILEBOX);
      const tileboxGraphics = tilebox ? tilebox.tilemap.get(GraphicsComponent) : undefined;
      // const screen = entity.get<PrpgScreenPositionComponent>(PrpgComponentType.SCREEN_POSITION);

      const visible = entity.get<PrpgMenuVisibleComponent>(PrpgComponentType.MENU_VISIBLE);
      const menuIsVisible = !!visible;

      entity.graphics.visible = menuIsVisible;
      if(tileboxGraphics) {
        tileboxGraphics.visible = menuIsVisible;
      }

    }
  }
}