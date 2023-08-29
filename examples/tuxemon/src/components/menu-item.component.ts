import { PrpgBaseComponent } from '.'
import { PrpgSelectableComponent, PrpgScreenPositionComponent } from '.'
import { PrpgComponentType, MenuItemComponentState, MenuItemComponentArgs } from '../types';

/**
 * A menu item component used as a menu item in a menu.
 */
export class PrpgMenuItemComponent extends PrpgBaseComponent<PrpgComponentType.MENU_ITEM, MenuItemComponentState, MenuItemComponentArgs> {
  public readonly type = PrpgComponentType.MENU_ITEM;

  protected _state: MenuItemComponentState;

  dependencies = [PrpgSelectableComponent, PrpgScreenPositionComponent];

  constructor(data: MenuItemComponentArgs = {}) {
    super(data);
    this._state = data;
  }
}
