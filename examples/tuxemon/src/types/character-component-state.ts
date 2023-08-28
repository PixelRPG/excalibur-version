import type { AsepriteResource } from '@excaliburjs/plugin-aseprite';
import { Direction } from '.';

export interface CharacterComponentState {
    direction: Direction;
}

export type CharacterComponentUpdates = Partial<CharacterComponentState>;

export interface CharacterComponentArgs extends CharacterComponentUpdates {
    spriteSheet: AsepriteResource;
}