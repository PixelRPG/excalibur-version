import { MultiplayerSyncDirection } from '../types';

export const syncable = (has = MultiplayerSyncDirection.NONE, check = MultiplayerSyncDirection.NONE) => {
    return has !== MultiplayerSyncDirection.NONE && (has === MultiplayerSyncDirection.BOTH || check === MultiplayerSyncDirection.BOTH || has === check);
}