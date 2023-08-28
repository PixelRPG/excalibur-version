import { PrpgBaseComponent } from '.'
import { PrpgComponentType, TeleportComponentState } from '../types';

/**
 * Used to teleport the player to a different map, can pe placed on a map
 */
export class PrpgTeleportComponent extends PrpgBaseComponent<PrpgComponentType.TELEPORT, TeleportComponentState> {
  public readonly type = PrpgComponentType.TELEPORT;

  constructor(data: TeleportComponentState) {
    super(data);
  }
}



