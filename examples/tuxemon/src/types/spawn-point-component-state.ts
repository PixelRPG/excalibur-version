import type { Direction } from "./direction";
import type { SpawnPointType } from "./spawn-point-type";

export interface SpawnPointComponentState {
    type: SpawnPointType;
    /** x position on the map */
    x: number;
    /** y position on the map */
    y: number;
    /** z-index on the map */
    z: number;
    /** The direction the entity is facing */
    direction: Direction;
    /** The entity for which this span point is, mostly this is the current player */
    entityName: string;
    /** The map scene name this spawn point is on */
    sceneName: string;
    /** The name of the scene the entity came from */
    from: {
        x: number;
        y: number;
        z: number;
        /** The map scene name this spawn point is on */
        sceneName: string;
    }
}