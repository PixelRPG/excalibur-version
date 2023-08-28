import { Entity, Component } from "excalibur";
import {
    MultiplayerSyncComponent,
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
} from "../components";
import { PrpgComponentType } from "../types";
import type { Blueprint } from "../types";


export class BlueprintSystem {

    static createComponent(componentName: string, componentData: any | undefined = undefined) {
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
            case PrpgComponentType.MULTIPLAYER_SYNC:
                return new MultiplayerSyncComponent(componentData);
            default:
                throw new Error(`Component ${componentName} not found.`);
        }
    }

    static createComponents(components: Blueprint['entities']['components']) {
        let componentInstances: Component[] = [];
        for (let componentName in components) {
            // @ts-ignore
            const data = components[componentName];
            componentInstances.push(this.createComponent(componentName, data));
        }
        return componentInstances;
    }


    static createEntitiesFromBlueprint(blueprint: Blueprint): Entity[] {
        const entities: Entity[] = [];
        for (let entityName in blueprint.entities) {
            const data = blueprint.entities[entityName];
            const components = this.createComponents(data);
            const entity = new Entity(components, entityName);
            entities.push(entity);
        }
        return entities;
    }
}