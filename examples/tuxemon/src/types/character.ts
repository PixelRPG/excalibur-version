import type { AsepriteResource } from '@excaliburjs/plugin-aseprite';
import { Direction, PrpgComponentType, NetworkSerializable } from '../types';

export interface Character {
    spriteSheet: AsepriteResource;
    direction: Direction;
}