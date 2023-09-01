import '../typings';
import { Loadable } from 'excalibur';
import { TiledMapResource, TiledMap } from '@excaliburjs/plugin-tiled';
import { AsepriteResource } from '@excaliburjs/plugin-aseprite';
import { Blueprint } from '../types';
import gameMenu from '../assets/menus/game.menu' // TODO use json

// Sprites
const scientistPath = './assets/sprites/scientist/scientist.json';

// Maps
const playerHouseBedroomPath = './assets/maps/player_house_bedroom.tmx';
const playerHouseDownstairsPath = './assets/maps/player_house_downstairs.tmx';
const tabaTownPath = './assets/maps/taba_town.tmx';

interface Sprites {
  [key: string]: AsepriteResource;
}
interface Maps {
  [key: string]: TiledMapResource;
}

interface Blueprints {
  [key: string]: Blueprint;
}
class ResourceManager {

  private static instance?: ResourceManager;

  public sprites: Sprites = {
    scientist: new AsepriteResource(scientistPath, false)
  };

  public maps: Maps = {
    'player_house_bedroom.tmx': new TiledMapResource(playerHouseBedroomPath),
    'player_house_downstairs.tmx': new TiledMapResource(playerHouseDownstairsPath),
    'taba_town.tmx': new TiledMapResource(tabaTownPath)
  }

  public blueprints: Blueprints = {
    'gameMenu': gameMenu
  }

  private constructor() {
    //
  }

  public static getSingleton() {
    if (ResourceManager.instance) {
      return ResourceManager.instance;
    }
    ResourceManager.instance = new ResourceManager();
    return ResourceManager.instance;
  }

  private _toArray<T = any>(obj: {[key:string]: Loadable<T>}) {
    const arr = Object.keys(obj).map((key) => obj[key]);
    return arr;
  }

  public getMapArr() {
    return this._toArray<TiledMap>(this.maps);
  }

  public getMapByName(name: string) {
    return this.maps[name];
  }

  public getSpriteArr() {
    return this._toArray(this.sprites);
  }

  public getSpriteByName(name: string) {
    return this.sprites[name];
  }
}

export const resources = ResourceManager.getSingleton();
