import { Actor, vec, CollisionType, ActorArgs } from "excalibur";
import { Resources } from "../resources";
import { PrpgPlayerComponent } from "../components/player.component";

const DEFAULT_ARGS: ActorArgs = {
    pos: vec(100, 100),
    width: 12,
    height: 12,
    scale: vec(1,1),
    collisionType: CollisionType.Active,
}

export class PrpgPlayerActor extends Actor {
    constructor(config?: ActorArgs) {
      super({...DEFAULT_ARGS, ...config});
      this.addComponent(new PrpgPlayerComponent());
    }
    onInitialize() {
      console.debug("onInitialize");
      const frontWalk = Resources.scientist.getAnimation('front-walk');
      this.graphics.use(frontWalk);
      this.graphics.offset = vec(0, -12),
      this.on('pointerup', () => {
        console.debug('pointerup');
      });
    }
  }