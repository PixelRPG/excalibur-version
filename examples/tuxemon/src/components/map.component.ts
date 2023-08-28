import { PrpgBaseComponent } from '.'
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgComponentType, MapComponentState } from '../types';

/**
 * A tiled map component
 */
export class PrpgMapComponent extends PrpgBaseComponent<PrpgComponentType.MAP, MapComponentState> {
  public readonly type = PrpgComponentType.MAP;

  constructor(data: Partial<MapComponentState> = { hasStartPoint: false }) {
    super(data);
  }
}



