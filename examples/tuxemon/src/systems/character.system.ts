import { System, SystemType, vec } from "excalibur";
import { PrpgCharacterComponent, PRPG_CHARACTER_TYPE } from "../components/character.component";
import { PrpgCharacterActor } from "../actors/character.actor";
import { BodyComponent, TransformComponent, MotionComponent, GraphicsComponent, ColliderComponent, ActionsComponent } from "excalibur";
import { Resources } from "../resources";
import { MapScene } from "../scenes/map.scene";
import { Direction } from "../types/direction";
import { CharacterAnimation } from "../types/character-animation";

export class PrpgCharacterSystem extends System<PrpgCharacterComponent | BodyComponent | TransformComponent | MotionComponent | GraphicsComponent | ColliderComponent | ActionsComponent> {
    public readonly types = [PRPG_CHARACTER_TYPE] as const;
    public priority = 98;
    public systemType = SystemType.Update;
    private scene: MapScene;

    constructor() {
        super();
    }


    private handleMotion(entity: PrpgCharacterActor) {
        const motion = entity.get(MotionComponent);
        const graphics = entity.get(GraphicsComponent);
        const character = entity.get(PrpgCharacterComponent);

        // Right
        if(motion.vel.x > 0) {
            character.direction = Direction.RIGHT;
            const animation = Resources.scientist.getAnimation(CharacterAnimation.RIGHT_WALK);
            graphics.use(animation);
        }
        // Left
        if(motion.vel.x < 0) {
            character.direction = Direction.LEFT;
            const animation = Resources.scientist.getAnimation(CharacterAnimation.LEFT_WALK);
            graphics.use(animation);
        }
        // Up
        if(motion.vel.y < 0) {
            character.direction = Direction.UP;
            const animation = Resources.scientist.getAnimation(CharacterAnimation.BACK_WALK);
            graphics.use(animation);
        }
        // Down
        if(motion.vel.y > 0) {
            character.direction = Direction.DOWMN;
            const animation = Resources.scientist.getAnimation(CharacterAnimation.FRONT_WALK);
            graphics.use(animation);
        }

        // Stands sill
        if (motion.vel.y === 0 && motion.vel.x === 0) {
            let animation = Resources.scientist.getAnimation(CharacterAnimation.FRONT);
            switch (character.direction) {
                case Direction.RIGHT:
                    animation = Resources.scientist.getAnimation(CharacterAnimation.RIGHT);
                    break;
                case Direction.LEFT:
                    animation = Resources.scientist.getAnimation(CharacterAnimation.LEFT);
                    break;
                case Direction.UP:
                    animation = Resources.scientist.getAnimation(CharacterAnimation.BACK);
                    break;
            }
            graphics.use(animation);
        }
        

    }

    public initialize?(scene: MapScene) {
        console.debug('[PrpgCharacterSystem] initialize');
        this.scene = scene;
        const characterQuery = this.scene.world.queryManager.createQuery<PrpgCharacterComponent>([PRPG_CHARACTER_TYPE]);

        const entities = characterQuery.getEntities() as PrpgCharacterActor[];
        const front = Resources.scientist.getAnimation('front');
        for (const entity of entities) {
            entity.graphics.use(front);
            entity.graphics.offset = vec(0, -12),
            entity.on('pointerup', () => {
              console.debug('[PrpgCharacterSystem] pointerup');
            });
        }
    }

    public update(entities: PrpgCharacterActor[], delta: number) {
        for (let entity of entities) {
            this.handleMotion(entity);
        }
    }
}