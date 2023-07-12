import { Component, Entity } from 'excalibur';
import { PrpgComponentType } from '../types';

/**
 * Used to get an entity the ability to teleport to a different map
 */
export class PrpgTeleportableComponent extends Component<PrpgComponentType.TELEPORTABLE> {
  public readonly type = PrpgComponentType.TELEPORTABLE;

  public isTeleporting = false;

  /** The target spawn point entity of the current teleport if any */
  public target: Entity | null = null;

  constructor() {
    super();
  }
}



