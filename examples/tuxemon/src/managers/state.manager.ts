import { GameOptions } from '../types';
import { Doc } from 'yjs';

/**
 * TODO: The plan is to sync scenes states across players, only if multiple players are on the same scene, they need to be synced.
 * TODO: Extend Excalibur.Engine instead of using this singleton
 */
export class StateManager {

  private static instances: {
    [player: number]: StateManager
  } = {};

  docs: {
    [scene: string]: Doc
  } = {}


  private constructor() {
    //
  }

  addScene(name: string) {
    if(this.docs[name]) {
      throw new Error(`Scene ${name} already exists!`);
    }
    this.docs[name] = new Doc();
  }

  public static getSingleton(gameOptions: GameOptions) {
    if (StateManager.instances[gameOptions.playerNumber]) {
      return StateManager.instances[gameOptions.playerNumber];
    }
    StateManager.instances[gameOptions.playerNumber] = new StateManager();
    return StateManager.instances[gameOptions.playerNumber];
  }
}
