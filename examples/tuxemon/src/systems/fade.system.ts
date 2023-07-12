import {
  System,
  SystemType,
  Logger,
  Query,
  Entity
} from 'excalibur';
import { PrpgFadeScreenComponent } from '../components';
import { PrpgFadeScreenElement } from '../screen-elements';
import { MapScene } from '../scenes/map.scene';
import { PrpgComponentType } from '../types';

export class PrpgFadeSystem extends System<PrpgFadeScreenComponent> {
  public readonly types = [PrpgComponentType.FADE_SCREEN] as const;
  public priority = 500;
  public systemType = SystemType.Update;
  private logger = Logger.getInstance();
  private scene: MapScene;

  constructor() {
    super();
  }

  public initialize(scene: MapScene) {
    super.initialize?.(scene);
    this.scene = scene;
  }

  
   
  public update(fadeScreenElements: PrpgFadeScreenElement[], delta: number) {
    for (const fadeScreenElement of fadeScreenElements) {
      const fadeScreen = fadeScreenElement.get(PrpgFadeScreenComponent)?.data;
      if (!fadeScreen) {
        continue;
      }

      if(fadeScreen.isComplete) {
        if(fadeScreen.isComplete) {
          this.scene.world.remove(fadeScreenElement, false);
        }
        continue;
      }

      // WORKAROUND: The fade screen is sometimes not detected as complete
      if(fadeScreen.isOutro && fadeScreen.isFading && fadeScreenElement.graphics.opacity <= 0) {
        fadeScreenElement.graphics.opacity = 0;
        fadeScreen.isComplete = true;
        fadeScreen.isFading = false;
      }

      if(!fadeScreen.isOutro && fadeScreen.isFading && fadeScreenElement.graphics.opacity >= 1) {
        fadeScreenElement.graphics.opacity = 1;
        fadeScreen.isComplete = true;
        fadeScreen.isFading = false;
      }

      for (const name in fadeScreenElement.graphics.graphics) {
        // Sync the width and height of the graphics with the canvas width and height for the case that the user resizes the window
        fadeScreenElement.graphics.graphics[name].width = this.scene.engine.canvasWidth;
        fadeScreenElement.graphics.graphics[name].height = this.scene.engine.canvasHeight;
      }

      if(!fadeScreen.isFading) {
        if(fadeScreen.isOutro) {
          fadeScreenElement.actions.fade(0, fadeScreen.fadeSpeed).toPromise().then(() => {
            fadeScreen.isComplete = true;
            fadeScreen.isFading = false;
          });
          
        } else {
          fadeScreenElement.actions.fade(1, fadeScreen.fadeSpeed).toPromise().then(() => {
            fadeScreen.isComplete = true;
            fadeScreen.isFading = false;
          });
        }
        fadeScreen.isFading = true;
      }

    }
  }
}