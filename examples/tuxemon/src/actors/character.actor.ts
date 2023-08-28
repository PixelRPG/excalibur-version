import { Actor, vec, CollisionType, ActorArgs } from 'excalibur';
import { PrpgCharacterComponent, PrpgBodyComponent } from '../components';
import type { CharacterComponentArgs } from '../types';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite';

const DEFAULT_ARGS: Partial<CharacterComponentArgs> & Partial<ActorArgs> = {
  name: 'character',
  pos: vec(0, 0),
  width: 12,
  height: 12,
  scale: vec(1,1),
  collisionType: CollisionType.Active
};

export class PrpgCharacterActor extends Actor {
  constructor(spriteSheet: AsepriteResource, data: CharacterComponentArgs) {
    super({...DEFAULT_ARGS, ...data});
    this.addComponent(new PrpgBodyComponent());
    this.addComponent(new PrpgCharacterComponent(data));
  }
}