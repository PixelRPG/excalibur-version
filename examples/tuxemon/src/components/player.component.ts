import { Component } from 'excalibur';
import { PrpgComponentType } from '../types';

export class PrpgPlayerComponent extends Component<PrpgComponentType.PLAYER> {
  public readonly type = PrpgComponentType.PLAYER;

  constructor(public playerNumber: number) {
    super();
  }
}



