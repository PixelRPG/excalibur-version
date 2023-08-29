import { PrpgBaseComponent } from '.'
import { PrpgComponentType, MenuComponentState, MenuComponentArgs } from '../types';

/**
 * A menu component, can be used to group menu items.
 */
export class PrpgMenuComponent extends PrpgBaseComponent<PrpgComponentType.MENU, MenuComponentState> {
  public readonly type = PrpgComponentType.MENU;

  protected _state: MenuComponentState;

  dependencies = [];

  /**
   * 
   * @param items The menu items entity names.
   */
  constructor(data: MenuComponentArgs) {
    super(data);
    this._state = data;
  }
}
