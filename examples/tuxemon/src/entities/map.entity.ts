import { Entity } from 'excalibur';
import { TiledResource } from '@excaliburjs/plugin-tiled';
import { PrpgMapComponent } from '../components';

export const newMapEntity = (map: TiledResource, name: string) => {
  const entry = new Entity([new PrpgMapComponent({
    map, name
  })]);
  console.debug('new map entity', entry);
  return entry;
};