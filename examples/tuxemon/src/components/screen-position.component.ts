import { PrpgBaseComponent } from '.'
import { PrpgComponentType, ScreenPositionComponentState, ScreenPositionComponentArgs } from '../types';

/**
 * A component for entities that are fixed positioned on the screen, e.g. a menu.
 */
export class PrpgScreenPositionComponent extends PrpgBaseComponent<PrpgComponentType.SCREEN_POSITION, ScreenPositionComponentState> {
  public readonly type = PrpgComponentType.SCREEN_POSITION;

  protected _state: ScreenPositionComponentState;

  constructor(data: ScreenPositionComponentArgs) {
    const state = data = { ...data, x: data.x || 0, y: data.y || 0, z: data.z || 0};
    super(state);
    this._state = state;
  }
}
