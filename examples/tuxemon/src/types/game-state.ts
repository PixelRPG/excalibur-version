import { SceneState } from "./scene-state";

export interface GameState {
    scenes: {
        [sceneName: string]: SceneState | null;
    }
}

export type GameUpdates = Partial<GameState>;

export type GameArgs = GameUpdates;