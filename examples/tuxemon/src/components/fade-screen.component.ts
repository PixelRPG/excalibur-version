import { Color } from 'excalibur';
import { PrpgBaseComponent } from '.'
import { PrpgComponentType, FadeScreenComponentState, FadeScreenComponentArgs } from '../types';

/**
 * used to fade the screen in and out
 */
export class PrpgFadeScreenComponent extends PrpgBaseComponent<PrpgComponentType.FADE_SCREEN, FadeScreenComponentState, FadeScreenComponentArgs> {
    public readonly type = PrpgComponentType.FADE_SCREEN;
    protected _state: FadeScreenComponentState;

    public static readonly DEFAULTS: FadeScreenComponentState = {
        fadeSpeed: 200,
        color: Color.Black,
        isOutro: false,
        width: 100,
        height: 100,
        isFading: false,
        isComplete: false,
    };

    constructor(data: FadeScreenComponentArgs) {
        const state: FadeScreenComponentState = {
            ...PrpgFadeScreenComponent.DEFAULTS,
            ...data,
        }
        super(state);
        this._state = state;
    }

    public set isFading(isFading: boolean) {
        this._state.isFading = isFading;
    }

    public set isComplete(isComplete: boolean) {
        this._state.isComplete = isComplete;
    }    
}
