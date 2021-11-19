import { Component } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled/src/index';
import { PrpgComponentType } from '../types';

export class PrpgTiledMapComponent extends Component<PrpgComponentType.TILED_MAP> {
  public readonly type = PrpgComponentType.TILED_MAP;

  constructor(public map: TiledMapResource, public name: string, public hasStartPoint = false) {
    super();
  }
}



