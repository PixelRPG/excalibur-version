import { PrpgBaseComponent } from '.'
import { PrpgComponentType, SpawnPointComponentState, SpawnPointType, Direction } from '../types';

export class PrpgSpawnPointComponent extends PrpgBaseComponent<PrpgComponentType.SPAWN_POINT, SpawnPointComponentState> {
  public readonly type = PrpgComponentType.SPAWN_POINT;

  data: SpawnPointComponentState;

  constructor(
    data: Partial<SpawnPointComponentState> & Pick<SpawnPointComponentState, 'sceneName' | 'entityName'>
  ) {
    super(data);

    const defaults: Partial<SpawnPointComponentState> = {
      type: SpawnPointType.TELEPORT,
      x: 0,
      y: 0,
      z: 0,
      direction: Direction.DOWN
    };

    this.data = { ...defaults, ...data } as SpawnPointComponentState;

  }
}



