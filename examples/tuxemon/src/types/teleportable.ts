import type { SpawnPoint } from '../types';

export interface Teleportable {
    /** Is `true` if the entity is currently teleporting */
    isTeleporting: boolean;
    /** If true, this instance of the game follows the entity to the new map scene */
    followTeleport: boolean;
    /** The target spawn point of the current teleport if any */
    teleportTo?: SpawnPoint;
}