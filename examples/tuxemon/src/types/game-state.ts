import { MapSceneState } from "./map-scene-state";

export interface GameState {
    maps: {
        [mapName: string]: MapSceneState;
    }
}