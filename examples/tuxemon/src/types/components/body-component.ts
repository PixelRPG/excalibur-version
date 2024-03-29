export interface BodyComponentState {
    /** position */
    pos: {
        /** x position on the map */
        x: number;
        /** y position on the map */
        y: number;
    }

    /** z-index on the map */
    z: number;

    /** velocity */
    vel: {
        /** x velocity */
        x: number;
        /** y velocity */
        y: number;
    };
}

export type BodyComponentUpdates = Partial<BodyComponentState>;

export type BodyComponentArgs = Partial<BodyComponentState>;