import { Component } from 'excalibur';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite';
import { PrpgBodyComponent } from './body.component';
import { proxy } from 'valtio';
import { PrpgComponentType, MultiplayerSyncable, CharacterState, CharacterArgs, Direction } from '../types';

export class PrpgCharacterComponent extends Component<PrpgComponentType.CHARACTER> implements MultiplayerSyncable<CharacterState> {
  public readonly type = PrpgComponentType.CHARACTER;

  private _state: CharacterState = {
    direction: Direction.DOWN,
  };

  get updates() {
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

  dependencies = [PrpgBodyComponent]

  initState(initialState: Partial<CharacterState>): CharacterState {
    this._state = { ...this._state, ...initialState };
    return proxy(this._state);
  }

  applyUpdates(data: CharacterState) {
    if(data.direction !== undefined) {
      this._state.direction = data.direction;
    }
  }
}



