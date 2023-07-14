import { PlayerActorState } from '.';

export interface MapSceneState {
    /** The map name */
    name: string;

    players: {
        [playerNumber: number]: PlayerActorState;
    }
}