import { PrpgBaseComponent } from '.'
import { PrpgComponentType, FadeScreenComponentState } from '../types';

/**
 * used to fade the screen in and out
 */
export class PrpgFadeScreenComponent extends PrpgBaseComponent<PrpgComponentType.FADE_SCREEN, FadeScreenComponentState> {
    public readonly type = PrpgComponentType.FADE_SCREEN;

    constructor(public data: FadeScreenComponentState) {
        super(data);
    }
}
