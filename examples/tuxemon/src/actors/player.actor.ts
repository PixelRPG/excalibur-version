import { Actor, ActorArgs, vec, CollisionType, Logger } from 'excalibur';
import { PrpgCharacterComponent, PrpgPlayerComponent, PrpgTeleportableComponent } from '../components';
import { Player, GameOptions, NetworkSerializable, Character, Teleportable } from '../types';

const DEFAULT_ARGS: Partial<Player> & Partial<ActorArgs> = {
  name: 'player',
  width: 12,
  height: 12,
  anchor: vec(0.5, 1),
  collisionType: CollisionType.Active
};

export class PrpgPlayerActor extends Actor implements NetworkSerializable {
  private constructor(protected readonly gameOptions: GameOptions, config: Player & Character & Partial<ActorArgs> & Partial<Teleportable>) {
    config.isCurrentPlayer = gameOptions.playerNumber === config.playerNumber;
    // If this is the current player, follow the teleportable
    config.followTeleport = config.isCurrentPlayer;
    config.name ||= `player-${config.playerNumber}`;
    super({...DEFAULT_ARGS, ...config});
    this.addComponent(new PrpgCharacterComponent({
      spriteSheet: config.spriteSheet,
      direction: config.direction,
    }));
    this.addComponent(new PrpgPlayerComponent({
      playerNumber: config.playerNumber,
      isCurrentPlayer: config.isCurrentPlayer,
    }));
    this.addComponent(new PrpgTeleportableComponent({
      followTeleport: config.followTeleport,
      isTeleporting: config.isTeleporting,
      teleportTo: config.teleportTo,
    }));
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
  static newPlayer(gameOptions: GameOptions, config: Player & Character & Partial<ActorArgs>) {

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

  get teleportable() {
    return this.get(PrpgTeleportableComponent);
  }

  serialize() {
    // Do not send updates for other players, because they are not controlled by us
    if (!this.player?.data.isCurrentPlayer) {
      return;
    }
    
    return {
      player: this.player?.serialize(),
      character: this.character?.serialize(),
      body: {
        vel: this.body.vel,
        pos: this.body.pos
      },
      teleportable: this.teleportable?.serialize()
    }
  }

  deserialize(data: any) {
    // Ignore updates for or own player, because we control them
    if (this.player?.data.isCurrentPlayer) {
      return;
    }
    this.player?.deserialize(data.player);
    this.character?.deserialize(data.character);
    this.teleportable?.deserialize(data.teleportable);
    this.body.vel = data.body.vel;
    this.body.pos = data.body.pos;
  }
}