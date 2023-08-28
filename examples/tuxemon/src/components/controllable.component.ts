import { PrpgBaseComponent } from '.'
import { PrpgComponentType } from '../types';

/**
 * Add this component to a character or menu entity to make it controllable with your keyboard or gamepad.
 */
export class PrpgControllableComponent extends PrpgBaseComponent<PrpgComponentType.CONTROLLABLE, {}> {
  public readonly type = PrpgComponentType.CONTROLLABLE;
  constructor(data: {} = {}) {
    super(data);
  }
}
