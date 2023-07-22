import { Actor, ActorArgs, vec, CollisionType, Logger, Engine, MotionComponent , BodyComponent} from 'excalibur';
import { PrpgCharacterComponent, PrpgPlayerComponent, PrpgTeleportableComponent, PrpgBodyComponent } from '../components';
import { PlayerState, PlayerActorState, GameOptions, MultiplayerSyncable, PlayerActorArgs, TeleportableState, BodyState } from '../types';
import { proxy } from 'valtio';

const DEFAULT_ACTOR_STATE: Partial<ActorArgs> = {
  width: 12,
  height: 12,
  anchor: vec(0.5, 1),
  collisionType: CollisionType.Active
};

export class PrpgPlayerActor extends Actor implements MultiplayerSyncable<PlayerActorState> {

  private _state: PlayerActorState = {};

  get updates() {
    return this._state;
  }

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
    initialState.player ||= {} as PlayerState;
    initialState.player.playerNumber ||= gameOptions.playerNumber;
    const isCurrentPlayer = gameOptions.playerNumber === initialState.player.playerNumber;
    // If this is the current player, follow the teleportable
    initialState.teleportable ||= {} as TeleportableState;
    initialState.name ||= actor.name || `player-${initialState.player.playerNumber}`;
    actor.name ||= initialState.name;

    super({...DEFAULT_ACTOR_STATE, ...actor});
    
    this.addComponent(new PrpgBodyComponent(initialState.body))
    this.addComponent(new PrpgCharacterComponent(initialState.character));
    this.addComponent(new PrpgPlayerComponent(initialState.player, isCurrentPlayer));

    const teleportable = new PrpgTeleportableComponent(initialState.teleportable);
    teleportable.followTeleport = isCurrentPlayer;
    this.addComponent(teleportable);

    this.logger.debug(`Created player actor ${this.name} for player ${gameOptions.playerNumber}`)
    this._state = this.initState(initialState);    
  }

  initState(initialState: Partial<PlayerActorState>): PlayerActorState {    
    this._state = {...this._state, ...initialState};
    this._state.player = this.player?.updates;
    this._state.character = this.character?.updates;
    this._state.teleportable = this.teleportable?.updates;
    this._state.body = this.ownBody?.updates;

    this.syncBodyState();
    console.debug(`PrpgPlayerActor initState:`, this._state);

    return proxy(this._state);
  }

  syncBodyState() {
    this.ownBody?.syncState();
  //   this._state.body ||= {} as BodyState;
  //  this._state.body.pos ||= {} as BodyState['pos'];
  //  this._state.body.pos.x = this.pos.x || 0;
  //  this._state.body.pos.y = this.pos.y || 0;

  //  this._state.body.vel ||= {} as MotionComponent['vel'];
  //  this._state.body.vel.x = this.vel.x || 0;
  //  this._state.body.vel.y = this.vel.y || 0;
  }

  onPostUpdate(engine: Engine, delta: number) {
    super.onPostUpdate(engine, delta);
    // We need to trigger
    this.syncBodyState();
    // this.logger.debug(`[${this.gameOptions.playerNumber}] PrpgPlayerActor onPostUpdate direction:`, this._state.character?.direction, this.name);
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

  applyUpdates(data: Partial<PlayerActorState>) {
    // Ignore updates for or own player, because we control them
    if (this.player?.isCurrentPlayer) {
      return;
    }
    if(data.player) {
      this.player?.applyUpdates(data.player);
    }
    if(data.character) {
      this.character?.applyUpdates(data.character);
    }
    if(data.teleportable) {
      this.teleportable?.applyUpdates(data.teleportable);
    }
    if(data.body) {
      this.ownBody?.applyUpdates(data.body);
    }
  }
}