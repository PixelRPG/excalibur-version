import { System, SystemType, Input, BoundingBox, Logger } from "excalibur";
import { PrpgCharacterComponent } from "../components/character.component";
import { PrpgPlayerComponent, PRPG_PLAYER_TYPE } from "../components/player.component";
import { PrpgPlayerActor } from "../actors/player.actor";
import { BodyComponent, TransformComponent, MotionComponent, GraphicsComponent, ColliderComponent, ActionsComponent } from "excalibur";
import { Resources } from "../resources";
import { MapScene } from "../scenes/map.scene";

export class PrpgPlayerSystem extends System<PrpgPlayerComponent | PrpgCharacterComponent | BodyComponent | TransformComponent | MotionComponent | GraphicsComponent | ColliderComponent | ActionsComponent> {
    public readonly types = [PRPG_PLAYER_TYPE] as const;
    public priority = 99;
    public systemType = SystemType.Update;
    private scene: MapScene;
    private resources = Resources.getSingleton();

    constructor(private readonly input: Input.EngineInput) {
        super();
    }

    private initCamera(entity: PrpgPlayerActor) {
        this.scene.camera.strategy.elasticToActor(entity, .9, .9);
        this.scene.camera.strategy.lockToActor(entity);
        const mapBox = new BoundingBox({
           left: 0,
           top: 0,
           right: this.resources.maps["player_house_bedroom.tmx"].data.width * this.resources.maps["player_house_bedroom.tmx"].data.tileWidth,
           bottom: this.resources.maps["player_house_bedroom.tmx"].data.height * this.resources.maps["player_house_bedroom.tmx"].data.tileHeight,
        });
        this.scene.camera.strategy.limitCameraBounds(mapBox);
    }

    private handleInput(entity: PrpgPlayerActor) {
        const body = entity.get(BodyComponent);
        body.vel.setTo(0, 0);
        const speed = 64;
        const pad1 = this.input.gamepads.at(0);
        const keyboard = this.input.keyboard;
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
    private initTiledMapProperties(entity: PrpgPlayerActor) {
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
            this.initCamera(player);
            this.initTiledMapProperties(player);
        }
    }

    public update(entities: PrpgPlayerActor[], delta: number) {
        for (let entity of entities) {
            this.handleInput(entity);
        }
    }
}