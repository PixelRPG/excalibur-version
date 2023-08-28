import { PrpgBaseComponent } from '.'
import { PrpgScreenPositionComponent } from '.'
import { PrpgComponentType } from '../types';

/**
 * A menu component, can be used to group menu items.
 */
export class PrpgMenuComponent extends PrpgBaseComponent<PrpgComponentType.MENU, PrpgScreenPositionComponent> {
  public readonly type = PrpgComponentType.MENU;

  dependencies = [PrpgScreenPositionComponent];

  /**
   * 
   * @param items The menu items entity names.
   */
  constructor(data: PrpgScreenPositionComponent) {
    super(data);
  }
}
