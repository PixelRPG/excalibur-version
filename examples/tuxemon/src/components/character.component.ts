import { Component } from 'excalibur';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite/src/index';
import { Direction, PrpgComponentType } from '../types';

export class PrpgCharacterComponent extends Component<PrpgComponentType.CHARACTER> {
  public readonly type = PrpgComponentType.CHARACTER;
  public direction: Direction = Direction.DOWN;
  constructor(public spriteSheet: AsepriteResource) {
    super();
  }
}



