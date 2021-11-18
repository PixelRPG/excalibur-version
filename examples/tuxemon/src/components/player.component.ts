import { Component } from 'excalibur';
import { PrpgComponentType } from '../types/component-type';

export class PrpgPlayerComponent extends Component<PrpgComponentType.PLAYER> {
  public readonly type = PrpgComponentType.PLAYER;
}



