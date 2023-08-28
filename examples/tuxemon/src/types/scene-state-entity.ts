import type { BodyComponentUpdates, CharacterComponentUpdates, PlayerComponentUpdates, TeleportableComponentUpdates } from '.';

export interface SceneStateEntity {
    "prpg.body"?: BodyComponentUpdates;
    "prpg.character"?: CharacterComponentUpdates;
    "prpg.player"?: PlayerComponentUpdates;
    "prpg.teleportable"?: TeleportableComponentUpdates;
    [componentType: string]: any;
}