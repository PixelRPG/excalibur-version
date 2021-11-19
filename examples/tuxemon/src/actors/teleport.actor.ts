import { Actor, CollisionType, vec, Color, Collider } from 'excalibur';
import { PrpgTeleporterComponent } from '../components';
import { Teleport } from '../types';

const DEFAULT_ARGS: Partial<Teleport> = {
  name: 'teleporter',
  // pos: vec(0, 0),
  width: 16,
  height: 16,
  // scale: vec(1,1),
  // color:  Color.Blue,
  collisionType: CollisionType.Passive,
  z: 0
};

export class PrpgTeleportActor extends Actor {
  constructor(props: Teleport) {
    super({...DEFAULT_ARGS, ...props});
    this.addComponent(new PrpgTeleporterComponent(props.mapName, props.spawnName));
  }
}