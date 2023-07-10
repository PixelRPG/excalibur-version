import { Component } from 'excalibur';
import { PrpgComponentType, MultiplayerData } from '../types';

export class PrpgPlayerComponent extends Component<PrpgComponentType.PLAYER> implements MultiplayerData {
  public readonly type = PrpgComponentType.PLAYER;

  constructor(public playerNumber: number) {
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
