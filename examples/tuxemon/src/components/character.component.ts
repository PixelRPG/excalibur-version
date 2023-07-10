import { Component } from 'excalibur';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite/src/index';
import { Direction, PrpgComponentType, MultiplayerData } from '../types';

export class PrpgCharacterComponent extends Component<PrpgComponentType.CHARACTER> implements MultiplayerData {
  public readonly type = PrpgComponentType.CHARACTER;
  public direction: Direction = Direction.DOWN;
  constructor(public spriteSheet: AsepriteResource) {
    super();
  }

  serialize() {
    return {
      direction: this.direction,
    };
  }

  deserialize(data: any) {
    this.direction = data.direction;
  }
}



