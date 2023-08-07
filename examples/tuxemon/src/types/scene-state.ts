import type { BodyUpdates, CharacterUpdates, PlayerUpdates, TeleportableUpdates } from '.';

export interface SceneState {
    entities: {
        [entityName: string]: {
            "prpg.body"?: BodyUpdates;
            "prpg.character"?: CharacterUpdates;
            "prpg.player"?: PlayerUpdates;
            "prpg.teleportable"?: TeleportableUpdates;
            [componentType: string]: any;
        };
    }
}

export type SceneUpdates = SceneState;