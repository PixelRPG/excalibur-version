import { Component } from 'excalibur';
import { PrpgComponentType, SyncDirection } from '../types';

/**
 * Used to get an entity the ability to sync with other clients.
 * You can also control the direction of the sync.
 */
export class MultiplayerSyncComponent extends Component<PrpgComponentType.MULTIPLAYER_SYNC> {
  public readonly type = PrpgComponentType.MULTIPLAYER_SYNC;

  constructor(public syncDirection = SyncDirection.BOTH) {
    super();
  }
}
