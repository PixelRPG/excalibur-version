import { Entity } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgMapComponent } from '../components';

export const newMapEntity = (map: TiledMapResource, name: string) => {
  return new Entity([new PrpgMapComponent(map, name)]);
};