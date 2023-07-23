import { SceneState } from "./scene-state";

export interface GameState {
    scenes: {
        [sceneName: string]: SceneState;
    }
}

export type GameUpdates = Partial<GameState>;