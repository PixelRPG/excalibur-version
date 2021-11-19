import type { ActorArgs } from 'excalibur';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite/src/index';

export interface Player extends Partial<ActorArgs> {
  playerNumber: number;
  spriteSheet: AsepriteResource
}