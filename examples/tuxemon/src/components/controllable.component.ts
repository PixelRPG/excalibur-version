import { PrpgBaseComponent } from '.'
import { PrpgComponentType, ControllableComponentState, ControllableComponentArgs } from '../types';

/**
 * Add this component to a character or menu entity to make it controllable with your keyboard or gamepad.
 */
export class PrpgControllableComponent extends PrpgBaseComponent<PrpgComponentType.CONTROLLABLE, ControllableComponentState, ControllableComponentArgs> {
  public readonly type = PrpgComponentType.CONTROLLABLE;

  protected _state: ControllableComponentState = {};

  constructor(data: ControllableComponentArgs = {}) {
    super(data);
    this._state = data;
  }
}
