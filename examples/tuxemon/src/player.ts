import { Actor, Color, vec, CollisionType } from "excalibur";
import { Resources } from "./resources";

export class Player extends Actor {
  constructor() {
    super({
      pos: vec(100, 100),
      width: 12,
      height: 12,
      scale: vec(1,1),
      // color: Color.Blue,
      collisionType: CollisionType.Active,

    });
    this.on('collisionstart', () => {
      console.debug('entered an area');
    });
    this.on('collisionend', () => {
      console.debug('left an area');
    });
   
  }

  onInitialize() {
    console.debug("onInitialize");
    this.graphics.add(Resources.misa.toSprite());
    this.graphics.offset = vec(0, -12),
    this.on('pointerup', () => {
      console.debug('pointerup');
    });
  }
}