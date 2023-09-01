import { PrpgBaseComponent } from '.'
import { PrpgComponentType, SpawnPointComponentState, SpawnPointComponentArgs, SpawnPointType, Direction } from '../types';

export class PrpgSpawnPointComponent extends PrpgBaseComponent<PrpgComponentType.SPAWN_POINT, SpawnPointComponentState, SpawnPointComponentArgs> {
  public readonly type = PrpgComponentType.SPAWN_POINT;

  protected _state: SpawnPointComponentState;

  constructor(
    data?: SpawnPointComponentArgs
  ) {
    const defaults: Partial<SpawnPointComponentState> = {
      type: SpawnPointType.TELEPORT,
      x: 0,
      y: 0,
      z: 0,
      direction: Direction.DOWN
    };

    const state = { ...defaults, ...data } as SpawnPointComponentState;
    super(state);
    this._state = state;
  }
}



