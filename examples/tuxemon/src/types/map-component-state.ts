import type { TiledMapResource } from '@excaliburjs/plugin-tiled';

export interface MapComponentState {
    map: TiledMapResource;
    name: string;
    hasStartPoint: boolean;
}