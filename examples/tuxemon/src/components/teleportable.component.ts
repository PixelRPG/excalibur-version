import { Component } from 'excalibur';
import { MultiplayerSyncComponent } from '.';
import { PrpgComponentType, MultiplayerSyncable, TeleportableState, SpawnPointState, TeleportableArgs, SyncDirection, TeleportableUpdates, TeleportAnimation } from '../types';

/**
 * Used to get an entity the ability to teleport to a different map
 */
export class PrpgTeleportableComponent extends Component<PrpgComponentType.TELEPORTABLE> implements MultiplayerSyncable<TeleportableState, TeleportableUpdates> {
  public readonly type = PrpgComponentType.TELEPORTABLE;

  private _state: TeleportableState = {
    isTeleporting: false,
    teleportTo: undefined,
    currentSceneName: '',
  };

  private _updates: TeleportableUpdates = {};

  public get syncDirection() {
    return this.owner?.get(MultiplayerSyncComponent)?.syncDirection || SyncDirection.NONE;
  }

  public resetUpdates(): void {
    if(this.dirty) {
      this._updates = {};
    }
  }

  get dirty() {
    return Object.keys(this._updates).length > 0;
  }

  get state(): Readonly<TeleportableState> {
    return this._state;
  }

  get updates(): Readonly<TeleportableUpdates> {
    return this._updates;
  }

  get isTeleporting() {
    return this._state.isTeleporting;
  }

  set isTeleporting(value: boolean) {
    if(value !== this._state.isTeleporting) {
      this._state.isTeleporting = value;
      this._updates.isTeleporting = value;
    }
  }

  get teleportTo() {
    return this._state.teleportTo;
  }

  set teleportTo(value: SpawnPointState | undefined) {
    if(value !== this._state.teleportTo) {
      this._state.teleportTo = value;
      this._updates.teleportTo = value;
    }
  }

  /**
   * It can be useful to know what scene the entity is currently if the entity is teleportable.
   */
  get currentSceneName() {
    return this._state.currentSceneName;
  }

  set currentSceneName(value: string | undefined) {
    if(value !== this._state.currentSceneName) {
      this._state.currentSceneName = value;
      this._updates.currentSceneName = value;
    }
  }

  public followTeleport: boolean;

  public animation: TeleportAnimation;

  constructor(initialState: TeleportableArgs = {}) {
    super();
    this.followTeleport = initialState.followTeleport || false;
    this.animation = initialState.animation || TeleportAnimation.NONE;
    this.initState(initialState);
  }

  initState(_initialState: TeleportableArgs): TeleportableState {
    const initialState = {..._initialState};
    delete initialState.followTeleport;
    delete initialState.animation;
  
    this._state = {...this._state,  ...initialState};
    this._state.isTeleporting ||= false;

    return this._state;
  }

  applyUpdates(data: Readonly<TeleportableUpdates>) {
    
    this._state.isTeleporting = data.isTeleporting || false;
    // Ignore follow teleport, it is set on each client separately
    // this.data.followTeleport = data.followTeleport;
    this._state.teleportTo = data.teleportTo;
  }
}



