import { Component } from "excalibur";
import { Direction } from "../types/direction";
import type { AsepriteResource } from "@excaliburjs/plugin-aseprite/src/index";

export const PRPG_CHARACTER_TYPE = 'prpg.player';

export class PrpgCharacterComponent extends Component<typeof PRPG_CHARACTER_TYPE> {
  readonly type = PRPG_CHARACTER_TYPE;
  public direction: Direction = Direction.DOWMN;
  constructor(public spriteSheet: AsepriteResource) {
    super();
  }
}



