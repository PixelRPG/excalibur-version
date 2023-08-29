import type { Color } from "excalibur";

export interface FadeScreenComponentState {
    /** Fade speed in ms */
    fadeSpeed: number;
    color: Color;
    width: number,
    height: number;
    isOutro: boolean;
    isFading: boolean;
    isComplete: boolean;
}

export interface FadeScreenComponentArgs extends Partial<FadeScreenComponentState> {
    //
}