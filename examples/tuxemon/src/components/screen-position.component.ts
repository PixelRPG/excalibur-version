import { PrpgBaseComponent } from '.'
import { PrpgComponentType, ScreenPositionComponentState, ScreenPositionComponentArgs, ScreenAutoPositions } from '../types';

/**
 * A component for entities that are fixed positioned on the screen, e.g. a menu.
 */
export class PrpgScreenPositionComponent extends PrpgBaseComponent<PrpgComponentType.SCREEN_POSITION, ScreenPositionComponentState> {
  public readonly type = PrpgComponentType.SCREEN_POSITION;

  protected _state: ScreenPositionComponentState;

  /** If defined this component will be positioned automatically. */
  public auto: ScreenAutoPositions = {};

  public set x(x: number) {
    this._state.x = x;
  }

  public get x() {
    return this._state.x;
  }

  public set y(y: number) {
    this._state.y = y;
  }

  public get y() {
    return this._state.y;
  }

  constructor(data: ScreenPositionComponentArgs) {
    const state = data = { ...data, x: data.x || 0, y: data.y || 0, z: data.z || 0};
    super(state);
    this._state = state;
    if(data.auto?.x) {
      this.auto.x = data.auto.x;
    }
    if(data.auto?.y) {
      this.auto.y = data.auto.y;
    }
  }
}
