import { Component } from 'excalibur';
import { Direction } from '../types/direction';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite/src/index';
import { PrpgComponentType } from '../types/component-type';

export class PrpgCharacterComponent extends Component<PrpgComponentType.CHARACTER> {
  public readonly type = PrpgComponentType.CHARACTER;
  public direction: Direction = Direction.DOWMN;
  constructor(public spriteSheet: AsepriteResource) {
    super();
  }
}



