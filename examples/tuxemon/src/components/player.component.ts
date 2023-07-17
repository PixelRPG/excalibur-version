import { Component } from 'excalibur';
import { PrpgComponentType, NetworkSerializable, PlayerState } from '../types';

import { proxy } from 'valtio';

export class PrpgPlayerComponent extends Component<PrpgComponentType.PLAYER> implements NetworkSerializable<PlayerState> {
  public readonly type = PrpgComponentType.PLAYER;

  private _state: PlayerState = {
    playerNumber: -1,
  };

  constructor(protected initialState: PlayerState, public isCurrentPlayer: boolean) {
    super();
    this._state = this.initState(initialState);
  }

  initState(initialState: Partial<PlayerState>): PlayerState {
    this._state = {...this._state, ...initialState};
    console.debug(`PrpgPlayerComponent initState:`, this._state);
    return proxy(this._state);
  }

  get state() {
    return this._state;
  }

  get playerNumber() {
    return this._state.playerNumber;
  }

  deserialize(data: PlayerState) {
    // Player number not changed after creation
    // this._state.playerNumber = data.playerNumber;

    // Current player is not serialized, it is set on each client separately
    // this._state.isCurrentPlayer = data.isCurrentPlayer;
  }
}
