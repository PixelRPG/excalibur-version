import {
  System,
  SystemType,
  Logger,
  ScreenElement,
  Scene,
  GraphicsComponent,
  Query,
  World,
} from 'excalibur';
import { PrpgMenuComponent, PrpgMenuVisibleComponent, PrpgScreenPositionComponent, PrpgTileboxComponent } from '../components';
import { PrpgComponentType } from '../types';


export class PrpgMenuRenderSystem extends System {
  public readonly types = [PrpgComponentType.MENU, PrpgComponentType.SCREEN_POSITION ] as const;
  public priority = 500;
  public systemType = SystemType.Update;
  protected logger = Logger.getInstance();
  protected scene?: Scene;
  protected query?: Query<typeof PrpgMenuComponent | typeof PrpgScreenPositionComponent>;

  public initialize(world: World, scene: Scene) {
    super.initialize?.(world, scene);
    this.query = this.scene?.world.queryManager.createQuery([PrpgMenuComponent, PrpgScreenPositionComponent]);
    this.scene = scene;
  }
   
  public update(delta: number) {
    const entities = (this.query?.getEntities() || []) as ScreenElement[];
    for (const entity of entities) {
      const tilebox = entity.get(PrpgTileboxComponent);
      const tileboxGraphics = tilebox ? tilebox.tilemap.get(GraphicsComponent) : undefined;
      // const screen = entity.get<PrpgScreenPositionComponent>(PrpgComponentType.SCREEN_POSITION);

      const visible = entity.get(PrpgMenuVisibleComponent);
      const menuIsVisible = !!visible;

      entity.graphics.visible = menuIsVisible;
      if(tileboxGraphics) {
        tileboxGraphics.visible = menuIsVisible;
      }

    }
  }
}