import { Component, BodyComponent } from 'excalibur';

export const PRPG_CHARACTER_TYPE = 'prpg.teleporter';

export class PrpgTeleporterComponent extends Component<typeof PRPG_CHARACTER_TYPE> {
  public readonly type = PRPG_CHARACTER_TYPE;

  constructor(public map: string, public addressee: string) {
    super();
  }
}



