import { MultiplayerSyncDirection } from '../multiplayer-sync-direction';

export interface MultiplayerSyncComponentState {
    syncDirection: MultiplayerSyncDirection;
}

export type MultiplayerSyncComponentArgs = MultiplayerSyncComponentState;