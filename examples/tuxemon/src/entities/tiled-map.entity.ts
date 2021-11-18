import { Entity } from 'excalibur';
import { PrpgTiledMapComponent } from '../components/tiled-map.component';
import { TiledMapResource } from '@excaliburjs/plugin-tiled/src/index';

export const newTiledMapEntity = (map: TiledMapResource, name: string) => {
  return new Entity([new PrpgTiledMapComponent(map, name)]);
};