import type { TiledResource } from '@excaliburjs/plugin-tiled';

export interface MapComponentState {
    map: TiledResource;
    name: string;
    hasStartPoint: boolean;
}

export type MapComponentArgs = Partial<MapComponentState> & Pick<MapComponentState, 'map' | 'name'>;
