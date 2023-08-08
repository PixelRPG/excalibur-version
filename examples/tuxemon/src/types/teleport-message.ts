import type { SpawnPointState } from './index';

export interface TeleportMessage {
    from: {
        sceneName: string;
    }
    to: SpawnPointState;
}