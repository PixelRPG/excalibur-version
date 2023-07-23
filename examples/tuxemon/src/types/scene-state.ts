export interface SceneState {
    entities: {
        [entityName: string]: {
            [componentType: string]: any;
        }
    }
}

export type SceneUpdates = SceneState;