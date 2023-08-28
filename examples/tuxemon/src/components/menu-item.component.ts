import { PrpgBaseComponent } from '.'
import { PrpgSelectableComponent, PrpgScreenPositionComponent } from '.'
import { PrpgComponentType } from '../types';

/**
 * A menu item component used as a menu item in a menu.
 */
export class PrpgMenuItemComponent extends PrpgBaseComponent<PrpgComponentType.MENU_ITEM, {}> {
  public readonly type = PrpgComponentType.MENU_ITEM;

  dependencies = [PrpgSelectableComponent, PrpgScreenPositionComponent];

  constructor(data: {} = {}) {
    super(data);
  }
}
