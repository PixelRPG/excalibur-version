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
  // public priority = 500;
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

  
   
  public update(actors: PrpgFadeScreenElement[], delta: number) {
    for (const actor of actors) {
      const fade = actor.get(PrpgFadeScreenComponent);
      if (!fade) {
        continue;
      }

      if(fade.data.isComplete) {
        // TODO: remove the fade screen element?
        continue;
      }

      for (const name in actor.graphics.graphics) {
        // Sync the width and height of the graphics with the canvas width and height for the case that the user resizes the window
        actor.graphics.graphics[name].width = this.scene.engine.canvasWidth;
        actor.graphics.graphics[name].height = this.scene.engine.canvasHeight;
      }

      if(!fade.data.isFading) {
        if(fade.data.isOutro) {
          actor.graphics.opacity = 1;
          actor.actions.fade(0, fade.data.fadeSpeed).toPromise().then(() => {
            fade.data.isComplete = true;
          });
          
        } else {
          actor.graphics.opacity = 0;
          actor.actions.fade(1, fade.data.fadeSpeed);
          actor.actions.fade(0, fade.data.fadeSpeed).toPromise().then(() => {
            fade.data.isComplete = true;
          });
        }
        fade.data.isFading = true;
      }

    }
  }
}