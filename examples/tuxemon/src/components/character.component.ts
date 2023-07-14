import { Component } from 'excalibur';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite';
import { proxy } from 'valtio';
import { PrpgComponentType, NetworkSerializable, CharacterState, CharacterArgs, Direction } from '../types';

export class PrpgCharacterComponent extends Component<PrpgComponentType.CHARACTER> implements NetworkSerializable<CharacterState> {
  public readonly type = PrpgComponentType.CHARACTER;

  private _state: CharacterState = {
    direction: Direction.DOWN,
  };

  get state() {
    return this._state;
  }

  public spriteSheet: AsepriteResource;

  get direction() {
    return this._state.direction;
  }

  set direction(value: Direction) {
    this._state.direction = value;
  }

  constructor(data: CharacterArgs) {
    super();
    this.spriteSheet = data.spriteSheet;
  
    const initialState: CharacterState = { direction: data.direction};
    this._state = this.initState(initialState);
  }

  initState(initialState: Partial<CharacterState>): CharacterState {
    this._state = { ...this._state, ...initialState };
    return {
      direction: this._state.direction,
    };
  }

  deserialize(data: CharacterState) {
    this._state.direction = data.direction;
  }
}



