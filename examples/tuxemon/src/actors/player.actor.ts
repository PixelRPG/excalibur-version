import { Actor, ActorArgs, vec, CollisionType, Logger } from 'excalibur';
import { PrpgCharacterComponent, PrpgPlayerComponent, PrpgTeleportableComponent, PrpgBodyComponent, PrpgMultiplayerSyncComponent, PrpgControllableComponent } from '../components';
import { PlayerComponentState, GameOptions, PlayerActorArgs, TeleportableComponentState, MultiplayerSyncDirection, TeleportAnimation } from '../types';

const DEFAULT_ACTOR_STATE: Partial<ActorArgs> = {
  width: 12,
  height: 12,
  anchor: vec(0.5, 1),
  collisionType: CollisionType.Active
};

export class PrpgPlayerActor extends Actor {

  get player() {
    return this.get(PrpgPlayerComponent);
  }

  get ownBody() {
    return this.get(PrpgBodyComponent);
  }

  get character() {
    return this.get(PrpgCharacterComponent);
  }

  get teleportable() {
    return this.get(PrpgTeleportableComponent);
  }

  private constructor(private readonly gameOptions: GameOptions, actor: ActorArgs, initialState: PlayerActorArgs) {
    initialState.player ||= {} as PlayerComponentState;
    initialState.player.playerNumber ||= gameOptions.playerNumber;
    const isCurrentPlayer = gameOptions.playerNumber === initialState.player.playerNumber;
    // If this is the current player, follow the teleportable
    initialState.teleportable ||= {} as TeleportableComponentState;
    initialState.name ||= actor.name || `player-${initialState.player.playerNumber}`;
    actor.name ||= initialState.name;

    super({...DEFAULT_ACTOR_STATE, ...actor});
     
    this.addComponent(new PrpgMultiplayerSyncComponent({
      syncDirection: isCurrentPlayer ? MultiplayerSyncDirection.OUT : MultiplayerSyncDirection.IN,
    }));
    this.addComponent(new PrpgBodyComponent(initialState.body))
    this.addComponent(new PrpgCharacterComponent(initialState.character));
    this.addComponent(new PrpgPlayerComponent({
      playerNumber: initialState.player?.playerNumber,
      isCurrentPlayer
    }));

    this.addComponent(new PrpgTeleportableComponent({
      ...initialState.teleportable,
      followTeleport: isCurrentPlayer,
      animation: isCurrentPlayer ? TeleportAnimation.FadeScreen : TeleportAnimation.NONE
    }));

    // The current player is controllable
    if(isCurrentPlayer) {
      this.addComponent(new PrpgControllableComponent());
    }

    this.logger.debug(`Created player actor ${this.name} for player ${gameOptions.playerNumber}`)  
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
  getPlayers() {
    return PrpgPlayerActor.getPlayers(this.gameOptions);
  }

  static getPlayers(gameOptions: GameOptions) {
    return PrpgPlayerActor.instances[gameOptions.playerNumber] ||= {};
  }

  /**
   * Get singleton instance by player number, each player in a splitscreen has is's own singleton instance of each player.
   * With this method you can get the instance of any player from any map.
   * @param gameOptions 
   * @param playerNumber 
   * @returns
   */
  getPlayer(playerNumber: number) {
    return PrpgPlayerActor.getPlayer(this.gameOptions, playerNumber);
  }
  /**
   * Get player actor by player number from any map (each player in a splitscreen has is's own singleton instance of each player).
   * @param gameOptions 
   * @param playerNumber 
   * @returns 
   */
  static getPlayer(gameOptions: GameOptions, playerNumber: number): PrpgPlayerActor | undefined {
    return PrpgPlayerActor.instances[gameOptions.playerNumber]?.[playerNumber];
  }

  getCurrentPlayer() {
    return PrpgPlayerActor.getCurrentPlayer(this.gameOptions);
  }

  static getCurrentPlayer(gameOptions: GameOptions): PrpgPlayerActor | undefined {
    return PrpgPlayerActor.getPlayer(gameOptions, gameOptions.playerNumber);
  }

  /**
   * Create a new player instance (singleton per player number)
   * @param gameOptions 
   * @param config 
   * @returns 
   */
  static newPlayer(gameOptions: GameOptions, actor: ActorArgs, config: PlayerActorArgs) {

    const playerNumber = config.player?.playerNumber;
    if (playerNumber === undefined) {
      throw new Error(`[PrpgPlayerActor] Player number is required!`);
    }
    const instance = this.getPlayer(gameOptions, playerNumber);

    if (instance) {
      Logger.getInstance().warn(`[PrpgPlayerActor] Player ${playerNumber} already exists!`);
      return instance;
    }
    
    const instances = this.getPlayers(gameOptions);
    instances[playerNumber] = new this(gameOptions, actor, config);
    return instances[playerNumber] as PrpgPlayerActor;
  }
}