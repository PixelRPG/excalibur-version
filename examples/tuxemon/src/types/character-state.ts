import type { AsepriteResource } from '@excaliburjs/plugin-aseprite';
import { Direction } from '.';

export interface CharacterState {
    direction: Direction;
}

export type CharacterUpdates = Partial<CharacterState>;

export interface CharacterArgs extends CharacterUpdates {
    spriteSheet: AsepriteResource;
}