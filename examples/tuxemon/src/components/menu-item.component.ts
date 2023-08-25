import { Component } from 'excalibur';
import { PrpgSelectableComponent, PrpgScreenPositionComponent } from '.'
import { PrpgComponentType } from '../types';

/**
 * A menu item component used as a menu item in a menu.
 */
export class PrpgMenuItemComponent extends Component<PrpgComponentType.MENU_ITEM> {
  public readonly type = PrpgComponentType.MENU_ITEM;

  dependencies = [PrpgSelectableComponent, PrpgScreenPositionComponent];

  constructor() {
    super();
  }
}
