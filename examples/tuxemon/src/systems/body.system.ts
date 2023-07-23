import {
  System,
  SystemType,
  Logger,
  BodyComponent,
  Entity
} from 'excalibur';
import { PrpgBodyComponent } from '../components';
import { PrpgComponentType } from '../types';

/**
 * System to update the body component
 */
export class PrpgBodySystem extends System<PrpgBodyComponent | BodyComponent> {
  public readonly types = ["ex.body", PrpgComponentType.BODY] as const;
  public priority = 500;
  public systemType = SystemType.Update;
  private logger = Logger.getInstance();

   
  public update(entities: Entity[], delta: number) {
    for (const entity of entities) {
      const ownBody = entity.get<PrpgBodyComponent>(PrpgComponentType.BODY);
      if(!ownBody) {
        this.logger.error('PrpgBodySystem: BodyComponent not found');
        continue;
      }
      ownBody.syncState();
    }
  }
}