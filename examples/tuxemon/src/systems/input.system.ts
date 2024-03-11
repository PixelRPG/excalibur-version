import {
    System,
    SystemType,
    Logger,
    Entity,
    Keys,
    Buttons,
    Axes,
    Query,
    World,
  } from 'excalibur';
  import {
    PrpgControllableComponent,
    PrpgTeleportableComponent,
    PrpgBodyComponent,
    PrpgMenuComponent,
    PrpgMenuVisibleComponent,
  } from '../components';
  import { MapScene } from '../scenes/map.scene';
  import { GameOptions, PrpgComponentType } from '../types';
  
  export class PrpgInputSystem extends System {
    public readonly types = [PrpgComponentType.CONTROLLABLE] as const;
    public priority = 99;
    public systemType = SystemType.Update;
    private scene?: MapScene;
    private logger = Logger.getInstance();
    private query?: Query<typeof PrpgControllableComponent>;
  
    constructor(readonly gameOptions: GameOptions) {
      super();
    }
  
    private _handleInputForBody(entity: Entity) {
      const controllable = entity.get(PrpgControllableComponent);
      if(!controllable) {
        this.logger.error('PrpgControllableComponent for input not found!');
        return;
      }
  
      if(!this.scene) {
        this.logger.error('Current scene not found!');
        return;
      }
  
      const body = entity.get(PrpgBodyComponent);
      if (!body) {
        this.logger.error('PrpgBodyComponent for player input not found!');
        return;
      }
  
      // Reset velocity
      let velX = 0;
      let velY = 0;
  
      const teleportable = entity.get(PrpgTeleportableComponent);
      if(teleportable?.isTeleporting) {
        // Ignore input while teleporting
        return;
      }
  
      const speed = 64;
  
      const pad1 = this.scene.engine.input.gamepads.at(0);
      const pad2 = this.scene.engine.input.gamepads.at(1);
      const pad3 = this.scene.engine.input.gamepads.at(1);
  
      const keyboard = this.scene.engine.input.keyboard;
  
      const pad1AxesLeftX = pad1.getAxes(Axes.LeftStickX);
      const pad1AxesLeftY = pad1.getAxes(Axes.LeftStickY);
  
      const pad2AxesLeftX = pad2.getAxes(Axes.LeftStickX);
      const pad2AxesLeftY = pad2.getAxes(Axes.LeftStickY);
  
      const pad3AxesLeftX = pad3.getAxes(Axes.LeftStickX);
      const pad3AxesLeftY = pad3.getAxes(Axes.LeftStickY);
  
      if (keyboard.wasPressed(Keys.F1)) {
        this.scene.engine.toggleDebug();
      }
  
      if(this.gameOptions.playerNumber === 1) {
        if (
          keyboard.isHeld(Keys.Right) ||
          pad1.isButtonHeld(Buttons.DpadRight)
        ) {
          velX = speed;
        }
        if (
          keyboard.isHeld(Keys.Left) ||
          pad1.isButtonHeld(Buttons.DpadLeft)
        ) {
          velX = -speed;
        }
        if (
          keyboard.isHeld(Keys.Up) ||
          pad1.isButtonHeld(Buttons.DpadUp)
        ) {
          velY = -speed;
        }
        if (
          keyboard.isHeld(Keys.Down) ||
          pad1.isButtonHeld(Buttons.DpadDown)
        ) {
          velY = speed;
        }
  
        // Axes movement
        if (Math.abs(pad1AxesLeftX) > 0) {
          velX = pad1AxesLeftX * speed;
        }
        if (Math.abs(pad1AxesLeftY) > 0) {
          velY = pad1AxesLeftY * speed;
        }
      }
  
      if(this.gameOptions.playerNumber === 2) {
        if (
          keyboard.isHeld(Keys.D) ||
          pad2.isButtonHeld(Buttons.DpadRight)
        ) {
          velX = speed;
        }
        if (
          keyboard.isHeld(Keys.A) ||
          pad2.isButtonHeld(Buttons.DpadLeft)
        ) {
          velX = -speed;
        }
        if (
          keyboard.isHeld(Keys.W) ||
          pad2.isButtonHeld(Buttons.DpadUp)
        ) {
          velY = -speed;
        }
        if (
          keyboard.isHeld(Keys.S) ||
          pad2.isButtonHeld(Buttons.DpadDown)
        ) {
          velY = speed;
        }
  
        // Axes movement
        if (Math.abs(pad2AxesLeftX) > 0) {
          velX = pad2AxesLeftX * speed;
        }
  
        if (Math.abs(pad2AxesLeftY) > 0) {
          velY = pad2AxesLeftY * speed;
        }
      }
  
  
      if(this.gameOptions.playerNumber === 3) {
        if (
          keyboard.isHeld(Keys.Numpad3) ||
          pad3.isButtonHeld(Buttons.DpadRight)
        ) {
          velX = speed;
        }
        if (
          keyboard.isHeld(Keys.Numpad1) ||
          pad3.isButtonHeld(Buttons.DpadLeft)
        ) {
          velX = -speed;
        }
        if (
          keyboard.isHeld(Keys.Numpad5) ||
          pad3.isButtonHeld(Buttons.DpadUp)
        ) {
          velY = -speed;
        }
        if (
          keyboard.isHeld(Keys.Numpad2) ||
          pad3.isButtonHeld(Buttons.DpadDown)
        ) {
          velY = speed;
        }
  
        // Axes movement
        if (Math.abs(pad3AxesLeftX) > 0) {
          velX = pad3AxesLeftX * speed;
        }
  
        if (Math.abs(pad3AxesLeftY) > 0) {
          velY = pad3AxesLeftY * speed;
        }
      }
  
      body.setVel(velX, velY);
    }

    /**
     * Toggle menu visibility
     * @param entity 
     */
    private toggleMenu(entity: Entity) {
      const visible = entity.get(PrpgMenuVisibleComponent);
      console.debug('toggle menu visibility', visible);
      if(visible) {
        entity.removeComponent(PrpgMenuVisibleComponent);
      } else {
        entity.addComponent(new PrpgMenuVisibleComponent());
      }
    }

    private _handleInputForMenu(entity: Entity) {

        if(!this.scene) {
          this.logger.error('Current scene not found!');
          return;
        }
        
        const keyboard = this.scene.engine.input.keyboard;

        if(this.gameOptions.playerNumber === 1) {
          if (keyboard.wasPressed(Keys.Escape)) {
            this.toggleMenu(entity);
          }
        }  
        else if (this.gameOptions.playerNumber === 2) {
          if (keyboard.wasPressed(Keys.Enter)) {
            this.toggleMenu(entity);
          }
        }

    }
  
    public initialize(world: World, scene: MapScene) {
      this.scene = scene;
    }
  
    public update(delta: number) {
      const entities = this.query?.getEntities() || [];
      for (const entity of entities) {
        const body = entity.get(PrpgBodyComponent);
        const menu = entity.get(PrpgMenuComponent);

        if(body) {
          this._handleInputForBody(entity);
        }

        if(menu) {
          this._handleInputForMenu(entity);
        }
      }
    }
  }
  