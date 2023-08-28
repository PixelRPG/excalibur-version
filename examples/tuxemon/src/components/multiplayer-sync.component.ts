import { PrpgBaseComponent } from '.'
import { PrpgComponentType, MultiplayerSyncComponentState, MultiplayerSyncDirection } from '../types';

/**
 * Used to get an entity the ability to sync with other clients.
 * You can also control the direction of the sync, e.g. only send updates to other players if you are the player of the entity.
 */
export class MultiplayerSyncComponent extends PrpgBaseComponent<PrpgComponentType.MULTIPLAYER_SYNC, MultiplayerSyncComponentState> {
  public readonly type = PrpgComponentType.MULTIPLAYER_SYNC;

  constructor(data: MultiplayerSyncComponentState = { syncDirection: MultiplayerSyncDirection.BOTH }) {
    super(data);
  }
}
