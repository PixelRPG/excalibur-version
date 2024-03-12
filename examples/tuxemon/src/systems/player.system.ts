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
  Query,
  World,
} from 'excalibur';
import {
  PrpgCharacterComponent,
  PrpgPlayerComponent,
  PrpgBodyComponent
} from '../components';
import { PrpgPlayerActor } from '../actors';
import { MapScene } from '../scenes/map.scene';
import { GameOptions, PrpgComponentType } from '../types';

export class PrpgPlayerSystem extends System {
  public readonly types = [PrpgComponentType.PLAYER] as const;
  public priority = 99;
  public systemType = SystemType.Update;
  private scene?: MapScene;
  private logger = Logger.getInstance();
  private playerQuery?: Query<typeof PrpgPlayerComponent>;

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

    const mapWidth = tiledMap.state.map.data.width * tiledMap.state.map.data.tileWidth;
    const mapHeight = tiledMap.state.map.data.height * tiledMap.state.map.data.tileHeight;

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

    const players = this.playerQuery?.getEntities() as PrpgPlayerActor[];
    for (const player of players) {
      this._initCameraForPlayer(player);
    }

    this._limitCameraBoundsToMap();
  }

  public initialize(world: World, scene: MapScene) {
    super.initialize?.(world, scene);
    this.scene = scene;

    this.playerQuery =
      world.queryManager.createQuery([
        PrpgPlayerComponent
      ]);
  }

  public update( delta: number) {
    //
  }
}
