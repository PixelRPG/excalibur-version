import { Actor, vec, CollisionType, Logger } from 'excalibur';
import { PrpgCharacterComponent, PrpgPlayerComponent } from '../components';
import { Player } from '../types';

const DEFAULT_ARGS: Partial<Player> = {
  name: 'player',
  width: 12,
  height: 12,
  anchor: vec(0.5, 1),
  collisionType: CollisionType.Active
};

export class PrpgPlayerActor extends Actor {
  private constructor(config: Player) {
    super({...DEFAULT_ARGS, ...config});
    this.addComponent(new PrpgCharacterComponent(config.spriteSheet));
    this.addComponent(new PrpgPlayerComponent(config.playerNumber));
  }
  private static instances: {
    [num: number]: PrpgPlayerActor;
  } = {};

  static createInstance(config: Player) {
    if (this.instances[config.playerNumber]) {
      Logger.getInstance().warn(`[PrpgPlayerActor] Player ${config.playerNumber} already exists!`);
      return this.instances[config.playerNumber];
    }
    this.instances[config.playerNumber] = new this(config);
    return this.instances[config.playerNumber];
  }

  static getByPlayerNumber(playerNumber: number) {
    return this.instances[playerNumber];
  }
}