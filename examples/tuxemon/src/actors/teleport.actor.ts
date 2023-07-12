import { Actor, CollisionType } from 'excalibur';
import { PrpgTeleportComponent } from '../components';
import { Teleport } from '../types';

const DEFAULT_ARGS: Partial<Teleport> = {
  name: 'teleporter',
  width: 16,
  height: 16,
  collisionType: CollisionType.Passive,
  z: 0
};

export class PrpgTeleportActor extends Actor {
  constructor(props: Teleport) {
    super({...DEFAULT_ARGS, ...props});
    this.addComponent(new PrpgTeleportComponent(props.mapName, props.spawnName));
  }
}