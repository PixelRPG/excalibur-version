import {
  System,
  SystemType,
  Logger,
  Query,
  World,
} from 'excalibur';
import { PrpgFadeScreenComponent } from '../components';
import { PrpgFadeScreenElement } from '../screen-elements';
import { MapScene } from '../scenes/map.scene';
import { FadeScreenComponentState, PrpgComponentType } from '../types';
import { FadeScreenEvent } from '../events';

export class PrpgFadeSystem extends System {
  public readonly types = [PrpgComponentType.FADE_SCREEN] as const;
  public priority = 500;
  public systemType = SystemType.Update;
  private logger = Logger.getInstance();
  private scene?: MapScene;
  private world?: World;
  private query?: Query<typeof PrpgFadeScreenComponent>

  constructor() {
    super();
  }

  public initialize(world: World, scene: MapScene) {
    super.initialize?.(world, scene);
    this.scene = scene;
    this.world = world;
    this.query = world.queryManager.createQuery([PrpgFadeScreenComponent]);
  }

  setFadeScreenComplete(fadeScreen: PrpgFadeScreenComponent, fadeScreenElement: PrpgFadeScreenElement) {
    if(fadeScreen.state.isOutro) {
      fadeScreenElement.graphics.opacity = 0;
    } else {
      fadeScreenElement.graphics.opacity = 1;
    }

    fadeScreen.isComplete = true;
    fadeScreen.isFading = false;
    fadeScreenElement.emit('complete', new FadeScreenEvent(fadeScreenElement, fadeScreen.state));
  }
   
  public update(delta: number) {
    const fadeScreenElements: PrpgFadeScreenElement[] = this.query?.getEntities() as PrpgFadeScreenElement[];
    for (const fadeScreenElement of fadeScreenElements) {
      const fadeScreen = fadeScreenElement.get(PrpgFadeScreenComponent);
      if (!fadeScreen) {
        continue;
      }

      if(fadeScreen.state.isComplete) {
        if(fadeScreen.state.isComplete) {
          this.world?.remove(fadeScreenElement, false);
        }
        continue;
      }

      // WORKAROUND: The fade screen is sometimes not detected as complete
      if(fadeScreen.state.isOutro && fadeScreen.state.isFading && fadeScreenElement.graphics.opacity <= 0) {
        this.setFadeScreenComplete(fadeScreen, fadeScreenElement);
      }

      if(!fadeScreen.state.isOutro && fadeScreen.state.isFading && fadeScreenElement.graphics.opacity >= 1) {
        this.setFadeScreenComplete(fadeScreen, fadeScreenElement);
      }

      for (const name in fadeScreenElement.graphics.graphics) {
        // Sync the width and height of the graphics with the canvas width and height for the case that the user resizes the window
        fadeScreenElement.graphics.graphics[name].width = this.scene?.engine.canvasWidth || 0;
        fadeScreenElement.graphics.graphics[name].height = this.scene?.engine.canvasHeight || 0;
      }

      if(!fadeScreen.state.isFading) {
        if(fadeScreen.state.isOutro) {
          fadeScreenElement.actions.fade(0, fadeScreen.state.fadeSpeed).toPromise().then(() => {
            this.setFadeScreenComplete(fadeScreen, fadeScreenElement);
          });
          
        } else {
          fadeScreenElement.actions.fade(1, fadeScreen.state.fadeSpeed).toPromise().then(() => {
            this.setFadeScreenComplete(fadeScreen, fadeScreenElement);
          });
        }
        fadeScreen.isFading = true;
      }

    }
  }
}