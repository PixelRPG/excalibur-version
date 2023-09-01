import {
  System,
  SystemType,
  Logger,
  BodyComponent,
  Entity,
  ScreenElement,
  Polygon,
  vec,
  Color
} from 'excalibur';
import { PrpgMenuComponent, PrpgMenuVisibleComponent, PrpgScreenPositionComponent } from '../components';
import { PrpgComponentType } from '../types';

// TODO draw menu instead of this triangle
const triangle = new Polygon({
  points: [vec(10 * 5, 0), vec(0, 20 * 5), vec(20 * 5, 20 * 5)],
  color: Color.Yellow,
})

export class PrpgMenuRenderSystem extends System<PrpgMenuComponent | PrpgScreenPositionComponent> {
  public readonly types = [PrpgComponentType.MENU, PrpgComponentType.SCREEN_POSITION ] as const;
  public priority = 500;
  public systemType = SystemType.Update;
  private logger = Logger.getInstance();

   
  public update(entities: ScreenElement[], delta: number) {
    for (const entity of entities) {
      const screen = entity.get<PrpgScreenPositionComponent>(PrpgComponentType.SCREEN_POSITION);
      if(!screen) {
        this.logger.error('PrpgScreenPositionComponent not found!');
        break;
      }

      const visible = entity.get<PrpgMenuVisibleComponent>(PrpgComponentType.MENU_VISIBLE);
      if(visible) {
        entity.graphics.visible = true;
      } else {
        entity.graphics.visible = false;
        return;
      }
      entity.graphics.use(triangle);
      // screen?.add

      console.debug('PrpgMenuRenderSystem', entity, screen, visible);
    }
  }
}