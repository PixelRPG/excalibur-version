import type { Color } from "excalibur";

export interface FadeScreen {
    /** Fade speed in ms */
    fadeSpeed: number;
    color: Color;
    width: number,
    height: number;
    isOutro: boolean;
    isFading: boolean;
    isComplete: boolean;
}