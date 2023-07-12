import { Component, Entity } from 'excalibur';
import { PrpgComponentType, SpawnPoint, SpawnPointType, Direction } from '../types';

export class PrpgSpawnPointComponent extends Component<PrpgComponentType.SPAWN_POINT> {
  public readonly type = PrpgComponentType.SPAWN_POINT;

  data: SpawnPoint;

  constructor(
    data: Partial<SpawnPoint> & Pick<SpawnPoint, 'mapScene' | 'entity'>
  ) {
    super();

    const defaults: Partial<SpawnPoint> = {
      type: SpawnPointType.TELEPORT,
      x: 0,
      y: 0,
      z: 0,
      direction: Direction.DOWN
    };

    this.data = { ...defaults, ...data } as SpawnPoint;

  }
}



