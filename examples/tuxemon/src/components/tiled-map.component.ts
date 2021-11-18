import { Component } from 'excalibur';
import { PrpgComponentType } from '../types/component-type';
import { TiledMapResource } from '@excaliburjs/plugin-tiled/src/index';

export class PrpgTiledMapComponent extends Component<PrpgComponentType.TILED_MAP> {
  public readonly type = PrpgComponentType.TILED_MAP;

  constructor(public map: TiledMapResource, public name: string) {
    super();
  }
}



