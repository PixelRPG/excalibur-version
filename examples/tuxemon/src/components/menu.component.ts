import { Entity } from 'excalibur';
import { PrpgBaseComponent } from '.'
import { BlueprintService } from '../services/blueprint.service';
import { PrpgComponentType, MenuComponentState, MenuComponentArgs } from '../types';

/**
 * A menu component, can be used to group menu items.
 */
export class PrpgMenuComponent extends PrpgBaseComponent<PrpgComponentType.MENU, MenuComponentState> {
  public readonly type = PrpgComponentType.MENU;

  protected _state: MenuComponentState;

  public items: {
    [key: string]: Entity | undefined;
  } = {};

  /**
   * 
   * @param items The menu items entity names.
   */
  constructor(data: MenuComponentArgs) {
    const itemEntities = BlueprintService.getInstance().createEntitiesFromBlueprint(data.itemEntityNames);
    const entityNameArr = Object.keys(itemEntities)
    if(!itemEntities || !entityNameArr.length) {
      console.error(itemEntities, entityNameArr, data);
      throw new Error('MenuComponentArgs.itemEntityNames must contain at least one entity name');
    }
    const state: MenuComponentState = {};    
    super(state);
    this.items = itemEntities;
    this._state = state
  }
}
