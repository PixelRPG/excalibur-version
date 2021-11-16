import { System, SystemType, Input, BoundingBox, Logger } from 'excalibur';
import { PrpgCharacterComponent } from '../components/character.component';
import { PrpgPlayerComponent, PRPG_PLAYER_TYPE } from '../components/player.component';
import { PrpgPlayerActor } from '../actors/player.actor';
import { BodyComponent, TransformComponent, MotionComponent, GraphicsComponent, ColliderComponent, ActionsComponent } from 'excalibur';
import { Resources } from '../resources';
import { MapScene } from '../scenes/map.scene';

export class PrpgPlayerSystem extends System<
PrpgPlayerComponent | PrpgCharacterComponent | BodyComponent |
TransformComponent | MotionComponent | GraphicsComponent | ColliderComponent | ActionsComponent> {
    public readonly types = [PRPG_PLAYER_TYPE] as const;
    public priority = 99;
    public systemType = SystemType.Update;
    private scene: MapScene;
    private resources = Resources.getSingleton();

    constructor(private readonly _input: Input.EngineInput) {
      super();
    }

    private _initCamera(entity: PrpgPlayerActor) {
      this.scene.camera.strategy.elasticToActor(entity, .9, .9);
      this.scene.camera.strategy.lockToActor(entity);
      const map = this.resources.maps['player_house_bedroom.tmx'];
      const mapBox = new BoundingBox({
        left: 0,
        top: 0,
        right: map.data.width * map.data.tileWidth,
        bottom: map.data.height * map.data.tileHeight
      });
      this.scene.camera.strategy.limitCameraBounds(mapBox);
    }

    private _handleInput(entity: PrpgPlayerActor) {
      const body = entity.get(BodyComponent);
      body.vel.setTo(0, 0);
      const speed = 64;
      const pad1 = this._input.gamepads.at(0);
      const keyboard = this._input.keyboard;
      const axesLeftX = pad1.getAxes(Input.Axes.LeftStickX);
      const axesLeftY = pad1.getAxes(Input.Axes.LeftStickY);

      if (keyboard.isHeld(Input.Keys.Right) || pad1.isButtonPressed(Input.Buttons.DpadRight)) {
        body.vel.x = speed;
      }
      if (keyboard.isHeld(Input.Keys.Left) || pad1.isButtonPressed(Input.Buttons.DpadLeft)) {
        body.vel.x = -speed;
      }
      if (keyboard.isHeld(Input.Keys.Up) || pad1.isButtonPressed(Input.Buttons.DpadUp)) {
        body.vel.y = -speed;
      }
      if (keyboard.isHeld(Input.Keys.Down) || pad1.isButtonPressed(Input.Buttons.DpadDown)) {
        body.vel.y = speed;
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
    private _initTiledMapProperties(entity: PrpgPlayerActor) {
      const mapProperties = this.scene.activeTiledMap.data.getExcaliburObjects();

      if (mapProperties.length > 0) {
        const body = entity.get(BodyComponent);
        const start = mapProperties[0].getObjectByName('player-start');
        if (start) {
          body.pos.x = start.x;
          body.pos.y = start.y;
        }
      }
    }

    public initialize?(scene: MapScene) {
      this.scene = scene;
      const playerQuery = this.scene.world.queryManager.createQuery<PrpgPlayerComponent>([PRPG_PLAYER_TYPE]);

      const players = playerQuery.getEntities() as PrpgPlayerActor[];
      for (const player of players) {
        this._initCamera(player);
        this._initTiledMapProperties(player);
      }
    }

    public update(entities: PrpgPlayerActor[], delta: number) {
      for (const entity of entities) {
        this._handleInput(entity);
      }
    }
}