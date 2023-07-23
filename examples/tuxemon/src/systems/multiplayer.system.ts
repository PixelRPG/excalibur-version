import {
  System,
  SystemType,
  Logger,
  Component,
  Entity,
} from 'excalibur';
import { MapScene } from '../scenes/map.scene';
import { syncable } from '../utilities';
import { PrpgComponentType, GameOptions, MultiplayerSyncable, SceneState, SceneUpdates, SyncDirection } from '../types';

export class PrpgMultiplayerSystem extends System implements MultiplayerSyncable<SceneState, SceneUpdates>  {
  public readonly types = [PrpgComponentType.FADE_SCREEN] as const;
  public priority = 98;
  public systemType = SystemType.Update;
  private logger = Logger.getInstance();
  private scene?: MapScene;

  /** The syncable full state */
  private _state: SceneState = {
    entities: {},
  };

  /** The syncable updates */
  private _updates: SceneUpdates = {
    entities: {},
  };

  public get syncDirection() {
    return SyncDirection.BOTH;
  }

  get dirty() {
    return Object.keys(this._updates.entities).length > 0;
  }

  get state(): Readonly<SceneState> {
    return this._state;
  }

  get updates(): Readonly<SceneUpdates> {
    return this._updates;
  }

  public initState(state: SceneUpdates): SceneState {
    this._state = {...this._state, ...state};
    return this._state
  }


  constructor(readonly gameOptions: GameOptions) {
    super();
  }

  public initialize(scene: MapScene) {
    super.initialize?.(scene);
    this.scene = scene;
    this.initState({ entities: {}});
    this.scene.multiplayerSystem = this;
  }

  private collectUpdates() {
    const entities = this.scene?.entities || [];
    // console.debug(`PrpgMultiplayerSystem entities:`, entities);

    for (const entity of entities) {
      const components = entity.getComponents() as (Component & Partial<MultiplayerSyncable>)[]
      for (const component of components) {
        const sync = syncable(component.syncDirection, SyncDirection.OUT)
        if(sync && component.dirty) {
          this._updates.entities[entity.name] ||= {};
          this._updates.entities[entity.name][component.type] = component.updates;
        }
      }
    }
    return this._updates;
  }

  private collectStates() {
    const entities = this.scene?.entities || [];
    // console.debug(`PrpgMultiplayerSystem entities:`, entities);
    for (const entity of entities) {
      const components = entity.getComponents() as (Component & Partial<MultiplayerSyncable>)[]
      for (const component of components) {
        const sync = syncable(component.syncDirection, SyncDirection.OUT)
        if(sync) {
          this._state.entities[entity.name] ||= {};
          this._state.entities[entity.name][component.type] = component.state;
        }
      }
    }
    return this._state;
  }

  private sync() {
    this.collectStates();
    this.collectUpdates();
  }
   
  public update(_: Entity[], delta: number) {
    // this.sync();
  }

  public postupdate(scene: MapScene, delta: number) {
    this.sync();
  }

  public resetUpdates(): void {
    const entities = this.scene?.entities || [];
    for (const entity of entities) {
      for (const component of entity.getComponents() as (Component & MultiplayerSyncable)[]) {
        if(typeof component.resetUpdates === 'function') {
          component.resetUpdates();
        }
      }
    }

    this._updates.entities = {};
  }

  public applyUpdates(updates: Readonly<SceneUpdates>) {
    for (const entityName in updates.entities) {
      const entityUpdateData = updates.entities[entityName];
      if(!entityUpdateData) {
        continue;
      }
      const entityToUpdate = this.scene?.getEntityByName(entityName);
      if(!entityToUpdate) {
        this.logger.error(`[${this.gameOptions.playerNumber}] Entity ${entityName} not found in map ${this.scene?.name}`);
        continue;
      }
      for (const componentType in entityUpdateData) {
        const componentUpdateData = entityUpdateData[componentType];
        if(!componentUpdateData) {
          continue;
        }
        const componentToUpdate = entityToUpdate.get(componentType) as Component<string> & MultiplayerSyncable | null;
        if(!componentToUpdate) {
          this.logger.error(`[${this.gameOptions.playerNumber}] Component ${componentType} not found in entity ${entityName} in map ${this.scene?.name}`);
          continue;
        }
        if(!syncable(componentToUpdate.syncDirection, SyncDirection.IN)) {
          this.logger.error(`[${this.gameOptions.playerNumber}] Component ${componentType} in entity ${entityName} in map ${this.scene?.name} is not syncable`);
          continue;
        }

        componentToUpdate.applyUpdates(componentUpdateData);
      }
    }
    // TODO: Remove the player from other map states
  }
}