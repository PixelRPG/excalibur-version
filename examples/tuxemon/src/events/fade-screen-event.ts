import { GameEvent } from 'excalibur';
import { FadeScreenComponentState } from '../types';
import { PrpgFadeScreenElement } from '../screen-elements';

export class FadeScreenEvent extends GameEvent<PrpgFadeScreenElement> {
    constructor(public target: PrpgFadeScreenElement, public fadeScreen: FadeScreenComponentState) {
      super();
    }
}