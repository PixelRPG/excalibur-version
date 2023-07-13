import { Component } from 'excalibur';
import { PrpgComponentType, NetworkSerializable, Character } from '../types';

export class PrpgCharacterComponent extends Component<PrpgComponentType.CHARACTER> implements NetworkSerializable {
  public readonly type = PrpgComponentType.CHARACTER;
  constructor(public data: Character) {
    super();
  }

  serialize() {
    return {
      direction: this.data.direction,
    };
  }

  deserialize(data: any) {
    this.data.direction = data.direction;
  }
}



