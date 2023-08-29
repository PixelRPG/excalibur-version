import { PrpgBaseComponent } from '.'
import { PrpgComponentType, MapComponentState, MapComponentArgs } from '../types';

/**
 * A tiled map component
 */
export class PrpgMapComponent extends PrpgBaseComponent<PrpgComponentType.MAP, MapComponentState, MapComponentArgs> {
  public readonly type = PrpgComponentType.MAP;

  protected _state: MapComponentState;

  constructor(data: MapComponentArgs) {
    const state: MapComponentState = {
      hasStartPoint: false,
      ...data,
    }
    super(state);
    this._state = state;
  }
}



