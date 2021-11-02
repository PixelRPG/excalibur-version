import { System, SystemType, Input, BoundingBox } from "excalibur";
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

    constructor(private readonly input: Input.EngineInput) {
        super();
    }

    private initCamera(entity: PrpgPlayerActor) {
        this.scene.camera.strategy.elasticToActor(entity, .9, .9);
        this.scene.camera.strategy.lockToActor(entity);
        const mapBox = new BoundingBox({
           left: 0,
           top: 0,
           right: Resources.map.data.width * Resources.map.data.tileWidth,
           bottom: Resources.map.data.height * Resources.map.data.tileHeight,
        });
        this.scene.camera.strategy.limitCameraBounds(mapBox);
    }

    private handleInput(entity: PrpgPlayerActor) {
        const body = entity.get(BodyComponent);
        body.vel.setTo(0, 0);
        const speed = 64;
        if (this.input.keyboard.isHeld(Input.Keys.Right)) {
           body.vel.x = speed;
        }
        if (this.input.keyboard.isHeld(Input.Keys.Left)) {
           body.vel.x = -speed;
        }
        if (this.input.keyboard.isHeld(Input.Keys.Up)) {
           body.vel.y = -speed;
        }
        if (this.input.keyboard.isHeld(Input.Keys.Down)) {
           body.vel.y = speed;
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