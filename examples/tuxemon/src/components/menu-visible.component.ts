import { TagComponent } from 'excalibur';
import { PrpgComponentType } from '../types';

/**
 * Add this component to an menu entity to make it visible on the screen. 
 */
export class PrpgMenuVisibleComponent extends TagComponent<PrpgComponentType.MENU_VISIBLE> {
  public readonly type = PrpgComponentType.MENU_VISIBLE;

  constructor() {
    super(PrpgComponentType.MENU_VISIBLE);
  }
}
