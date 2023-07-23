import { CharacterState, CharacterUpdates, CharacterArgs, PlayerState, PlayerUpdates, BodyState, BodyUpdates, TeleportableState, TeleportableUpdates } from '.';

export interface PlayerActorState {
    player?: PlayerState;
    character?: CharacterState;
    body?: BodyState;
    teleportable?: TeleportableState;
    name: string
}

export interface PlayerActorUpdates {
    // player?: PlayerUpdates;
    character?: CharacterUpdates;
    body?: BodyUpdates;
    teleportable?: TeleportableUpdates;
    name?: string
}

export interface PlayerActorArgs extends PlayerActorUpdates {
    player?: PlayerState;
    character: CharacterArgs;
}