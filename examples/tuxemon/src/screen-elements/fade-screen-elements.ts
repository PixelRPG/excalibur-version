import { ScreenElement, Color, ActorArgs, CoordPlane } from 'excalibur';
import { PrpgFadeScreenComponent } from '../components';
import { FadeScreen } from '../types';
import { FadeScreenEvent } from '../events';

/**
 * 
 * @param data
 * @param actorArgs
 * @emits complete - When the fade animation is complete
 */
export class PrpgFadeScreenElement extends ScreenElement {
  constructor(public data: Partial<FadeScreen>, actorArgs: ActorArgs = {}) {
    const defaults: FadeScreen = {
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
    this.addComponent(new PrpgFadeScreenComponent(data as FadeScreen));
  
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

  // @ts-ignore
  public on(eventName: 'complete', handler: (event: FadeScreenEvent) => void) {
    // @ts-ignore
    super.on(eventName as string, handler);
  }

  /**
   * Alias for `removeEventListener`. If only the eventName is specified
   * it will remove all handlers registered for that specific event. If the eventName
   * and the handler instance are specified only that handler will be removed.
   *
   * @param eventName  Name of the event to listen for
   * @param handler    Event handler for the thrown event
   */
  public off(eventName: string, handler?: (event: any) => void) {
    super.off(eventName, handler);
  }

  public emit(eventName: 'complete', eventObject: FadeScreenEvent) {
    super.emit(eventName, eventObject);
  }

  /**
   * Once listens to an event one time, then unsubscribes from that event
   *
   * @param eventName The name of the event to subscribe to once
   * @param handler   The handler of the event that will be auto unsubscribed
   */
  // @ts-ignore
  public once(eventName: 'complete', handler: (event: any) => void) {
    super.once(eventName, handler);
  }

}