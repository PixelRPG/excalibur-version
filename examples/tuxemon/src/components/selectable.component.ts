import { PrpgBaseComponent } from '.'
import { PrpgComponentType, SelectableComponentState, SelectableComponentArgs } from '../types';

/**
 * A selectable component for entities that can be selected, e.g. a menu item.
 */
export class PrpgSelectableComponent extends PrpgBaseComponent<PrpgComponentType.SELECTABLE, SelectableComponentState, SelectableComponentArgs> {
  public readonly type = PrpgComponentType.SELECTABLE;

  protected _state: SelectableComponentState;

  constructor(data: SelectableComponentArgs) {
    super(data);
    this._state = {
      selected: data.selected || false,
    }
  }
}
