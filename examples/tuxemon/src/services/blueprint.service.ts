import { Entity, Component, Actor, ScreenElement } from "excalibur";
import {
    PrpgMultiplayerSyncComponent,
    PrpgActionComponent,
    PrpgBodyComponent,
    PrpgCharacterComponent,
    PrpgControllableComponent,
    PrpgFadeScreenComponent,
    PrpgMapComponent,
    PrpgMenuComponent,
    PrpgMenuItemComponent,
    PrpgMenuVisibleComponent,
    PrpgPlayerComponent,
    PrpgScreenPositionComponent,
    PrpgSelectableComponent,
    PrpgSpawnPointComponent,
    PrpgTeleportComponent,
    PrpgTeleportableComponent,
    PrpgTextComponent,
} from "../components";
import { PrpgComponentType } from "../types";
import type { Blueprint } from "../types";


export class BlueprintService {

    static instance: BlueprintService;

    protected constructor() { }

    public static getInstance() {
        if (!BlueprintService.instance) {
            BlueprintService.instance = new BlueprintService();
        }
        return BlueprintService.instance;
    }

    protected createComponent(componentName: string, componentData: any | undefined = undefined) {
        console.debug('createComponent', componentName, componentData);
        switch (componentName) {
            case PrpgComponentType.ACTION:
                return new PrpgActionComponent(componentData);
            case PrpgComponentType.BODY:
                return new PrpgBodyComponent(componentData);
            case PrpgComponentType.CHARACTER:
                return new PrpgCharacterComponent(componentData);
            case PrpgComponentType.CONTROLLABLE:
                return new PrpgControllableComponent(componentData);
            case PrpgComponentType.FADE_SCREEN:
                return new PrpgFadeScreenComponent(componentData);
            case PrpgComponentType.MAP:
                return new PrpgMapComponent(componentData);
            case PrpgComponentType.MENU:
                return new PrpgMenuComponent(componentData);
            case PrpgComponentType.MENU_ITEM:
                return new PrpgMenuItemComponent(componentData);
            case PrpgComponentType.MENU_VISIBLE:
                return new PrpgMenuVisibleComponent(componentData);
            case PrpgComponentType.PLAYER:
                return new PrpgPlayerComponent(componentData);
            case PrpgComponentType.SCREEN_POSITION:
                return new PrpgScreenPositionComponent(componentData);
            case PrpgComponentType.SELECTABLE:
                return new PrpgSelectableComponent(componentData);
            case PrpgComponentType.SPAWN_POINT:
                return new PrpgSpawnPointComponent(componentData);
            case PrpgComponentType.TELEPORT:
                return new PrpgTeleportComponent(componentData);
            case PrpgComponentType.TELEPORTABLE:
                return new PrpgTeleportableComponent(componentData);
                case PrpgComponentType.TEXT:
                    return new PrpgTextComponent(componentData);
            case PrpgComponentType.MULTIPLAYER_SYNC:
                return new PrpgMultiplayerSyncComponent(componentData);
            default:
                throw new Error(`Component ${componentName} not found.`);
        }
    }

    protected createComponents(components: Blueprint['entityName']) {
        let componentInstances: Component[] = [];
        for (let componentName in components) {
            // @ts-ignore
            const data = components[componentName];
            componentInstances.push(this.createComponent(componentName, data));
        }
        return componentInstances;
    }


    public createEntitiesFromBlueprint(blueprint: Blueprint): { [name: string]: Entity | undefined } {
        const entities: { [name: string]: Entity | undefined } = {};
        for (let entityName in blueprint) {
            const data = blueprint[entityName];
            const components = this.createComponents(data);
            let entity: Entity;
            // if SCREEN_POSITION is defined, create a ScreenElement
            if(data[PrpgComponentType.SCREEN_POSITION]) {
                entity = new ScreenElement({ name: entityName });
                for(let component of components) {
                    entity.addComponent(component)
                }
            }
            // if BODY is defined, create an Actor
            else if(data[PrpgComponentType.BODY]) {
                entity = new Actor({ name: entityName });
                for(let component of components) {
                    entity.addComponent(component)
                }
            }
            // otherwise, create a generic Entity
            else {
                entity = new Entity(components, entityName);
            }

            entities[entityName] = entity;

        }
        return entities;
    }
}