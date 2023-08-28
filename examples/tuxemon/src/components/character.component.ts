import { Component } from 'excalibur';
import type { AsepriteResource } from '@excaliburjs/plugin-aseprite';
import { PrpgBaseComponent, PrpgBodyComponent, MultiplayerSyncComponent } from '.';
import { PrpgComponentType, MultiplayerSyncable, CharacterComponentState, CharacterComponentUpdates, CharacterComponentArgs, Direction, MultiplayerSyncDirection } from '../types';

export class PrpgCharacterComponent extends PrpgBaseComponent<PrpgComponentType.CHARACTER, CharacterComponentState> implements MultiplayerSyncable<CharacterComponentState, CharacterComponentUpdates> {
  public readonly type = PrpgComponentType.CHARACTER;

  protected _state: CharacterComponentState = {
    direction: Direction.DOWN,
  };

  protected _updates: CharacterComponentUpdates = {};

  public get syncDirection() {
    return this.owner?.get(MultiplayerSyncComponent)?.state.syncDirection || MultiplayerSyncDirection.NONE;
  }

  public resetUpdates(): void {
    if(this.dirty) {
      this._updates = {};
    }
  }

  get dirty() {
    return Object.keys(this._updates).length > 0;
  }

  get state(): Readonly<CharacterComponentState> {
    return this._state;
  }

  get updates(): Readonly<CharacterComponentUpdates> {
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

  constructor(data: CharacterComponentArgs) {
    super(data);
    this.spriteSheet = data.spriteSheet;
  
    const initialState: CharacterComponentState = { direction: data.direction || Direction.DOWN};
    this.initState(initialState);
  }

  dependencies = [PrpgBodyComponent]

  initState(initialState: CharacterComponentUpdates): CharacterComponentState {
    this._state = { ...this._state, ...initialState };
    return this._state;
  }

  applyUpdates(data: CharacterComponentState) {
    if(data.direction !== undefined) {
      this.direction = data.direction;
    }
  }
}



