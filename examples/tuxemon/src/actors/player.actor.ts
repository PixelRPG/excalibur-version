import { Actor, ActorArgs, vec, CollisionType, Logger, Engine } from 'excalibur';
import { PrpgCharacterComponent, PrpgPlayerComponent, PrpgTeleportableComponent } from '../components';
import { PlayerState, PlayerActorState, GameOptions, NetworkSerializable, PlayerActorArgs, TeleportableState, BodyState, CharacterArgs } from '../types';
import { proxy } from 'valtio';

const DEFAULT_STATE: Partial<PlayerActorState> = {

};

const DEFAULT_ACTOR_STATE: Partial<ActorArgs> = {
  width: 12,
  height: 12,
  anchor: vec(0.5, 1),
  collisionType: CollisionType.Active
};

export class PrpgPlayerActor extends Actor implements NetworkSerializable<PlayerActorState> {

  private _state: PlayerActorState = {};

  get state() {
    return this._state;
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

  private constructor(private readonly gameOptions: GameOptions, actor: ActorArgs, initialState: PlayerActorArgs) {
    initialState.player ||= {} as PlayerState;
    initialState.player.playerNumber ||= gameOptions.playerNumber;
    const isCurrentPlayer = gameOptions.playerNumber === initialState.player.playerNumber;
    // If this is the current player, follow the teleportable
    initialState.teleportable ||= {} as TeleportableState;
    initialState.name ||= actor.name || `player-${initialState.player.playerNumber}`;
    actor.name ||= initialState.name;

    super({...DEFAULT_ACTOR_STATE, ...actor});
    
    this.addComponent(new PrpgCharacterComponent(initialState.character));
    this.addComponent(new PrpgPlayerComponent(initialState.player, isCurrentPlayer));

    const teleportable = new PrpgTeleportableComponent(initialState.teleportable);
    teleportable.followTeleport = isCurrentPlayer;
    this.addComponent(teleportable);
   
    this._state = this.initState(initialState);    
  }

  initState(initialState: Partial<PlayerActorState>): PlayerActorState {    
    this._state = {...this.state, ...initialState};
    this._state.player = this.player?.state;
    this._state.character = this.character?.state;
    this._state.teleportable = this.teleportable?.state;

    this.syncBodyState();

    return proxy(this._state);
  }

  /**
   * TODO: Extend BodyComponent / Actor, to make this sync automatic
   */
  syncBodyState() {
    this.state.body ||= {} as BodyState;
    this.state.body.pos ||= {} as BodyState['pos'];
    this.state.body.vel ||= {} as BodyState['vel'];
    this.state.body.pos.x = this.pos.x || 0;
    this.state.body.pos.y = this.pos.y || 0;
    this.state.body.vel.x = this.vel.x || 0;
    this.state.body.vel.y = this.vel.y || 0;
    return this.state.body;
  }

  onPostUpdate(engine: Engine, delta: number) {
    super.onPostUpdate(engine, delta);
    this.syncBodyState();
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
   * Get current player you are controlling
   * @param gameOptions 
   */
  static getPlayer(gameOptions: GameOptions): PrpgPlayerActor;

  /**
   * Get singleton instance by player number, each player in a splitscreen has is's own singleton instance of each player
   * @param gameOptions 
   * @param playerNumber 
   * @returns 
   */
  static getPlayer(gameOptions: GameOptions, playerNumber?: number): PrpgPlayerActor | undefined;

  static getPlayer(gameOptions: GameOptions, playerNumber?: number) {
    playerNumber ||= gameOptions.playerNumber;
    const instances = this.getPlayers(gameOptions);
    return instances[playerNumber];
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
    const instance = this.getPlayer (gameOptions, playerNumber);

    if (instance) {
      Logger.getInstance().warn(`[PrpgPlayerActor] Player ${playerNumber} already exists!`);
      return instance;
    }
    
    const instances = this.getPlayers(gameOptions);
    instances[playerNumber] = new this(gameOptions, actor, config);
    return instances[playerNumber] as PrpgPlayerActor;
  }

  deserialize(data: Partial<PlayerActorState>) {
    // Ignore updates for or own player, because we control them
    if (this.player?.isCurrentPlayer) {
      return;
    }
    if(data.player) {
      this.player?.deserialize(data.player);
    }
    if(data.character) {
      this.character?.deserialize(data.character);
    }
    if(data.teleportable) {
      this.teleportable?.deserialize(data.teleportable);
    }
    if(data.body) {
      if(data.body.vel.x) {
        this.body.vel.x = data.body.vel.x;
        this.vel.x = this.body.vel.x;
      }
      if(data.body.vel.y) {
        this.body.vel.y = data.body.vel.y;
        this.vel.y = this.body.vel.y;
      }
      if(data.body.pos.x) {
        this.body.pos.x = data.body.pos.x;
        this.pos.x = this.body.pos.x;
      }
      if(data.body.pos.y) {
        this.body.pos.y = data.body.pos.y;
        this.pos.y = this.body.pos.y;
      }
      this.syncBodyState();
    }
    
  }
}