import {
  System,
  SystemType,
  Input,
  BoundingBox,
  Logger,
  Entity,
  BodyComponent,
  TransformComponent,
  MotionComponent,
  GraphicsComponent,
  ColliderComponent,
  ActionsComponent
} from 'excalibur';
import {
  PrpgCharacterComponent,
  PrpgPlayerComponent,
  PrpgSpawnPointComponent
} from '../components';
import { PrpgPlayerActor } from '../actors';
import { MapScene } from '../scenes/map.scene';
import { PrpgComponentType } from '../types';

export class PrpgPlayerSystem extends System<
| PrpgPlayerComponent
| PrpgCharacterComponent
| BodyComponent
| TransformComponent
| MotionComponent
| GraphicsComponent
| ColliderComponent
| ActionsComponent
> {
  public readonly types = [PrpgComponentType.PLAYER] as const;
  public priority = 99;
  public systemType = SystemType.Update;
  private scene: MapScene;
  private logger = Logger.getInstance();

  constructor() {
    super();
  }

  private _limitCameraBoundsToMap() {
    const tiledMap = this.scene.getMap();
    if (!tiledMap) {
      this.logger.warn('Current scene has no map!');
      return;
    }

    const vw = this.scene.camera.viewport.width
    const vh = this.scene.camera.viewport.height;

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

  private _initCamera(entity: PrpgPlayerActor) {
    // this.scene.camera.strategy.elasticToActor(entity, 1, 1);
    this.scene.camera.strategy.lockToActor(entity);
    this._limitCameraBoundsToMap();
  }

  private _handleInput(entity: Entity) {
    const body = entity.get(BodyComponent);
    if (!body) {
      this.logger.warn('BodyComponent for player input not found!');
      return;
    }
    const player = entity.get(PrpgPlayerComponent);
    if(!player) {
      this.logger.warn('PlayerComponent for player input not found!');
      return;
    }
    if (player.playerNumber !== 1) {
      // Ignore input for other players
      return;
    }

    body.vel.setTo(0, 0);
    const speed = 64;
    const pad1 = this.scene.engine.input.gamepads.at(0);
    const keyboard = this.scene.engine.input.keyboard;
    const axesLeftX = pad1.getAxes(Input.Axes.LeftStickX);
    const axesLeftY = pad1.getAxes(Input.Axes.LeftStickY);

    if (
      keyboard.isHeld(Input.Keys.Right) ||
      pad1.isButtonHeld(Input.Buttons.DpadRight)
    ) {
      body.vel.x = speed;
    }
    if (
      keyboard.isHeld(Input.Keys.Left) ||
      pad1.isButtonHeld(Input.Buttons.DpadLeft)
    ) {
      body.vel.x = -speed;
    }
    if (
      keyboard.isHeld(Input.Keys.Up) ||
      pad1.isButtonHeld(Input.Buttons.DpadUp)
    ) {
      body.vel.y = -speed;
    }
    if (
      keyboard.isHeld(Input.Keys.Down) ||
      pad1.isButtonHeld(Input.Buttons.DpadDown)
    ) {
      body.vel.y = speed;
    }

    if (keyboard.wasPressed(Input.Keys.D)) {
      this.scene.engine.toggleDebug();
    }

    // Axes movement
    if (Math.abs(axesLeftX) > 0) {
      body.vel.x = axesLeftX * speed;
    }
    if (Math.abs(axesLeftY) > 0) {
      body.vel.y = axesLeftY * speed;
    }
  }

  /**
   * Init properties defined in tiled map
   */
  private _handleSpawnPoints(playerEntity: Entity) {
    const spawnPointQuery =
      this.scene.world.queryManager.createQuery<PrpgSpawnPointComponent>([
        PrpgComponentType.SPAWN_POINT
      ]);
    const spawnPointEntities = spawnPointQuery.getEntities();

    if (spawnPointEntities.length > 0) {
      const spawnPointEntity = spawnPointEntities[0];
      const body = playerEntity.get(BodyComponent);
      const character = playerEntity.get(PrpgCharacterComponent);
      const player = playerEntity.get(PrpgPlayerComponent);
      const spawnPoint = spawnPointEntity.get(PrpgSpawnPointComponent);

      if (!spawnPoint) {
        this.logger.warn('SpawnPointComponent for Spawn Point Entity not found!');
        return;
      }

      if (!body) {
        this.logger.warn('BodyComponent for player start position not found!');
        return;
      }
      if (!character) {
        this.logger.warn(
          'PrpgCharacterComponent for player start position not found!'
        );
        return;
      }
      if (!player) {
        this.logger.warn(
          'PrpgPlayerComponent for player entry not found!'
        );
        return;
      }

      if(spawnPoint.entry) {
        if (spawnPoint.entry !== playerEntity) {
          // Ignore span point for other players
          return;
        }
      }

      body.pos.x = spawnPoint.x;
      body.pos.y = spawnPoint.y;
      character.direction = spawnPoint.direction;
      if (typeof (playerEntity as PrpgPlayerActor).z === 'number') {
        (playerEntity as PrpgPlayerActor).z = spawnPoint.z;
      } else {
        this.logger.warn('Can\'t set character z index');
      }

      this.scene.remove(spawnPointEntity);
    }
  }

  public initialize?(scene: MapScene) {
    this.scene = scene;

    const playerQuery =
      this.scene.world.queryManager.createQuery<PrpgPlayerComponent>([
        PrpgComponentType.PLAYER
      ]);

    const players = playerQuery.getEntities() as PrpgPlayerActor[];
    for (const player of players) {
      this._initCamera(player);
    }
  }

  public update(entities: (Entity | PrpgPlayerActor)[], delta: number) {
    for (const entity of entities) {
      this._handleInput(entity);
      this._handleSpawnPoints(entity);
    }
  }
}
