import { Component } from 'excalibur';
import { PrpgComponentType } from '../types';

/**
 * Stores a text string to be displayed on the screen, in a dialog box, in a menu, etc.
 */
export class PrpgTextComponent extends Component<PrpgComponentType.TEXT> {
  public readonly type = PrpgComponentType.TEXT;

  constructor(public content: string) {
    super();
  }
}
