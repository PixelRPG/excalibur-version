import { Component } from 'excalibur';
import { PrpgComponentType, SpawnPointState, SpawnPointType, Direction } from '../types';

export class PrpgSpawnPointComponent extends Component<PrpgComponentType.SPAWN_POINT> {
  public readonly type = PrpgComponentType.SPAWN_POINT;

  data: SpawnPointState;

  constructor(
    data: Partial<SpawnPointState> & Pick<SpawnPointState, 'mapScene' | 'entityName'>
  ) {
    super();

    const defaults: Partial<SpawnPointState> = {
      type: SpawnPointType.TELEPORT,
      x: 0,
      y: 0,
      z: 0,
      direction: Direction.DOWN
    };

    this.data = { ...defaults, ...data } as SpawnPointState;

  }
}



