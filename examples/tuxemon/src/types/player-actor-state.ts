import { CharacterComponentState, CharacterComponentUpdates, CharacterComponentArgs, PlayerComponentState, PlayerComponentUpdates, BodyComponentState, BodyComponentUpdates, TeleportableComponentState, TeleportableComponentUpdates } from '.';

export interface PlayerActorState {
    player?: PlayerComponentState;
    character?: CharacterComponentState;
    body?: BodyComponentState;
    teleportable?: TeleportableComponentState;
    name: string
}

export interface PlayerActorUpdates {
    // player?: PlayerUpdates;
    character?: CharacterComponentUpdates;
    body?: BodyComponentUpdates;
    teleportable?: TeleportableComponentUpdates;
    name?: string
}

export interface PlayerActorArgs extends PlayerActorUpdates {
    player?: PlayerComponentState;
    character: CharacterComponentArgs;
}