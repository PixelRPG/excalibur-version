import { Actor, vec, CollisionType, ActorArgs } from "excalibur";
import { PrpgCharacterComponent } from "../components/character.component";
import type { AsepriteResource } from "@excaliburjs/plugin-aseprite/src/index";

const DEFAULT_ARGS: ActorArgs = {
    pos: vec(100, 100),
    width: 12,
    height: 12,
    scale: vec(1,1),
    collisionType: CollisionType.Active,
}

export class PrpgCharacterActor extends Actor {
    constructor(spriteSheet: AsepriteResource, config?: ActorArgs) {
      super({...DEFAULT_ARGS, ...config});
      this.addComponent(new PrpgCharacterComponent(spriteSheet));
    }
    onInitialize() {
      console.debug("[PrpgCharacterActor] onInitialize");

    }
  }