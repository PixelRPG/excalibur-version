import { Component } from 'excalibur';
import { PrpgComponentType, NetworkSerializable } from '../types';

export class PrpgPlayerComponent extends Component<PrpgComponentType.PLAYER> implements NetworkSerializable {
  public readonly type = PrpgComponentType.PLAYER;

  constructor(public playerNumber: number, public isCurrentPlayer = false) {
    super();
  }

  serialize() {
    return {
      playerNumber: this.playerNumber,
    };
  }

  deserialize(data: any) {
    this.playerNumber = data.playerNumber;
  }
}
