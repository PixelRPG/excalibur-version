import type { SceneStateEntity } from '.'

export interface SceneState {
    entities: {
        [entityName: string]: SceneStateEntity
    }
}

export type SceneUpdates = SceneState;