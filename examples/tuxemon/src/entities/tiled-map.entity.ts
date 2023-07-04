import { Entity } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgTiledMapComponent } from '../components';

export const newTiledMapEntity = (map: TiledMapResource, name: string) => {
  return new Entity([new PrpgTiledMapComponent(map, name)]);
};