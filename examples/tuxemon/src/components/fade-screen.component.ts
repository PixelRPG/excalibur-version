import { Component, Color } from 'excalibur';
import { PrpgComponentType, FadeScreen } from '../types';

/**
 * used to fade the screen in and out
 */
export class PrpgFadeScreenComponent extends Component<PrpgComponentType.FADE_SCREEN> {
    public readonly type = PrpgComponentType.FADE_SCREEN;

    constructor(public data: FadeScreen) {
        super();
    }
}
