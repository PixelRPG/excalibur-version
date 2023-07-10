import { Actor, vec, CollisionType, Logger } from 'excalibur';
import { PrpgCharacterComponent, PrpgPlayerComponent } from '../components';
import { Player, GameOptions } from '../types';

const DEFAULT_ARGS: Partial<Player> = {
  name: 'player',
  width: 12,
  height: 12,
  anchor: vec(0.5, 1),
  collisionType: CollisionType.Active
};

export class PrpgPlayerActor extends Actor {
  private constructor(protected readonly gameOptions: GameOptions, config: Player) {
    super({...DEFAULT_ARGS, ...config});
    this.addComponent(new PrpgCharacterComponent(config.spriteSheet));
    this.addComponent(new PrpgPlayerComponent(config.playerNumber));
  }

  private static instances: {
    [num: number]: {
      [num: number]: PrpgPlayerActor | undefined;
    }  | undefined;
  } = {};

  static getInstances(gameOptions: GameOptions) {
    return this.instances[gameOptions.playerNumber] ||= {};
  }

  static getInstanceByPlayer(gameOptions: GameOptions, playerNumber: number) {
    const instances = this.getInstances(gameOptions);
    return instances[playerNumber];
  }

  static createInstance(gameOptions: GameOptions, config: Player) {

    const instance = this.getInstanceByPlayer(gameOptions, config.playerNumber);

    if (instance) {
      Logger.getInstance().warn(`[PrpgPlayerActor] Player ${config.playerNumber} already exists!`);
      return instance;
    }
    
    const instances = this.getInstances(gameOptions);
    instances[config.playerNumber] = new this(gameOptions, config);
    return instances[config.playerNumber] as PrpgPlayerActor;
  }
}