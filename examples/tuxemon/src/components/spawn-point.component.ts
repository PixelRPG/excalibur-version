import { Component } from 'excalibur';
import { PrpgComponentType } from '../types/component-type';
import { TiledMapResource } from '@excaliburjs/plugin-tiled/src/index';

export class PrpgSpawnPointComponent extends Component<PrpgComponentType.SPAWN_POINT> {
  public readonly type = PrpgComponentType.SPAWN_POINT;

  constructor(public x: number, public y: number, public z = 0) {
    super();
  }
}



