import './types/files';
import { Loadable } from 'excalibur';
import { TiledMapResource, TiledMap } from '@excaliburjs/plugin-tiled/src/index';
import { AsepriteResource } from '@excaliburjs/plugin-aseprite/src/index';

// Sprites
import scientist from './assets/sprites/scientist/scientist.json';

// Charsets
import scientistCharSet from './assets/sprites/scientist/scientist.png';

// Maps
import playerHouseBedroom from './assets/maps/player_house_bedroom.tmx';
import playerHouseDownstairs from './assets/maps/player_house_downstairs.tmx';
import tabaTown from './assets/maps/taba_town.tmx';

class Resources {

  private static instance?: Resources;

  public sprites = {
    scientist: new AsepriteResource(scientist, false, scientistCharSet)
  };
  public maps = {
    'player_house_bedroom.tmx': new TiledMapResource(playerHouseBedroom),
    'player_house_downstairs.tmx': new TiledMapResource(playerHouseDownstairs),
    'taba_town.tmx': new TiledMapResource(tabaTown)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getSingleton() {
    if (Resources.instance) {
      return Resources.instance;
    }
    Resources.instance = new Resources();
    return Resources.instance;
  }

  private _toArray<T = any>(obj: {[key:string]: Loadable<T>}) {
    const arr = Object.keys(obj).map((key) => obj[key]);
    return arr;
  }

  public getMapArr() {
    return this._toArray<TiledMap>(this.maps);
  }

  public getSpriteArr() {
    return this._toArray(this.sprites);
  }
}

export { Resources };