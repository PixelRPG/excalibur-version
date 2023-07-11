import { Actor, vec, CollisionType, Logger } from 'excalibur';
import { PrpgCharacterComponent, PrpgPlayerComponent } from '../components';
import { Player, GameOptions, MultiplayerData } from '../types';

const DEFAULT_ARGS: Partial<Player> = {
  name: 'player',
  width: 12,
  height: 12,
  anchor: vec(0.5, 1),
  collisionType: CollisionType.Active
};

export class PrpgPlayerActor extends Actor implements MultiplayerData {
  private constructor(protected readonly gameOptions: GameOptions, config: Player) {
    super({...DEFAULT_ARGS, ...config});
    const isCurrentPlayer = gameOptions.playerNumber === config.playerNumber;
    this.addComponent(new PrpgCharacterComponent(config.spriteSheet));
    this.addComponent(new PrpgPlayerComponent(config.playerNumber, isCurrentPlayer));
  }

  private static instances: {
    [num: number]: {
      [num: number]: PrpgPlayerActor | undefined;
    }  | undefined;
  } = {};

  /**
   * Get singleton instances by player number, each player in a splitscreen has is's own singleton instances
   * @param gameOptions 
   * @param config 
   */
  static getPlayers(gameOptions: GameOptions) {
    return this.instances[gameOptions.playerNumber] ||= {};
  }

  /**
   * Get singleton instance by player number, each player in a splitscreen has is's own singleton instance of each player
   * @param gameOptions 
   * @param playerNumber 
   * @returns 
   */
  static getPlayer(gameOptions: GameOptions, playerNumber: number) {
    const instances = this.getPlayers(gameOptions);
    return instances[playerNumber];
  }

  /**
   * Create a new player instance
   * @param gameOptions 
   * @param config 
   * @returns 
   */
  static newPlayer(gameOptions: GameOptions, config: Player) {

    const instance = this.getPlayer (gameOptions, config.playerNumber);

    if (instance) {
      Logger.getInstance().warn(`[PrpgPlayerActor] Player ${config.playerNumber} already exists!`);
      return instance;
    }
    
    const instances = this.getPlayers(gameOptions);
    instances[config.playerNumber] = new this(gameOptions, config);
    return instances[config.playerNumber] as PrpgPlayerActor;
  }

  get player() {
    return this.get(PrpgPlayerComponent);
  }

  get character() {
    return this.get(PrpgCharacterComponent);
  }

  serialize() {
    // Ignore body updates for other players, because they are not controlled by us
    if (!this.player?.isCurrentPlayer) {
      return;
    }
    
    return {
      player: this.player?.serialize(),
      character: this.character?.serialize(),
      body: {
        vel: this.body.vel,
        pos: this.body.pos
      }
    }
  }

  deserialize(data: any) {
    // Ignore body updates for or own player, because we control them
    if (this.player?.isCurrentPlayer) {
      return;
    }
    this.player?.deserialize(data.player);
    this.character?.deserialize(data.character);
    this.body.vel = data.body.vel;
    this.body.pos = data.body.pos;
  }
}