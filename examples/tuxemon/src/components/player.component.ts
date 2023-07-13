import { Component } from 'excalibur';
import { PrpgComponentType, NetworkSerializable, Player } from '../types';

export class PrpgPlayerComponent extends Component<PrpgComponentType.PLAYER> implements NetworkSerializable {
  public readonly type = PrpgComponentType.PLAYER;

  constructor(public data: Player) {
    super();
  }

  serialize() {
    return {
      playerNumber: this.data.playerNumber,
      // Current player is not serialized, it is set on each client separately
      // isCurrentPlayer: this.data.isCurrentPlayer,
    };
  }

  deserialize(data: Player) {
    // Player number not changed after creation
    // this.data.playerNumber = data.playerNumber;
    // Current player is not serialized, it is set on each client separately
    // this.data.isCurrentPlayer = data.isCurrentPlayer;
  }
}
