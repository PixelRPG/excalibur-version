import { Component } from 'excalibur';
import { PrpgComponentType } from '../types/component-type';

export class PrpgTeleporterComponent extends Component<PrpgComponentType.TELEPORTER> {
  public readonly type = PrpgComponentType.TELEPORTER;

  constructor(public mapName: string, public spawnName: string) {
    super();
  }
}



