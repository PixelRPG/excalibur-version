import type { SpawnPointComponentState } from './index';

export interface TeleportMessage {
    from: {
        sceneName: string;
    }
    to: SpawnPointComponentState;
}