import {
  System,
  SystemType,
  vec,
  Logger,
  Query,
  BodyComponent,
  TransformComponent,
  MotionComponent,
  GraphicsComponent,
  ColliderComponent,
  ActionsComponent
} from 'excalibur';
import { PrpgCharacterComponent } from '../components';
import { PrpgCharacterActor } from '../actors';
import { resources } from '../managers/resource.manager';
import { MapScene } from '../scenes/map.scene';
import { CharacterAnimation, PrpgComponentType, Direction } from '../types';

export class PrpgCharacterSystem extends System<
PrpgCharacterComponent | BodyComponent | TransformComponent | MotionComponent | GraphicsComponent | ColliderComponent | ActionsComponent> {
  public readonly types = [PrpgComponentType.CHARACTER] as const;
  public priority = 300;
  public systemType = SystemType.Update;
  private scene?: MapScene;
  private logger = Logger.getInstance();
  private characterQuery?: Query<PrpgCharacterComponent>;

  constructor() {
    super();
  }

  private _handleMotion(entity: PrpgCharacterActor) {
    const motion = entity.get(MotionComponent);
    const graphics = entity.get(GraphicsComponent);
    const character = entity.get(PrpgCharacterComponent);

    // TODO: Store player sprite in PrpgCharacterComponent
    const spriteSheet = resources.sprites.scientist;

    if(!spriteSheet) {
      throw new Error('Sprite sheet not found!');
    }

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

    // Walks Right
    if (motion.vel.x > 0) {
      character.direction = Direction.RIGHT;
      const animation = spriteSheet.getAnimation(CharacterAnimation.RIGHT_WALK);
      if (!animation) {
        this.logger.warn(`${CharacterAnimation.RIGHT_WALK} animation not found!`);
        return;
      }
      graphics.use(animation);
    }
    // Walks Left
    if (motion.vel.x < 0) {
      character.direction = Direction.LEFT;
      const animation = spriteSheet.getAnimation(CharacterAnimation.LEFT_WALK);
      if (!animation) {
        this.logger.warn(`${CharacterAnimation.LEFT_WALK} animation not found!`);
        return;
      }
      graphics.use(animation);
    }
    // Walks Up
    if (motion.vel.y < 0) {
      character.direction = Direction.UP;
      const animation = spriteSheet.getAnimation(CharacterAnimation.BACK_WALK);
      if (!animation) {
        this.logger.warn(`${CharacterAnimation.BACK_WALK} animation not found!`);
        return;
      }
      graphics.use(animation);
    }
    // Walks Down
    if (motion.vel.y > 0) {
      character.direction = Direction.DOWN;
      const animation = spriteSheet.getAnimation(CharacterAnimation.FRONT_WALK);
      if (!animation) {
        this.logger.warn(`${CharacterAnimation.FRONT_WALK} animation not found!`);
        return;
      }
      graphics.use(animation);
    }

    // Stands sill
    if (motion.vel.y === 0 && motion.vel.x === 0) {
      let animation = spriteSheet.getAnimation(CharacterAnimation.FRONT);
      switch (character.direction) {
        case Direction.RIGHT:
          animation = spriteSheet.getAnimation(CharacterAnimation.RIGHT);
          break;
        case Direction.LEFT:
          animation = spriteSheet.getAnimation(CharacterAnimation.LEFT);
          break;
        case Direction.UP:
          animation = spriteSheet.getAnimation(CharacterAnimation.BACK);
          break;
        case Direction.DOWN:
          animation = spriteSheet.getAnimation(CharacterAnimation.FRONT);
          break;
        default:
          this.logger.warn(`Use default direction: ${character.direction}`);
          animation = spriteSheet.getAnimation(CharacterAnimation.FRONT);
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
    super.initialize?.(scene);
    this.scene = scene;

    if (!this.characterQuery) {
      this.characterQuery = this.scene.world.queryManager.createQuery<PrpgCharacterComponent>([PrpgComponentType.CHARACTER]);
    }

    const entities = this.characterQuery.getEntities() as PrpgCharacterActor[];

    // TODO: Store player sprite in PrpgCharacterComponent
    const spriteSheet = resources.sprites.scientist;
    if(!spriteSheet) {
      throw new Error('Sprite sheet not found!');
    }

    const front = spriteSheet.getAnimation('front');
    if (!front) {
      throw new Error('front animation not found!');
    }

    for (const entity of entities) {
      entity.graphics.use(front);
      // entity.on('pointerup', () => {
      //   this.logger.debug('[PrpgCharacterSystem] pointerup');
      // });
    }
  }

  public update(entities: PrpgCharacterActor[], delta: number) {
    for (const entity of entities) {
      this._handleMotion(entity);
    }
  }
}