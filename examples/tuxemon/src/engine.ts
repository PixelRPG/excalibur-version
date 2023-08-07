import {
    Engine as ExcaliburEngine, EngineOptions, DisplayMode, Input, Color, Logger, Scene, Loader,
    Timer, TileMap, Actor, Entity, LogLevel, ScreenElement, GamepadConnectEvent, GamepadDisconnectEvent,
    GamepadButtonEvent, GamepadAxisEvent, GameEvent, EventEmitter
} from 'excalibur';

import { syncable } from './utilities';

// Scenes
import { MapScene } from './scenes/map.scene';

import { GameOptions, MultiplayerSyncable, GameState, GameUpdates, MultiplayerSyncableScene, SyncDirection, PrpgEngineEvents } from './types';
import { resources } from './managers/index';

export class PrpgEngine extends ExcaliburEngine implements MultiplayerSyncable<GameState, GameUpdates> {

    private logger = Logger.getInstance();

    private _state: GameState = {
        scenes: {},
    }

    private _updates: GameUpdates = {
        scenes: {},
    }

    /**
     * Listen to and emit events on the Engine
     */
    public declare events: EventEmitter<PrpgEngineEvents>;

    public get syncDirection() {
        return SyncDirection.BOTH;
    }

    private resetUpdatesScenes() {
        const scenes: GameState['scenes'] = {};
        for (const name in this.scenes) {
            const scene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            if(scene.multiplayerSystem) {
                scene.multiplayerSystem.resetUpdates();
            }
        }
        return scenes
    }

    public resetUpdates(): void {
        this.resetUpdatesScenes();
        this._updates.scenes = {};
    }

    get dirty() {
        return !!this._updates.scenes && Object.keys(this._updates.scenes).length > 0;
    }

    get state(): Readonly<GameState>  {
        return this._state;
    }

    get updates(): Readonly<GameUpdates>  {
        return this._updates;
    }

    constructor(engineOptions: EngineOptions, readonly gameOptions: GameOptions, initialState?: GameUpdates) {
        const canvasElementId = 'p' + gameOptions.playerNumber;
        const defaults = {
            displayMode: DisplayMode.FillContainer, // TODO: Contribute a new option to ignore aspect ratio / resolution
            canvasElementId,
            pointerScope: Input.PointerScope.Canvas,
            width: document.getElementById(canvasElementId)?.clientWidth || 800,
            height: document.getElementById(canvasElementId)?.clientHeight || 600,
            antialiasing: false,
            snapToPixel: false,
            suppressPlayButton: true, // Disable play button, enable to fix audio issue, currently only used for dev
            backgroundColor: Color.Black,
            maxFps: 40,
            configurePerformanceCanvas2DFallback: {
                allow: true,
                
                threshold: {
                    numberOfFrames: 10,
                    fps: 5,
                }
            }
        }
        super({...defaults, ...engineOptions});
        this._state = this.initState(initialState);
    }

    collectStates() {
        for (const name in this.scenes) {
            const scene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            const sync = syncable(scene.multiplayerSystem?.syncDirection, SyncDirection.OUT)
            if(sync && scene.multiplayerSystem) {
                if(!this._state.scenes[name]) {
                    this._state.scenes[name] = scene.multiplayerSystem.state;
                } else if(this._state.scenes[name] !== scene.multiplayerSystem.state) {
                    // this.logger.warn(`Map scene ${name} state is out of sync!`, this._state.maps[name], scene.multiplayerSystem?.state);
                    this._state.scenes[name] = scene.multiplayerSystem.state;
                }
            }
        }
    }

    collectUpdates() {
        for (const name in this.scenes) {
            const scene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            const sync = syncable(scene.multiplayerSystem?.syncDirection, SyncDirection.OUT);
            if(sync && scene.multiplayerSystem?.dirty) {
                this._updates.scenes ||= {};
                if(!this._updates.scenes[name]) {
                    this._updates.scenes[name] = scene.multiplayerSystem.updates;
                } else if(this._updates.scenes[name] !== scene.multiplayerSystem.updates) {
                    // this.logger.warn(`Map scene ${name} state is out of sync!`, this._updates.maps[name], scene.updates);
                    this._updates.scenes[name] = scene.multiplayerSystem.updates;
                }
            }
        }
    }

    getStatesScenes() {
        const scenes: GameState['scenes'] = {};
        for (const name in this.scenes) {
            const scene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            if(scene.multiplayerSystem) {
                scenes[name] = scene.multiplayerSystem.state || {};
            }
        }
        return scenes
    }

    getUpdatesScenes() {
        const scenes: GameUpdates['scenes'] = {};
        for (const name in this.scenes) {
            const scene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            if(scene.multiplayerSystem?.dirty) {
                scenes[name] = scene.multiplayerSystem.updates || {};
            }
        }
        return scenes
    }

    initState(initialState: GameUpdates = {}): GameState {
        this._state = {...this._state, ...initialState};
        this._state.scenes = this.getStatesScenes()
        return this._state;
    }

    /**
     * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
     * would levels or menus.
     *
     * @param key  The name of the scene, must be unique
     * @param scene The scene to add to the engine
     */
    addScene(key: string, scene: Scene) {
        super.addScene(key, scene);
    }

    /**
     * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
     * would levels or menus.
     * @param sceneKey  The key of the scene, must be unique
     * @param scene     The scene to add to the engine
     */
    public add(sceneKey: string, scene: Scene): void;
    /**
     * Adds a [[Timer]] to the [[currentScene]].
     * @param timer  The timer to add to the [[currentScene]].
     */
    public add(timer: Timer): void;
    /**
     * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
     * will be drawn and updated.
     */
    public add(tileMap: TileMap): void;
    /**
     * Adds an actor to the [[currentScene]] of the game. This is synonymous
     * to calling `engine.currentScene.add(actor)`.
     *
     * Actors can only be drawn if they are a member of a scene, and only
     * the [[currentScene]] may be drawn or updated.
     *
     * @param actor  The actor to add to the [[currentScene]]
     */
    public add(actor: Actor): void;

    public add(entity: Entity): void;

    /**
     * Adds a [[ScreenElement]] to the [[currentScene]] of the game,
     * ScreenElements do not participate in collisions, instead the
     * remain in the same place on the screen.
     * @param screenElement  The ScreenElement to add to the [[currentScene]]
     */
    public add(screenElement: ScreenElement): void;
    public add(...args: any[]): void {
        if (args.length >= 2) {
          this.addScene(<string>args[0], <Scene>args[1]);
          return;
        }
        super.add(args[0])
    }

    public addMapScenes() {
        const mapNames = Object.keys(resources.maps);
        for (const mapName of mapNames) {
          if (resources.maps[mapName]) {
            this.addScene(mapName, new MapScene(this.gameOptions, mapName, resources.maps[mapName]));
          }
        }

        return resources.maps;
    }   

    /**
     * Starts the internal game loop for Excalibur after loading
     * any provided assets.
     * Note: start() only resolves AFTER the user has clicked the play button
     */
    async start() {

        // Enable Gamepad support
        this.input.gamepads.enabled = true;
        this.input.gamepads.setMinimumGamepadConfiguration({
        axis: 0,
        buttons: 8
        });

        // Log when pads disconnect and connect
        this.input.gamepads.on('connect', (event: GamepadConnectEvent) => {
        this.logger.debug('[Main] Gamepad connect');
        });

        this.input.gamepads.on('disconnect', (event: GamepadDisconnectEvent) => {
        this.logger.debug('[Main] Gamepad disconnect');
        });

        this.input.gamepads.at(0).on('button', (event: GamepadButtonEvent) => {
        this.logger.debug('[Main] button', event.button, event.value);
        });

        this.input.gamepads.at(0).on('axis', (event: GamepadAxisEvent) => {
        this.logger.debug('[Main] axis', event.axis, event.value);
        });

        this.addMapScenes();
        this.goToScene('player_house_bedroom.tmx');

        this.logger.debug('[Main] pixelRatio', this.pixelRatio);
        this.logger.debug('[Main] isHiDpi', this.isHiDpi);

        this.logger.defaultLevel = LogLevel.Debug;

        const loader = new Loader([...resources.getMapArr(), ...resources.getSpriteArr()]);
        loader.backgroundColor = Color.Black.toString();

        await super.start(loader);
    }

    override onPostUpdate(engine: PrpgEngine, delta: number) {
        super.onPostUpdate(engine, delta);

        this.collectUpdates();
        if(this.dirty) {
            const updatesEvent = new GameEvent<Readonly<GameUpdates>>()
            updatesEvent.target = this.updates;
            this.emit('update', updatesEvent);
            this.resetUpdates();
        }

        this.collectStates();
        {
            const stateEvent = new GameEvent<Readonly<GameState>>()
            stateEvent.target = this.state;
            this.emit('state', stateEvent);
        }


    }

    applySceneUpdates(scenes: GameState['scenes']) {
        for (const name in scenes) {
            const updatedScene = scenes[name];
            const myScene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            if(updatedScene && myScene.multiplayerSystem && syncable(myScene.multiplayerSystem?.syncDirection, SyncDirection.IN)) {
                myScene.multiplayerSystem.applyUpdates(updatedScene);
            } else if(!myScene) {
                this.logger.warn(`Scene ${name} is not syncable!`);
            }
        }
    }

    applyUpdates(data: Partial<GameState>) {
        if(data.scenes) {
            this.applySceneUpdates(data.scenes);
        }
    }
}
