import { PrpgBaseComponent } from '.'
import { PrpgComponentType, TeleportComponentState, TeleportComponentArgs } from '../types';

/**
 * Used to teleport the player to a different map, can pe placed on a map
 */
export class PrpgTeleportComponent extends PrpgBaseComponent<PrpgComponentType.TELEPORT, TeleportComponentState, TeleportComponentArgs> {
  public readonly type = PrpgComponentType.TELEPORT;

  protected _state: TeleportComponentState

  constructor(data: TeleportComponentArgs) {
    super(data);
    this._state = data;
  }
}



