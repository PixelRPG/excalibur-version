import { PrpgBaseComponent } from '.'
import { PrpgComponentType, SelectableComponentState } from '../types';

/**
 * A selectable component for entities that can be selected, e.g. a menu item.
 */
export class PrpgSelectableComponent extends PrpgBaseComponent<PrpgComponentType.SELECTABLE, SelectableComponentState> {
  public readonly type = PrpgComponentType.SELECTABLE;

  constructor(data: SelectableComponentState) {
    super(data);
  }
}
