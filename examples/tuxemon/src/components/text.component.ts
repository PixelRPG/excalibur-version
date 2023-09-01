import { PrpgBaseComponent } from '.'
import { PrpgComponentType, TextComponentState, TextComponentArgs } from '../types';

/**
 * Stores a text string to be displayed on the screen, in a dialog box, in a menu, etc.
 */
export class PrpgTextComponent extends PrpgBaseComponent<PrpgComponentType.TEXT, TextComponentState, TextComponentArgs> {
  public readonly type = PrpgComponentType.TEXT;

  protected _state: TextComponentState;

  constructor(data: TextComponentArgs = {}) {
    const state: TextComponentState = {
      content: data.content || '',
    };
    super(state);
    this._state = state;
  }
}
