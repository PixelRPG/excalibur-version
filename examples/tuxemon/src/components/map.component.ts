import { Component } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgComponentType } from '../types';

/**
 * A tiled map component
 */
export class PrpgMapComponent extends Component<PrpgComponentType.TILED_MAP> {
  public readonly type = PrpgComponentType.TILED_MAP;

  constructor(public map: TiledMapResource, public name: string, public hasStartPoint = false) {
    super();
  }
}



