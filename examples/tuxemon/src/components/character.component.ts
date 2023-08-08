import { Component } from 'excalibur';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite';
import { PrpgBodyComponent, MultiplayerSyncComponent } from '.';
import { PrpgComponentType, MultiplayerSyncable, CharacterState, CharacterUpdates, CharacterArgs, Direction, MultiplayerSyncDirection } from '../types';

export class PrpgCharacterComponent extends Component<PrpgComponentType.CHARACTER> implements MultiplayerSyncable<CharacterState, CharacterUpdates> {
  public readonly type = PrpgComponentType.CHARACTER;

  private _state: CharacterState = {
    direction: Direction.DOWN,
  };

  private _updates: CharacterUpdates = {};

  public get syncDirection() {
    return this.owner?.get(MultiplayerSyncComponent)?.syncDirection || MultiplayerSyncDirection.NONE;
  }

  public resetUpdates(): void {
    if(this.dirty) {
      this._updates = {};
    }
  }

  get dirty() {
    return Object.keys(this._updates).length > 0;
  }

  get state(): Readonly<CharacterState> {
    return this._state;
  }

  get updates(): Readonly<CharacterUpdates> {
    return this._updates;
  }

  public spriteSheet: AsepriteResource;

  get direction() {
    return this._state.direction;
  }

  set direction(value: Direction) {
    if(this._state.direction !== value) {
      this._state.direction = value;
      this._updates.direction = value;
    }
  }

  constructor(data: CharacterArgs) {
    super();
    this.spriteSheet = data.spriteSheet;
  
    const initialState: CharacterState = { direction: data.direction || Direction.DOWN};
    this.initState(initialState);
  }

  dependencies = [PrpgBodyComponent]

  initState(initialState: CharacterUpdates): CharacterState {
    this._state = { ...this._state, ...initialState };
    return this._state;
  }

  applyUpdates(data: CharacterState) {
    if(data.direction !== undefined) {
      this.direction = data.direction;
    }
  }
}



