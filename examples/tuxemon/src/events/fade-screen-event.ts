import { GameEvent } from 'excalibur';
import { FadeScreen } from '../types';
import { PrpgFadeScreenElement } from '../screen-elements';

export class FadeScreenEvent extends GameEvent<PrpgFadeScreenElement> {
    constructor(public target: PrpgFadeScreenElement, public fadeScreen: FadeScreen) {
      super();
    }
}