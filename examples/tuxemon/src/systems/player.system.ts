import {
  System,
  SystemType,
  BoundingBox,
  Logger,
  BodyComponent,
  TransformComponent,
  MotionComponent,
  GraphicsComponent,
  ColliderComponent,
  ActionsComponent,
} from 'excalibur';
import {
  PrpgCharacterComponent,
  PrpgPlayerComponent,
  PrpgBodyComponent
} from '../components';
import { PrpgPlayerActor } from '../actors';
import { MapScene } from '../scenes/map.scene';
import { GameOptions, PrpgComponentType } from '../types';

export class PrpgPlayerSystem extends System<
| PrpgPlayerComponent
| PrpgCharacterComponent
| BodyComponent
| PrpgBodyComponent
| TransformComponent
| MotionComponent
| GraphicsComponent
| ColliderComponent
| ActionsComponent
> {
  public readonly types = [PrpgComponentType.PLAYER] as const;
  public priority = 99;
  public systemType = SystemType.Update;
  private scene?: MapScene;
  private logger = Logger.getInstance();

  constructor(readonly gameOptions: GameOptions) {
    super();
  }

  private _limitCameraBoundsToMap() {
    const tiledMap = this.scene?.getMap();
    if (!tiledMap) {
      this.logger.error('Current scene has no map!');
      return;
    }

    if (!this.scene) {
      this.logger.error('Current scene not found!');
      return;
    }

    const vw = this.scene?.camera.viewport.width
    const vh = this.scene?.camera.viewport.height;

    const mapWidth = tiledMap.map.data.width * tiledMap.map.data.tileWidth;
    const mapHeight = tiledMap.map.data.height * tiledMap.map.data.tileHeight;

    if (vw > (mapWidth * this.scene.camera.zoom) || vh > mapHeight * this.scene.camera.zoom) {
      return; // Do nothing
    }

    const mapBox = new BoundingBox({
      left: 0,
      top: 0,
      right: mapWidth,
      bottom: mapHeight
    });
    this.scene.camera.strategy.limitCameraBounds(mapBox);
  }

  private _initCameraForPlayer(entity: PrpgPlayerActor) {
    // this.scene.camera.strategy.elasticToActor(entity, 1, 1);
    const player = entity.get(PrpgPlayerComponent);
    if(!player) {
      this.logger.warn('PlayerComponent for entity not found!');
      return;
    }

    if(player.playerNumber === this.gameOptions.playerNumber) {
      this.scene?.camera.strategy.lockToActor(entity);
    }    
  }

  public initCameraForPlayer() {
    if(!this.scene) {
      this.logger.error('Current scene not found!');
      return;
    }

    const playerQuery =
      this.scene.world.queryManager.createQuery<PrpgPlayerComponent>([
        PrpgComponentType.PLAYER
      ]);

    const players = playerQuery.getEntities() as PrpgPlayerActor[];
    for (const player of players) {
      this._initCameraForPlayer(player);
    }

    this._limitCameraBoundsToMap();
  }

  public initialize(scene: MapScene) {
    this.scene = scene;
  }

  public update(entities: PrpgPlayerActor[], delta: number) {
    //
  }
}
