import { BodyComponent } from 'excalibur';
import { PrpgBaseComponent, PrpgMultiplayerSyncComponent } from '.';
import { PrpgComponentType, BodyComponentState, BodyComponentUpdates, BodyComponentArgs, MultiplayerSyncable, MultiplayerSyncDirection } from '../types';

const POSITION_THRESHOLD = 1;

/**
 * Body Component, more or less a wrapper of the Excalibur Body Component.
 * 
 * Body describes in excalibur all the physical properties pos, vel, acc, rotation, angular velocity for the purpose of
 * of physics simulation.
 */
export class PrpgBodyComponent extends PrpgBaseComponent<PrpgComponentType.BODY, BodyComponentState, BodyComponentArgs> implements MultiplayerSyncable<BodyComponentState, BodyComponentUpdates> {
  public readonly type = PrpgComponentType.BODY;

  protected _state: BodyComponentState = {
    pos: {
      x: 0,
      y: 0,
    },
    z: 0,
    vel: {
      x: 0,
      y: 0,
    },
  };

  protected _updates: BodyComponentUpdates = {};

  public resetUpdates(): void {
    if(this.dirty) {
      this._updates = {};
    }
  }

  public get syncDirection() {
    const syncDir = this.owner?.get(PrpgMultiplayerSyncComponent)?.state.syncDirection || MultiplayerSyncDirection.NONE;
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

  get state(): Readonly<BodyComponentState> {
    return this._state;
  }

  get updates(): Readonly<BodyComponentUpdates> {
    return this._updates;
  }

  constructor(data: BodyComponentArgs = {}) {
    super(data);
    this.initState(data);
  }

  /**
   * Get the current position of the body
   * @param x x position
   * @param y y position
   * @param sendUpdates Set this to `true` if updates should be sent to the other players. For performance reasons this is set to `false` by default.
   */
  public setPos(x: number | undefined, y: number | undefined, sendUpdates = false) {
    x ||= this.original.pos.x;
    y ||= this.original.pos.y;

    const needSync = x !== this.original.pos.x || y !== this.original.pos.y;

    if(x !== this.original.pos.x) {
      this.original.pos.x = x;
    }

    if(y !== this.original.pos.y) {
      this.original.pos.y = y;
    }

    if(needSync) {
      this.syncStatePos(sendUpdates);
    }

  }

  set z(z: number) {
    if(z === this.z) {
      return;
    }
    this._state.z = z;
    this._updates.z = z;
    this.original.transform.z = z;
  }

  get z() {
    return this.original.transform.z;
  }

  setVel(x = 0, y = 0) {
    if(y !== this.original.vel.y || x !== this.original.vel.x) {
      this.original.vel.setTo(0, 0);
      this.original.vel.y = y;
      this.original.vel.x = x;
      // Always sync the velocity to the other players
      const sendUpdates = true;
      this.syncStateVel(sendUpdates);
      this.syncStatePos(sendUpdates);
    }
  }

  initState(initialState: BodyComponentUpdates): BodyComponentState {
    this._state = { ...this._state, ...initialState };
    return this._state;
  }

  /**
   * Get's the current position of the body from the original excalibur body component and updates the state of this component
   * @param sendUpdates Set this to `true` if updates should be sent to the other players. For performance reasons this is set to `false` by default.
   */
  private syncStatePos(sendUpdates = false) {
    const x = this.original.pos.x;
    const y = this.original.pos.y;
    const z = this.z;
    let hasChanged = false;

    if(z !== this._state.z) {
      this._state ||= {} as BodyComponentState;
      this._state.z = z;
      hasChanged = true;
    }

    if(x !== this._state.pos.x || y !== this._state.pos.y) {

      const oldX = this._state.pos.x || 0;
      const oldY = this._state.pos.y || 0;

      let diffY = y - oldY;
      if(diffY < 0) {
        diffY = -diffY;
      }

      let diffX = x - oldX;
      if(diffX < 0) {
        diffX = -diffX;
      }

      // Only update if the change is significant
      if(diffX >= POSITION_THRESHOLD) {
        this._state.pos ||= {} as BodyComponentState['pos'];
        this._state.pos.x = x;
        hasChanged = true;
      }

      // Only update if the change is significant
      if(diffY >= POSITION_THRESHOLD) {
        this._state.pos ||= {} as BodyComponentState['pos'];
        this._state.pos.y = y;
        hasChanged = true;
      }
    }

    if(hasChanged && sendUpdates) {
      this._updates.pos ||= {} as BodyComponentState['pos'];
      this._updates.pos.x = x;
      this._updates.pos.y = y;
      this._updates.z = z;
    }
  }

  /**
   * Get's the current velocity of the body from the original excalibur body component and updates the state of this component
   * @param sendUpdates Set this to `false` if no updates should be sent to the other players
   */
  private syncStateVel(sendUpdates = true) {
    const x = this.original.vel.x;
    const y = this.original.vel.y;
    let hasChanged = false;

    if(x !== this._state.vel.x) {
      this._state.vel.x = x;
      hasChanged = true;
    }

    if(y !== this._state.vel.y) {
      this._state.vel.y = y;
      hasChanged = true;
    }

    // Do not send updates for incoming updates back
    if(hasChanged && sendUpdates) {
      this._updates.vel ||= {} as BodyComponentState['vel'];
      this._updates.vel.x = x;
      this._updates.vel.y = y;
    }
  }

  /**
   * Syncs the state of this component with the original excalibur body component
   * @param sendUpdates Set this to `false` if no updates should be sent to the other players
   */
  public syncState() {
    this.syncStatePos(false);
    this.syncStateVel(true);
    // TODO this._state.pos.z = this.pos.z;
  }

  public applyUpdates(data: BodyComponentUpdates) {
    if(!data) {
      return;
    }

    if(data.pos) {
      if(data.pos.x !== undefined || data.pos.y !== undefined) {
        this.setPos(data.pos.x, data.pos.y, false);
      }
      this.syncStatePos(false)
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
      this.syncStateVel(false)
    }

    if(data.z !== undefined) {
      this.original.transform.z = data.z;
    }
  }
}
