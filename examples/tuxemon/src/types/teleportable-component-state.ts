import type { SpawnPointComponentState, TeleportAnimation } from '.';

export interface TeleportableComponentState {
    /** Is `true` if the entity is currently teleporting */
    isTeleporting: boolean;
    /** The target spawn point of the current teleport if any */
    teleportTo?: SpawnPointComponentState | null;
}

export type TeleportableComponentUpdates = Partial<TeleportableComponentState>;

export interface TeleportableComponentArgs extends TeleportableComponentUpdates {
    followTeleport?: boolean;
    animation?: TeleportAnimation;
}