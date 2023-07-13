import {
  System,
  SystemType,
  Logger,
} from 'excalibur';
import { PrpgFadeScreenComponent } from '../components';
import { PrpgFadeScreenElement } from '../screen-elements';
import { MapScene } from '../scenes/map.scene';
import { FadeScreen, PrpgComponentType } from '../types';
import { FadeScreenEvent } from '../events';

export class PrpgFadeSystem extends System<PrpgFadeScreenComponent> {
  public readonly types = [PrpgComponentType.FADE_SCREEN] as const;
  public priority = 500;
  public systemType = SystemType.Update;
  private logger = Logger.getInstance();
  private scene?: MapScene;

  constructor() {
    super();
  }

  public initialize(scene: MapScene) {
    super.initialize?.(scene);
    this.scene = scene;
  }

  setFadeScreenComplete(fadeScreen: FadeScreen, fadeScreenElement: PrpgFadeScreenElement) {
    if(fadeScreen.isOutro) {
      fadeScreenElement.graphics.opacity = 0;
    } else {
      fadeScreenElement.graphics.opacity = 1;
    }

    fadeScreen.isComplete = true;
    fadeScreen.isFading = false;
    fadeScreenElement.emit('complete', new FadeScreenEvent(fadeScreenElement, fadeScreen));
  }
   
  public update(fadeScreenElements: PrpgFadeScreenElement[], delta: number) {
    for (const fadeScreenElement of fadeScreenElements) {
      const fadeScreen = fadeScreenElement.get(PrpgFadeScreenComponent)?.data;
      if (!fadeScreen) {
        continue;
      }

      if(fadeScreen.isComplete) {
        if(fadeScreen.isComplete) {
          this.scene?.world.remove(fadeScreenElement, false);
        }
        continue;
      }

      // WORKAROUND: The fade screen is sometimes not detected as complete
      if(fadeScreen.isOutro && fadeScreen.isFading && fadeScreenElement.graphics.opacity <= 0) {
        this.setFadeScreenComplete(fadeScreen, fadeScreenElement);
      }

      if(!fadeScreen.isOutro && fadeScreen.isFading && fadeScreenElement.graphics.opacity >= 1) {
        this.setFadeScreenComplete(fadeScreen, fadeScreenElement);
      }

      for (const name in fadeScreenElement.graphics.graphics) {
        // Sync the width and height of the graphics with the canvas width and height for the case that the user resizes the window
        fadeScreenElement.graphics.graphics[name].width = this.scene?.engine.canvasWidth || 0;
        fadeScreenElement.graphics.graphics[name].height = this.scene?.engine.canvasHeight || 0;
      }

      if(!fadeScreen.isFading) {
        if(fadeScreen.isOutro) {
          fadeScreenElement.actions.fade(0, fadeScreen.fadeSpeed).toPromise().then(() => {
            this.setFadeScreenComplete(fadeScreen, fadeScreenElement);
          });
          
        } else {
          fadeScreenElement.actions.fade(1, fadeScreen.fadeSpeed).toPromise().then(() => {
            this.setFadeScreenComplete(fadeScreen, fadeScreenElement);
          });
        }
        fadeScreen.isFading = true;
      }

    }
  }
}