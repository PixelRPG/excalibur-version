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
  ActionsComponent,
  Keys,
  Buttons,
  Axes,
} from 'excalibur';
import {
  PrpgCharacterComponent,
  PrpgPlayerComponent,
  PrpgTeleportableComponent,
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

  constructor(readonly options: GameOptions) {
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

    if(player.playerNumber === this.options.playerNumber) {
      this.scene?.camera.strategy.lockToActor(entity);
    }    
  }

  private _handleInput(entity: Entity) {
    const player = entity.get(PrpgPlayerComponent);
    if(!player) {
      this.logger.error('PlayerComponent for player input not found!');
      return;
    }
    if (player.playerNumber !== this.options.playerNumber) {
      // Ignore input for other players
      return;
    }

    if(!this.scene) {
      this.logger.error('Current scene not found!');
      return;
    }

    const body = entity.get(PrpgBodyComponent);
    if (!body) {
      this.logger.error('PrpgBodyComponent for player input not found!');
      return;
    }

    // Reset velocity
    let velX = 0;
    let velY = 0;

    const teleportable = entity.get(PrpgTeleportableComponent);
    if(teleportable?.isTeleporting) {
      // Ignore input while teleporting
      return;
    }

    const speed = 64;

    const pad1 = this.scene.engine.input.gamepads.at(0);
    const pad2 = this.scene.engine.input.gamepads.at(1);
    const pad3 = this.scene.engine.input.gamepads.at(1);

    const keyboard = this.scene.engine.input.keyboard;

    const pad1AxesLeftX = pad1.getAxes(Axes.LeftStickX);
    const pad1AxesLeftY = pad1.getAxes(Axes.LeftStickY);

    const pad2AxesLeftX = pad2.getAxes(Axes.LeftStickX);
    const pad2AxesLeftY = pad2.getAxes(Axes.LeftStickY);

    const pad3AxesLeftX = pad3.getAxes(Axes.LeftStickX);
    const pad3AxesLeftY = pad3.getAxes(Axes.LeftStickY);

    if (keyboard.wasPressed(Keys.F1)) {
      this.scene.engine.toggleDebug();
    }

    if(this.options.playerNumber === 1) {
      if (
        keyboard.isHeld(Keys.Right) ||
        pad1.isButtonHeld(Buttons.DpadRight)
      ) {
        velX = speed;
      }
      if (
        keyboard.isHeld(Keys.Left) ||
        pad1.isButtonHeld(Buttons.DpadLeft)
      ) {
        velX = -speed;
      }
      if (
        keyboard.isHeld(Keys.Up) ||
        pad1.isButtonHeld(Buttons.DpadUp)
      ) {
        velY = -speed;
      }
      if (
        keyboard.isHeld(Keys.Down) ||
        pad1.isButtonHeld(Buttons.DpadDown)
      ) {
        velY = speed;
      }

      // Axes movement
      if (Math.abs(pad1AxesLeftX) > 0) {
        velX = pad1AxesLeftX * speed;
      }
      if (Math.abs(pad1AxesLeftY) > 0) {
        velY = pad1AxesLeftY * speed;
      }
    }

    if(this.options.playerNumber === 2) {
      if (
        keyboard.isHeld(Keys.D) ||
        pad2.isButtonHeld(Buttons.DpadRight)
      ) {
        velX = speed;
      }
      if (
        keyboard.isHeld(Keys.A) ||
        pad2.isButtonHeld(Buttons.DpadLeft)
      ) {
        velX = -speed;
      }
      if (
        keyboard.isHeld(Keys.W) ||
        pad2.isButtonHeld(Buttons.DpadUp)
      ) {
        velY = -speed;
      }
      if (
        keyboard.isHeld(Keys.S) ||
        pad2.isButtonHeld(Buttons.DpadDown)
      ) {
        velY = speed;
      }

      // Axes movement
      if (Math.abs(pad2AxesLeftX) > 0) {
        velX = pad2AxesLeftX * speed;
      }

      if (Math.abs(pad2AxesLeftY) > 0) {
        velY = pad2AxesLeftY * speed;
      }
    }


    if(this.options.playerNumber === 3) {
      if (
        keyboard.isHeld(Keys.Numpad3) ||
        pad3.isButtonHeld(Buttons.DpadRight)
      ) {
        velX = speed;
      }
      if (
        keyboard.isHeld(Keys.Numpad1) ||
        pad3.isButtonHeld(Buttons.DpadLeft)
      ) {
        velX = -speed;
      }
      if (
        keyboard.isHeld(Keys.Numpad5) ||
        pad3.isButtonHeld(Buttons.DpadUp)
      ) {
        velY = -speed;
      }
      if (
        keyboard.isHeld(Keys.Numpad2) ||
        pad3.isButtonHeld(Buttons.DpadDown)
      ) {
        velY = speed;
      }

      // Axes movement
      if (Math.abs(pad3AxesLeftX) > 0) {
        velX = pad3AxesLeftX * speed;
      }

      if (Math.abs(pad3AxesLeftY) > 0) {
        velY = pad3AxesLeftY * speed;
      }
    }

    body.setVel(velX, velY);
  }

  public initialize(scene: MapScene) {
    this.scene = scene;

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

  public update(entities: PrpgPlayerActor[], delta: number) {
    for (const entity of entities) {
      this._handleInput(entity);
    }
  }
}
