import { Component } from 'excalibur';
import { PrpgComponentType } from '../types';

/**
 * A component for entities that are fixed positioned on the screen, e.g. a menu.
 */
export class PrpgScreenPositionComponent extends Component<PrpgComponentType.SCREEN_POSITION> {
  public readonly type = PrpgComponentType.SCREEN_POSITION;

  constructor(public x: number, public y: number) {
    super();
  }
}
