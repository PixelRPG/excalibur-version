import "./files";
import { TiledMapResource } from '@excaliburjs/plugin-tiled/src/index';
import { AsepriteResource } from "@excaliburjs/plugin-aseprite/src/index";

import scientist from "./assets/sprites/scientist/scientist.json";
import scientistCharSet from "./assets/sprites/scientist/scientist.png";
import map from './assets/example-city.tmx';

let Resources = {
  scientist: new AsepriteResource(scientist, false, scientistCharSet),
  map: new TiledMapResource(map),
};

export { Resources };