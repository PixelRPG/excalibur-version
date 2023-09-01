import { PrpgBaseComponent, PrpgMultiplayerSyncComponent } from '.'
import { PrpgComponentType, MultiplayerSyncable, TeleportableComponentState, SpawnPointComponentState, TeleportableComponentArgs, MultiplayerSyncDirection, TeleportableComponentUpdates, TeleportAnimation } from '../types';

/**
 * Used to get an entity the ability to teleport to a different map
 */
export class PrpgTeleportableComponent extends PrpgBaseComponent<PrpgComponentType.TELEPORTABLE, TeleportableComponentState, TeleportableComponentArgs> implements MultiplayerSyncable<TeleportableComponentState, TeleportableComponentUpdates> {
  public readonly type = PrpgComponentType.TELEPORTABLE;

  protected _state: TeleportableComponentState = {
    isTeleporting: false,
    teleportTo: undefined,
  };

  protected _updates: TeleportableComponentUpdates = {};

  public get syncDirection() {
    return this.owner?.get(PrpgMultiplayerSyncComponent)?.state.syncDirection || MultiplayerSyncDirection.NONE;
  }

  public resetUpdates(): void {
    if(this.dirty) {
      this._updates = {};
    }
  }

  get dirty() {
    return Object.keys(this._updates).length > 0;
  }

  get state(): Readonly<TeleportableComponentState> {
    return this._state;
  }

  get updates(): Readonly<TeleportableComponentUpdates> {
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

  set teleportTo(value: SpawnPointComponentState | undefined | null) {
    if(value !== this._state.teleportTo) {
      this._state.teleportTo = value;
      this._updates.teleportTo = value;
    }
  }

  public followTeleport: boolean;

  public animation: TeleportAnimation;

  constructor(data: TeleportableComponentArgs = {}) {
    super(data);
    this.followTeleport = data.followTeleport || false;
    this.animation = data.animation || TeleportAnimation.NONE;
    this.initState(data);
  }

  initState(data: TeleportableComponentArgs): TeleportableComponentState {
    const initialState = {...data};
    delete initialState.followTeleport;
    delete initialState.animation;
  
    this._state = {...this._state,  ...initialState};
    this._state.isTeleporting ||= false;

    return this._state;
  }

  applyUpdates(data: Readonly<TeleportableComponentUpdates>) {
    
    this._state.isTeleporting = data.isTeleporting || false;
    // Ignore follow teleport, it is set on each client separately
    // this.data.followTeleport = data.followTeleport;
    this._state.teleportTo = data.teleportTo;
  }
}



