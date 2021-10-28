import { System, SystemType, Entity, Engine, Input, Scene, BoundingBox } from "excalibur";
import { PrpgPlayerComponent } from "../components/player.component";
import { PrpgPlayerActor } from "../actors/player.actor";
import { BodyComponent, TransformComponent, MotionComponent, GraphicsComponent, ColliderComponent, ActionsComponent } from "excalibur";
import { Resources } from "../resources";

export class PrpgPlayerSystem extends System<PrpgPlayerComponent | BodyComponent | TransformComponent | MotionComponent | GraphicsComponent | ColliderComponent | ActionsComponent> {
    public readonly types = ["prpg.player"] as const;
    public priority = 99;
    public systemType = SystemType.Update;

    constructor(private readonly game: Engine) {
        super();
    }

    private initCamera(entity: PrpgPlayerActor) {
        this.game.currentScene.camera.strategy.elasticToActor(entity, .9, .9);
        this.game.currentScene.camera.strategy.lockToActor(entity);
        const mapBox = new BoundingBox({
           left: 0,
           top: 0,
           right: Resources.map.data.width * Resources.map.data.tileWidth,
           bottom: Resources.map.data.height * Resources.map.data.tileHeight,
        });
        this.game.currentScene.camera.strategy.limitCameraBounds(mapBox);
    }

    private handleInput(entity: PrpgPlayerActor) {
        const body = entity.get(BodyComponent);
        body.vel.setTo(0, 0);
        const speed = 64;
        if (this.game.input.keyboard.isHeld(Input.Keys.Right)) {
           body.vel.x = speed;
        }
        if (this.game.input.keyboard.isHeld(Input.Keys.Left)) {
           body.vel.x = -speed;
        }
        if (this.game.input.keyboard.isHeld(Input.Keys.Up)) {
           body.vel.y = -speed;
        }
        if (this.game.input.keyboard.isHeld(Input.Keys.Down)) {
           body.vel.y = speed;
        }
    }

    public initialize?(screne: Scene) {
        const playerQuery = screne.world.queryManager.createQuery<PrpgPlayerComponent>(["prpg.player"]);

        const players = playerQuery.getEntities() as PrpgPlayerActor[];
        for (const player of players) {
            this.initCamera(player);
        }
    }

    public update(entities: PrpgPlayerActor[], delta: number) {
        for (let entity of entities) {
            this.handleInput(entity);
        }
    }
}