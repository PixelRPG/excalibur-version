import type { AsepriteResource } from '@excaliburjs/plugin-aseprite';
import { Direction } from '.';

export interface CharacterState {
    direction: Direction;
}

export interface CharacterArgs extends CharacterState {
    spriteSheet: AsepriteResource;
}