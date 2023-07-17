import { PlayerActorState } from '.';

export interface MapSceneState {
    /** The map name */
    name: string;

    /** The player state from which this update comes */
    players: {
        [playerNumber: number]: PlayerActorState;
    }
}