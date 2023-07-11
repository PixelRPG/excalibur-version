import { ScreenElement, Color, ActorArgs, CoordPlane } from 'excalibur';
import { PrpgFadeScreenComponent } from '../components';
import { FadeScreen } from '../types'

export class PrpgFadeScreenElement extends ScreenElement {
  constructor(data: Partial<FadeScreen>, actorArgs: ActorArgs = {}) {
    const defaults: FadeScreen = {
      fadeSpeed: 100,
      color: Color.Black,
      isOutro: false,
      width: 100,
      height: 100,
      isFading: false,
      isComplete: false,
    };
    data = {...defaults, ...data};
    const actorDefaults: ActorArgs = {
      x: 0,
      y: 0,
      z: 100,
      coordPlane: CoordPlane.Screen,
    };
    super({...actorArgs, ...actorDefaults, ...data });
    this.addComponent(new PrpgFadeScreenComponent(data as FadeScreen));
  }
}