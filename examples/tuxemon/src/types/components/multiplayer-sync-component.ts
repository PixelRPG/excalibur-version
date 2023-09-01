import { MultiplayerSyncDirection } from '../multiplayer-sync-direction';

export interface PrpgMultiplayerSyncComponentState {
    syncDirection: MultiplayerSyncDirection;
}

export type MultiplayerSyncComponentArgs = PrpgMultiplayerSyncComponentState;