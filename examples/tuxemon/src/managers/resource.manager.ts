import '../typings';
import { Loadable, Resource } from 'excalibur';
import { TiledMapResource, TiledMap, TiledTileset } from '@excaliburjs/plugin-tiled';
import { AsepriteResource } from '@excaliburjs/plugin-aseprite';
import { TiledTilesetResource } from '../resources/tiled-tileset.resource'

import type { Blueprint } from '../types';

// Sprites
const scientistPath = './assets/sprites/scientist/scientist.json';

// Tilesets
const menu001Path = './assets/tilesets/menu-001.tsx';

// Maps
const playerHouseBedroomPath = './assets/maps/player_house_bedroom.tmx';
const playerHouseDownstairsPath = './assets/maps/player_house_downstairs.tmx';
const tabaTownPath = './assets/maps/taba_town.tmx';

// Menus
const gameMenuPath = './assets/menus/game.menu.json';

interface Sprites {
  [key: string]: AsepriteResource;
}

interface Tilesets {
  [key: string]: TiledTilesetResource;
}

interface Maps {
  [key: string]: TiledMapResource;
}

interface Blueprints {
  [key: string]: Resource<Blueprint>;
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

  public tilesets: Tilesets = {
    menu001: new TiledTilesetResource(menu001Path, false),
  }

  public menus: Blueprints = {
    'gameMenu': new Resource<Blueprint>(gameMenuPath, 'json')
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

  public getTilesetArr() {
    return this._toArray(this.tilesets);
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

  public getMenusArr() {
    return this._toArray(this.menus);
  }

  public getSpriteByName(name: string) {
    return this.sprites[name];
  }

}

export const resources = ResourceManager.getSingleton();
