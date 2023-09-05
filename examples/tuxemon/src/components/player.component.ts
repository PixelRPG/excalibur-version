import { PrpgBaseComponent } from '.'
import { PrpgMultiplayerSyncComponent } from '.';
import { PrpgComponentType, MultiplayerSyncable, PlayerComponentState, PlayerComponentArgs, PlayerComponentUpdates, MultiplayerSyncDirection } from '../types';

export class PrpgPlayerComponent extends PrpgBaseComponent<PrpgComponentType.PLAYER, PlayerComponentState, PlayerComponentArgs> implements MultiplayerSyncable<PlayerComponentState, PlayerComponentUpdates> {
  public readonly type = PrpgComponentType.PLAYER;

  dependencies = [PrpgMultiplayerSyncComponent];

  public isCurrentPlayer = false;

  protected _state: PlayerComponentState = {
    playerNumber: -1,
  };

  protected _updates: PlayerComponentUpdates = {};

  constructor(data: PlayerComponentArgs) {
    super(data);
    const state: PlayerComponentState = {
      playerNumber: data.playerNumber,
    }
    this.isCurrentPlayer = data.isCurrentPlayer;
    this.initState(state);
  }

  initState(initialState: Partial<PlayerComponentState>): PlayerComponentState {
    this._state = {...this._state, ...initialState};
    console.debug(`PrpgPlayerComponent initState:`, this._state);
    return this._state;
  }

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

  get state(): Readonly<PlayerComponentState> {
    return this._state;
  }

  get updates(): Readonly<Partial<PlayerComponentState>> {
    return this._state;
  }

  get playerNumber() {
    return this._state.playerNumber;
  }

  set playerNumber(playerNumber: number) {
    this._state.playerNumber = playerNumber;
  }

  applyUpdates(data: PlayerComponentState) {
    if(Object.keys(data).length === 0) return;
    this._state = {...this._state, ...data};
  }
}
