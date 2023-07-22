import { Component, InitializeEvent } from 'excalibur';
import { proxy } from 'valtio';
import { PrpgComponentType, MultiplayerSyncable, TeleportableState, SpawnPointState } from '../types';

/**
 * Used to get an entity the ability to teleport to a different map
 */
export class PrpgTeleportableComponent extends Component<PrpgComponentType.TELEPORTABLE> implements MultiplayerSyncable<TeleportableState> {
  public readonly type = PrpgComponentType.TELEPORTABLE;

  private _state: TeleportableState = {
    isTeleporting: false,
    teleportTo: undefined, 
  };

  get updates() {
    return this._state;
  }

  get isTeleporting() {
    return this._state.isTeleporting;
  }

  set isTeleporting(value: boolean) {
    this._state.isTeleporting = value;
  }

  get teleportTo() {
    return this._state.teleportTo;
  }

  set teleportTo(value: SpawnPointState | undefined) {
    this._state.teleportTo = value;
  }

  public followTeleport: boolean;

  constructor(initialState: Partial<TeleportableState> = {}) {
    super();
    this.followTeleport ||= false;
    this._state = this.initState(initialState);
  }

  initState(initialState: Partial<TeleportableState>): TeleportableState {
    this._state = {...this._state, ...initialState};
    this._state.isTeleporting ||= false;

    return proxy(this._state);
  }

  applyUpdates(data: Partial<TeleportableState>) {
    this._state.isTeleporting = data.isTeleporting || false;
    // Ignore follow teleport, it is set on each client separately
    // this.data.followTeleport = data.followTeleport;
    this._state.teleportTo = data.teleportTo;
  }
}



