import "./files";
import {  ImageSource } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';

import misa from "./assets/misa-front.png";
import map from './assets/example-city.tmx';

let Resources = {
  misa: new ImageSource(misa),
  map: new TiledMapResource(map),
};

export { Resources };