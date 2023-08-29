import { PrpgBaseComponent } from '.'
import { PrpgComponentType, MenuVisibleComponentState, MenuVisibleComponentArgs } from '../types';

/**
 * Add this component to an menu entity to make it visible on the screen. 
 */
export class PrpgMenuVisibleComponent extends PrpgBaseComponent<PrpgComponentType.MENU_VISIBLE, MenuVisibleComponentState, MenuVisibleComponentArgs> {
  public readonly type = PrpgComponentType.MENU_VISIBLE;

  protected _state: MenuVisibleComponentState;

  constructor(data: MenuVisibleComponentArgs = {}) {
    super(data);
    this._state = data;
  }
}
