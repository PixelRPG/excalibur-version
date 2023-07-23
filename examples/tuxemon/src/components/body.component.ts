import { Component, BodyComponent, Vector } from 'excalibur';
import { MultiplayerSyncComponent } from './multiplayer-sync.component';
import { PrpgComponentType, BodyState, BodyUpdates, MultiplayerSyncable, SyncDirection } from '../types';

const POSITION_THRESHOLD = 1;

/**
 * Body Component, more or less a wrapper of the Excalibur Body Component.
 * 
 * Body describes in excalibur all the physical properties pos, vel, acc, rotation, angular velocity for the purpose of
 * of physics simulation.
 */
export class PrpgBodyComponent extends Component<PrpgComponentType.BODY> implements MultiplayerSyncable<BodyState, BodyUpdates> {
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

  private _updates: BodyUpdates = {};

  public resetUpdates(): void {
    if(this.dirty) {
      this._updates = {};
    }
  }

  public get syncDirection() {
    const syncDir = this.owner?.get(MultiplayerSyncComponent)?.syncDirection || SyncDirection.NONE;
    return syncDir;
  }

  /**
   * Get the excalibur body component
   */
  get original() {
    const body = this.owner?.get(BodyComponent);
    if(!body) throw new Error('BodyComponent not found');
    return body;
  }

  get dirtyPos() {
    return !!this._updates.pos && Object.keys(this._updates.pos).length > 0
  }

  get dirtyVel() {
    return !!this._updates.vel && Object.keys(this._updates.vel).length > 0
  }

  get dirty() {
    return !!this._updates && Object.keys(this._updates).length > 0 && (this.dirtyPos || this.dirtyVel)
  }

  get state(): Readonly<BodyState> {
    return this._state;
  }

  get updates(): Readonly<BodyUpdates> {
    return this._updates;
  }

  public setPos(x: number | undefined, y: number | undefined) {
    x ||= this.original.pos.x;
    y ||= this.original.pos.y;
    if(y !== this.original.pos.y || x !== this.original.pos.x) {
      // this.original.pos = new Vector(x, y);
      this.original.pos.x = x;
      this.original.pos.y = y;
      this.syncStatePos();
    }
  }

  set z(z: number) {
    console.warn('TODO: set z');
  }

  setVel(x = 0, y = 0) {
    if(y !== this.original.vel.y || x !== this.original.vel.x) {
      this.original.vel.setTo(0, 0);
      this.original.vel.y = y;
      this.original.vel.x = x;
      this.syncStateVel();
    }
  }

  initState(initialState: BodyUpdates): BodyState {
    this._state = { ...this._state, ...initialState };
    return this._state;
  }

  syncStatePos(isIncomingUpdate = false) {
    const x = this.original.pos.x;
    const y = this.original.pos.y;
    if(x !== this._state.pos.x || y !== this._state.pos.y) {

      // // TEST
      // this._state.pos ||= {} as BodyState['pos'];
      // this._state.pos.y = y;
      // this._updates.pos ||= {} as BodyState['pos'];
      // this._updates.pos.y = y;
      // return;

      const oldX = this._state.pos.x || 0;
      const oldY = this._state.pos.y || 0;

      // Only update if the change is significant
      let diffY = y - oldY;
      if(diffY < 0) {
        diffY = -diffY;
      }


      let diffX = x - oldX;
      if(diffX < 0) {
        diffX = -diffX;
      }

      if(diffX >= POSITION_THRESHOLD) {
        this._state.pos ||= {} as BodyState['pos'];
        this._state.pos.x = x;
        // Do not send updates for incoming updates back
        if(!isIncomingUpdate) {
          this._updates.pos ||= {} as BodyState['pos'];
          this._updates.pos.x = x;
        }
      }

      if(diffY >= POSITION_THRESHOLD) {
        this._state.pos ||= {} as BodyState['pos'];
        this._state.pos.y = y;
        // Do not send updates for incoming updates back
        if(!isIncomingUpdate) {
          this._updates.pos ||= {} as BodyState['pos'];
          this._updates.pos.y = y;
        }
      }
    }
  }

  syncStateVelX(isIncomingUpdate = false) {
    const x = this.original.vel.x;
    if(x !== this._state.vel.x) {
      this._state.vel.x = x;
      // Do not send updates for incoming updates back
      if(!isIncomingUpdate) {
        this._updates.vel ||= {} as BodyState['vel'];
        this._updates.vel.x = x;
      }
    }
  }

  syncStateVelY(isIncomingUpdate = false) {
    const y = this.original.vel.y;
    if(y !== this._state.vel.y) {
      this._state.vel.y = y;
      // Do not send updates for incoming updates back
      if(!isIncomingUpdate) {
        this._updates.vel ||= {} as BodyState['vel'];
        this._updates.vel.y = y;
      }
    }
  }

  syncStateVel(isIncomingUpdate = false) {
    this.syncStateVelX(isIncomingUpdate);
    this.syncStateVelY(isIncomingUpdate);
  }

  syncState() {
    this.syncStatePos();
    this.syncStateVel();
    // TODO this._state.pos.z = this.pos.z;
  }

  applyUpdates(data: BodyUpdates) {
    if(!data) {
      return;
    }

    if(data.pos) {

      debugger;

      if(data.pos.x !== undefined || data.pos.y !== undefined) {
        this.setPos(data.pos.x, data.pos.y);
      }
      this.syncStatePos(true)
    }

    if(data.vel) {
      if(data.vel.x !== undefined) {
        // this.velX = data.vel.x;
        this.original.vel.x = data.vel.x;
      }
      if(data.vel.y !== undefined) {
        // this.velY = data.vel.y;
        this.original.vel.y = data.vel.y;
      }
      this.syncStateVel(true)
    }
  }

  constructor(data: BodyUpdates = {}) {
    super();
    this.initState(data);
  }
}



