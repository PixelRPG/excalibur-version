import { System, SystemType, vec, Logger } from 'excalibur';
import { PrpgCharacterComponent, PRPG_CHARACTER_TYPE } from '../components/character.component';
import { PrpgCharacterActor } from '../actors/character.actor';
import { BodyComponent, TransformComponent, MotionComponent, GraphicsComponent, ColliderComponent, ActionsComponent } from 'excalibur';
import { resources } from '../resources';
import { MapScene } from '../scenes/map.scene';
import { Direction } from '../types/direction';
import { CharacterAnimation } from '../types/character-animation';

export class PrpgCharacterSystem extends System<
PrpgCharacterComponent | BodyComponent | TransformComponent | MotionComponent | GraphicsComponent | ColliderComponent | ActionsComponent> {
  public readonly types = [PRPG_CHARACTER_TYPE] as const;
  public priority = 98;
  public systemType = SystemType.Update;
  private scene: MapScene;
  private logger = Logger.getInstance();

  constructor() {
    super();
  }


  private _handleMotion(entity: PrpgCharacterActor) {
    const motion = entity.get(MotionComponent);
    const graphics = entity.get(GraphicsComponent);
    const character = entity.get(PrpgCharacterComponent);

    if (!motion) {
      this.logger.warn('MotionComponent to handle character motion not found!');
      return;
    }

    if (!graphics) {
      this.logger.warn('GraphicsComponent to handle character motion not found!');
      return;
    }

    if (!character) {
      this.logger.warn('PrpgCharacterComponent to handle character motion not found!');
      return;
    }

    // Right
    if (motion.vel.x > 0) {
      character.direction = Direction.RIGHT;
      const animation = resources.sprites.scientist.getAnimation(CharacterAnimation.RIGHT_WALK);
      if (!animation) {
        this.logger.warn(`${CharacterAnimation.RIGHT_WALK} animation not found!`);
        return;
      }
      graphics.use(animation);
    }
    // Left
    if (motion.vel.x < 0) {
      character.direction = Direction.LEFT;
      const animation = resources.sprites.scientist.getAnimation(CharacterAnimation.LEFT_WALK);
      if (!animation) {
        this.logger.warn(`${CharacterAnimation.LEFT_WALK} animation not found!`);
        return;
      }
      graphics.use(animation);
    }
    // Up
    if (motion.vel.y < 0) {
      character.direction = Direction.UP;
      const animation = resources.sprites.scientist.getAnimation(CharacterAnimation.BACK_WALK);
      if (!animation) {
        this.logger.warn(`${CharacterAnimation.BACK_WALK} animation not found!`);
        return;
      }
      graphics.use(animation);
    }
    // Down
    if (motion.vel.y > 0) {
      character.direction = Direction.DOWMN;
      const animation = resources.sprites.scientist.getAnimation(CharacterAnimation.FRONT_WALK);
      if (!animation) {
        this.logger.warn(`${CharacterAnimation.FRONT_WALK} animation not found!`);
        return;
      }
      graphics.use(animation);
    }

    // Stands sill
    if (motion.vel.y === 0 && motion.vel.x === 0) {
      let animation = resources.sprites.scientist.getAnimation(CharacterAnimation.FRONT);
      switch (character.direction) {
        case Direction.RIGHT:
          animation = resources.sprites.scientist.getAnimation(CharacterAnimation.RIGHT);
          break;
        case Direction.LEFT:
          animation = resources.sprites.scientist.getAnimation(CharacterAnimation.LEFT);
          break;
        case Direction.UP:
          animation = resources.sprites.scientist.getAnimation(CharacterAnimation.BACK);
          break;
      }
      if (!animation) {
        this.logger.warn(`${character.direction} animation not found!`);
        return;
      }
      graphics.use(animation);
    }
  }

  public initialize?(scene: MapScene) {
    console.debug('[PrpgCharacterSystem] initialize');
    this.scene = scene;
    const characterQuery = this.scene.world.queryManager.createQuery<PrpgCharacterComponent>([PRPG_CHARACTER_TYPE]);

    const entities = characterQuery.getEntities() as PrpgCharacterActor[];
    const front = resources.sprites.scientist.getAnimation('front');
    if (!front) {
      throw new Error('front animation not found!');
    }
    for (const entity of entities) {
      entity.graphics.use(front);
      entity.graphics.offset = vec(0, -12);
      entity.on('pointerup', () => {
        console.debug('[PrpgCharacterSystem] pointerup');
      });
    }
  }

  public update(entities: PrpgCharacterActor[], delta: number) {
    for (const entity of entities) {
      this._handleMotion(entity);
    }
  }
}