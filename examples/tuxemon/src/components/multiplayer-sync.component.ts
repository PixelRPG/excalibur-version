import { PrpgBaseComponent } from '.'
import { PrpgComponentType, MultiplayerSyncComponentState, MultiplayerSyncComponentArgs, MultiplayerSyncDirection } from '../types';

/**
 * Used to get an entity the ability to sync with other clients.
 * You can also control the direction of the sync, e.g. only send updates to other players if you are the player of the entity.
 */
export class MultiplayerSyncComponent extends PrpgBaseComponent<PrpgComponentType.MULTIPLAYER_SYNC, MultiplayerSyncComponentState, MultiplayerSyncComponentArgs> {
  public readonly type = PrpgComponentType.MULTIPLAYER_SYNC;

  protected _state: MultiplayerSyncComponentState;

  constructor(data: MultiplayerSyncComponentArgs = { syncDirection: MultiplayerSyncDirection.BOTH }) {
    super(data);
    this._state = data;
  }
}
