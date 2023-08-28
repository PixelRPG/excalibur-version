import { Entity } from 'excalibur';
import { PrpgSpawnPointComponent } from '../components';
import { SpawnPointComponentState } from '../types';

export const newSpawnPointEntity = (data: Partial<SpawnPointComponentState> & Pick<SpawnPointComponentState, 'sceneName' | 'entityName'>) => {
  return new Entity([new PrpgSpawnPointComponent(data)]);
};