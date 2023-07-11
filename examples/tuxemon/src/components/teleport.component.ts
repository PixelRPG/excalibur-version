import { Component } from 'excalibur';
import { PrpgComponentType } from '../types';

/**
 * Used to teleport the player to a different map, can pe placed on a map
 */
export class PrpgTeleportComponent extends Component<PrpgComponentType.TELEPORT> {
  public readonly type = PrpgComponentType.TELEPORT;

  constructor(public mapName: string, public spawnName: string) {
    super();
  }
}



