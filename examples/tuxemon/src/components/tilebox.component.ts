import { Entity, TileMap } from 'excalibur';
import { PrpgBaseComponent } from '.'
import { TilemapService } from '../services/index';
import { PrpgComponentType, TileboxComponentState, TileboxComponentArgs } from '../types';

/**
 * A tilemap box component, can be used for dialog box or menu backgrounds.
 */
export class PrpgTileboxComponent extends PrpgBaseComponent<PrpgComponentType.TILEBOX, TileboxComponentState> {
  public readonly type = PrpgComponentType.TILEBOX;

  protected _state: TileboxComponentState;

  public tilemap: TileMap;

  public items: {
    [key: string]: Entity | undefined;
  } = {};

  /**
   * 
   * @param items The menu items entity names.
   */
  constructor(data: TileboxComponentArgs) {  
    super(data);
    this._state = data
    this.tilemap = TilemapService.getInstance().createBox(data.tilesetName, data.rows, data.columns);
  }
}
