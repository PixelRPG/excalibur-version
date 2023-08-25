import { Component } from 'excalibur';
import { PrpgComponentType } from '../types';

/**
 * A selectable component for entities that can be selected, e.g. a menu item.
 */
export class PrpgSelectableComponent extends Component<PrpgComponentType.SELECTABLE> {
  public readonly type = PrpgComponentType.SELECTABLE;

  constructor(public selected = false) {
    super();
  }
}
