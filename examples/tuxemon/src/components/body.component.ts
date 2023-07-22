import { Component, BodyComponent, Vector } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgComponentType, BodyState, MultiplayerSyncable } from '../types';

import { proxy } from 'valtio';

/**
 * Body Component, more or less a wrapper of the Excalibur Body Component.
 * 
 * Body describes in excalibur all the physical properties pos, vel, acc, rotation, angular velocity for the purpose of
 * of physics simulation.
 */
export class PrpgBodyComponent extends Component<PrpgComponentType.BODY> implements MultiplayerSyncable<BodyState> {
  public readonly type = PrpgComponentType.BODY;

  private _state: BodyState = {
    pos: {
      x: 0,
      y: 0,
    },
    z: 0, // TODO
    vel: {
      x: 0,
      y: 0,
    },
  };

  /**
   * Get the excalibur body component
   */
  get original() {
    const body = this.owner?.get(BodyComponent);
    if(!body) throw new Error('BodyComponent not found');
    return body;
  }

  get updates() {
    return this._state;
  }

  get pos() {
    return this.original.pos;
  }

  set pos(pos: Vector) {
    this.original.pos.x = pos.x;
    this.original.pos.y = pos.y;
    this.syncStatePos();
  }

  get vel() {
    return this.original.vel;
  }

  set vel(vel: Vector) {
    this.original.vel.x = vel.x;
    this.original.vel.y = vel.y;
    this.syncStateVel();
  }

  initState(initialState: Partial<BodyState>): BodyState {
    this._state = { ...this._state, ...initialState };
    this._state = proxy(this._state);
    return this._state;
  }


  syncStatePos() {
    this._state.pos ||= {} as BodyState['pos'];
    if(this.pos) {

      const oldX = this._state.pos.x;
      const oldY = this._state.pos.y;

      // Only update if the change is significant
      const diffX = this.pos.x - oldX;
      if(!oldX || diffX >= 1 || diffX <= -1) {
        this._state.pos.x = this.pos.x;
      }

      const diffY = this.pos.y - oldY;
      if(!oldY || diffY >= 1 || diffY <= -1) {
        this._state.pos.y = this.pos.y;
      }
    }
  }

  syncStateVel() {
    this._state.vel ||= {} as BodyState['vel'];
    if(this.vel) {
      this._state.vel.x = this.vel.x;
      this._state.vel.y = this.vel.y;
    }
  }

  syncState() {
    this.syncStatePos();
    this.syncStateVel();
    // TODO this._state.pos.z = this.pos.z;
  }

  applyUpdates(data: Partial<BodyState>) {
    if(!data) {
      return;
    }

    if(data.pos) {
      if(data.pos.x !== undefined) {
        this.pos.x = data.pos.x;
        this.original.pos.x = data.pos.x;
      }
      if(data.pos.y !== undefined) {
        this.pos.y = data.pos.y;
        this.original.pos.y = data.pos.y;
      }
      this.syncStatePos() 
    }

    if(data.vel) {
      if(data.vel.x !== undefined) {
        this.vel.x = data.vel.x;
        this.original.vel.x = data.vel.x;
      }
      if(data.vel.y !== undefined) {
        this.vel.y = data.vel.y;
        this.original.vel.y = data.vel.y;
      }
      this.syncStateVel() 
    }
  }

  constructor(data: Partial<BodyState> = {}) {
    super();
    this.initState(data);
  }
}



