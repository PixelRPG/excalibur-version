import { Actor, vec, CollisionType, ActorArgs } from 'excalibur';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite/src/index';
import { PrpgCharacterComponent, PrpgPlayerComponent } from '../components';

const DEFAULT_ARGS: ActorArgs = {
  name: 'player',
  pos: vec(0, 0),
  width: 12,
  height: 12,
  scale: vec(1,1),
  collisionType: CollisionType.Active
};

export class PrpgPlayerActor extends Actor {
  constructor(spriteSheet: AsepriteResource, config?: ActorArgs) {
    super({...DEFAULT_ARGS, ...config});
    this.addComponent(new PrpgCharacterComponent(spriteSheet));
    this.addComponent(new PrpgPlayerComponent());
  }
  onInitialize() {
    console.debug('[PrpgPlayerActor] onInitialize');
  }
}