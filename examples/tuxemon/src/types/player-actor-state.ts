import { CharacterState, CharacterArgs, PlayerState, BodyState, TeleportableState, ActorState } from '.';

export interface PlayerActorState extends ActorState {
    player?: PlayerState;
    character?: CharacterState;
    body?: BodyState;
    teleportable?: TeleportableState;
}

export interface PlayerActorArgs extends PlayerActorState {
    character: CharacterArgs;
}