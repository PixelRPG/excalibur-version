import { Entity } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled/src/deprecated';
import { PrpgMapComponent } from '../components';

export const newMapEntity = (map: TiledMapResource, name: string) => {
  const entry = new Entity([new PrpgMapComponent({
    map, name
  })]);
  console.debug('new map entity', entry);
  return entry;
};