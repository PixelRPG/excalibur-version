import { Component } from 'excalibur';

export const PRPG_PLAYER_TYPE = 'prpg.player';

export class PrpgPlayerComponent extends Component<typeof PRPG_PLAYER_TYPE> {
  public readonly type = PRPG_PLAYER_TYPE;
}



