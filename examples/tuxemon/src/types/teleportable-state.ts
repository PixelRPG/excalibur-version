import type { SpawnPointState, TeleportAnimation } from '.';



export interface TeleportableState {
    /** Is `true` if the entity is currently teleporting */
    isTeleporting: boolean;
    /** The target spawn point of the current teleport if any */
    teleportTo?: SpawnPointState | null;
}

export type TeleportableUpdates = Partial<TeleportableState>;

export interface TeleportableArgs extends TeleportableUpdates {
    followTeleport?: boolean;
    animation?: TeleportAnimation;
}