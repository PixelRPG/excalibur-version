import { Actor, vec, CollisionType, ActorArgs } from 'excalibur';
import { PrpgCharacterComponent } from '../components';
import type { Character } from '../types';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite';

const DEFAULT_ARGS: Partial<Character> & Partial<ActorArgs> = {
  name: 'character',
  pos: vec(0, 0),
  width: 12,
  height: 12,
  scale: vec(1,1),
  collisionType: CollisionType.Active
};

export class PrpgCharacterActor extends Actor {
  constructor(spriteSheet: AsepriteResource, data: Character & Partial<ActorArgs>) {
    super({...DEFAULT_ARGS, ...data});
    this.addComponent(new PrpgCharacterComponent(data));
  }
}