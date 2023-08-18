import type { BodyUpdates, CharacterUpdates, PlayerUpdates, TeleportableUpdates } from '.';

export interface SceneStateEntity {
    "prpg.body"?: BodyUpdates;
    "prpg.character"?: CharacterUpdates;
    "prpg.player"?: PlayerUpdates;
    "prpg.teleportable"?: TeleportableUpdates;
    [componentType: string]: any;
}