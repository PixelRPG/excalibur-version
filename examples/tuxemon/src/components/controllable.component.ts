import { TagComponent } from 'excalibur';
import { PrpgComponentType } from '../types';

/**
 * Add this component to a character or menu entity to make it controllable with your keyboard or gamepad.
 */
export class PrpgControllableComponent extends TagComponent<PrpgComponentType.CONTROLLABLE> {
  public readonly type = PrpgComponentType.CONTROLLABLE;
  constructor() {
    super(PrpgComponentType.CONTROLLABLE);
  }
}
