import { Entity } from 'excalibur';
import { PrpgSpawnPointComponent } from '../components/spawn-point.component';

export const newSpawnPointEntity = (x: number, y: number, z: number) => {
  return new Entity([new PrpgSpawnPointComponent(x, y, z)]);
};