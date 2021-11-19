import { Actor, ActorArgs, CollisionType, vec, Color } from 'excalibur';
import { PrpgTeleporterComponent } from '../components';

export interface TeleportProps extends ActorArgs {
  /**
   * Map to teleport to
   */
  mapName: string;
  /**
   * Destination coordinates of a teleporter
   */
  spawnName: string;
}

const DEFAULT_ARGS: Partial<TeleportProps> = {
  name: 'teleporter',
  pos: vec(0, 0),
  width: 16,
  height: 16,
  scale: vec(1,1),
  color:  Color.Blue,
  collisionType: CollisionType.Passive,
  z: 0
};

export class PrpgTeleportActor extends Actor {
  constructor(props: TeleportProps) {
    super({...DEFAULT_ARGS, ...props});
    this.addComponent(new PrpgTeleporterComponent(props.mapName, props.spawnName));
  }
}