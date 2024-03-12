import {
  System,
  SystemType,
  Logger,
  BodyComponent,
  Entity,
  Query
} from 'excalibur';
import { PrpgBodyComponent } from '../components';
import { PrpgComponentType } from '../types';

/**
 * System to update the body component
 */
export class PrpgBodySystem extends System {
  public readonly types = ["ex.body", PrpgComponentType.BODY] as const;
  public priority = 500;
  public systemType = SystemType.Update;
  private logger = Logger.getInstance();
  private query?: Query<typeof BodyComponent | typeof PrpgBodyComponent>

   
  public update(delta: number) {
    const entities = this.query?.getEntities() || [];
    for (const entity of entities) {
      const ownBody = entity.get(PrpgBodyComponent);
      if(!ownBody) {
        this.logger.error('PrpgBodySystem: BodyComponent not found');
        continue;
      }
      ownBody.syncState();
    }
  }
}