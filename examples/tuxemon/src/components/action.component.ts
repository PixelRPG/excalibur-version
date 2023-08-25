import { Component } from 'excalibur';
import { PrpgComponentType } from '../types';

/**
 * A action component for entities that can call an action, e.g. if selected together with a selectable component.
 */
export class PrpgActionComponent extends Component<PrpgComponentType.ACTION> {
  public readonly type = PrpgComponentType.ACTION;

  constructor(public actionName: string) {
    super();
  }
}
