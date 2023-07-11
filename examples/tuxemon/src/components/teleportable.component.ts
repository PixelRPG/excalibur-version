import { Component } from 'excalibur';
import { PrpgComponentType } from '../types';

/**
 * Used to get an entity the ability to teleport to a different map
 */
export class PrpgTeleportableComponent extends Component<PrpgComponentType.TELEPORTABLE> {
  public readonly type = PrpgComponentType.TELEPORTABLE;

  constructor(public isTeleporting = false) {
    super();
  }
}



