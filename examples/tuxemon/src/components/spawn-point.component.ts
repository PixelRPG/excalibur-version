import { Component, Entity } from 'excalibur';
import { PrpgComponentType, SpawnPointType, Direction } from '../types';

export class PrpgSpawnPointComponent extends Component<PrpgComponentType.SPAWN_POINT> {
  public readonly type = PrpgComponentType.SPAWN_POINT;

  constructor(
    public spawnType: SpawnPointType,
    public x: number,
    public y: number,
    public z = 0,
    public direction = Direction.DOWN,
    /** The entry for which this span point is, mostly this is one of the players */
    public entry: Entity
  ) {
    super();
  }
}



