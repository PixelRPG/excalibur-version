import { Component } from 'excalibur';
import { PrpgComponentType, NetworkSerializable, Teleportable } from '../types';

/**
 * Used to get an entity the ability to teleport to a different map
 */
export class PrpgTeleportableComponent extends Component<PrpgComponentType.TELEPORTABLE> implements NetworkSerializable {
  public readonly type = PrpgComponentType.TELEPORTABLE;

  constructor(public data: Partial<Teleportable> = {}) {
    data.followTeleport ||= false;
    data.isTeleporting ||= false;
    super();
  }

  serialize() {    
    return {
      isTeleporting: this.data.isTeleporting,
      // Ignore follow teleport, it is set on each client separately
      // followTeleport: this.data.followTeleport,
      teleportTo: this.data.teleportTo,
    }
  }

  deserialize(data: Teleportable) {
    this.data.isTeleporting = data.isTeleporting;
    // Ignore follow teleport, it is set on each client separately
    // this.data.followTeleport = data.followTeleport;
    this.data.teleportTo = data.teleportTo;
  }
}



