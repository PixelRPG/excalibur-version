import type { TiledMapResource } from '@excaliburjs/plugin-tiled/dist/src/deprecated';

export interface MapComponentState {
    map: TiledMapResource;
    name: string;
    hasStartPoint: boolean;
}

export type MapComponentArgs = Partial<MapComponentState> & Pick<MapComponentState, 'map' | 'name'>;
