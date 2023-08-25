import { Component } from 'excalibur';
import { PrpgScreenPositionComponent } from '.'
import { PrpgComponentType } from '../types';

/**
 * A menu component, can be used to group menu items.
 */
export class PrpgMenuComponent extends Component<PrpgComponentType.MENU> {
  public readonly type = PrpgComponentType.MENU;

  dependencies = [PrpgScreenPositionComponent];

  /**
   * 
   * @param items The menu items entity names.
   */
  constructor(public items: string[] = []) {
    super();
  }
}
