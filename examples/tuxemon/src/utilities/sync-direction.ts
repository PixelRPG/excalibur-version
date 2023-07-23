import { SyncDirection } from '../types';

export const syncable = (has = SyncDirection.NONE, check = SyncDirection.NONE) => {
    return has !== SyncDirection.NONE && (has === SyncDirection.BOTH || check === SyncDirection.BOTH || has === check);
}