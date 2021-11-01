import "./files";
import { TiledMapResource } from '@excaliburjs/plugin-tiled/src/index';
import { AsepriteResource } from "@excaliburjs/plugin-aseprite/src/index";

import misa from "./assets/sprites/tuxemon-misa/tuxemon-misa.json";
import misaCharSet from "./assets/sprites/tuxemon-misa/tuxemon-misa.png";
import map from './assets/example-city.tmx';

let Resources = {
  misa: new AsepriteResource(misa, false, misaCharSet),
  map: new TiledMapResource(map),
};

export { Resources };