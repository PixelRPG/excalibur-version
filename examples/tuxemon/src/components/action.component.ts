import { PrpgBaseComponent } from '.';
import { PrpgComponentType, ActionComponentState, ActionComponentArgs } from '../types';

/**
 * A action component for entities that can call an action, e.g. if selected together with a selectable component.
 */
export class PrpgActionComponent extends PrpgBaseComponent<PrpgComponentType.ACTION, ActionComponentState, ActionComponentArgs> {
  public readonly type = PrpgComponentType.ACTION;
  protected _state: ActionComponentState;

  constructor(public data: ActionComponentArgs) {
    super(data);
    this._state = data;
  }
}
