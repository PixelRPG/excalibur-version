import { Component } from 'excalibur';
import { MultiplayerSyncComponent } from '.';
import { PrpgComponentType, MultiplayerSyncable, PlayerState, PlayerUpdates, SyncDirection } from '../types';

export class PrpgPlayerComponent extends Component<PrpgComponentType.PLAYER> implements MultiplayerSyncable<PlayerState, PlayerUpdates> {
  public readonly type = PrpgComponentType.PLAYER;

  private _state: PlayerState = {
    playerNumber: -1,
  };

  private _updates: PlayerUpdates = {};

  constructor(protected initialState: PlayerState, public isCurrentPlayer: boolean) {
    super();
    this.initState(initialState);
  }

  initState(initialState: Partial<PlayerState>): PlayerState {
    this._state = {...this._state, ...initialState};
    console.debug(`PrpgPlayerComponent initState:`, this._state);
    return this._state;
  }

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

  get state(): Readonly<PlayerState> {
    return this._state;
  }

  get updates(): Readonly<Partial<PlayerState>> {
    return this._state;
  }

  get playerNumber() {
    return this._state.playerNumber;
  }

  set playerNumber(playerNumber: number) {
    this._state.playerNumber = playerNumber;
  }

  applyUpdates(data: PlayerState) {
    if(Object.keys(data).length === 0) return;
    this._state = {...this._state, ...data};
  }
}
