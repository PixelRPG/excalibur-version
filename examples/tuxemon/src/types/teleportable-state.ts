import type { SpawnPointState } from '.';

export interface TeleportableState {
    /** Is `true` if the entity is currently teleporting */
    isTeleporting: boolean;
    /** The target spawn point of the current teleport if any */
    teleportTo?: SpawnPointState;
}
