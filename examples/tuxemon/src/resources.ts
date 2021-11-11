import "./types/files";
import { TiledMapResource } from '@excaliburjs/plugin-tiled/src/index';
import { AsepriteResource } from "@excaliburjs/plugin-aseprite/src/index";

import scientist from "./assets/sprites/scientist/scientist.json";
import scientistCharSet from "./assets/sprites/scientist/scientist.png";
import playerHouseBedroom from './assets/maps/player_house_bedroom.tmx';

let Resources = {
  scientist: new AsepriteResource(scientist, false, scientistCharSet),
  map: new TiledMapResource(playerHouseBedroom),
};

export { Resources };