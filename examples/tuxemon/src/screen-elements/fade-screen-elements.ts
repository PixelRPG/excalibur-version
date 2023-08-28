import { ScreenElement, Color, ActorArgs, CoordPlane, EventEmitter } from 'excalibur';
import { PrpgFadeScreenComponent } from '../components';
import type { FadeScreenComponentState, PrpgScreenEvents } from '../types';

/**
 * 
 * @param data
 * @param actorArgs
 * @emits complete - When the fade animation is complete
 */
export class PrpgFadeScreenElement extends ScreenElement {

  public declare events: EventEmitter<PrpgScreenEvents>;

  constructor(public data: Partial<FadeScreenComponentState>, actorArgs: ActorArgs = {}) {
    const defaults: FadeScreenComponentState = {
      fadeSpeed: 200,
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
    this.addComponent(new PrpgFadeScreenComponent(data as FadeScreenComponentState));
  
    if(this.data.isOutro) {
      // Outro starts with a black screen and fades to transparent
      this.graphics.opacity = 1;
    } else {
      // Intro starts with a transparent screen and fades to black (or other color)
      this.graphics.opacity = 0;
    }
  }

  get fadeScreen() {
    return this.get(PrpgFadeScreenComponent)?.data;
  }
}