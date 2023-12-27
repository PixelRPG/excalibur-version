import {
    Logger, Scene, Entity,
} from 'excalibur';

import { PrpgComponentType } from '../types';
import { resources } from '../managers/index';
import { BlueprintService, TilemapService } from './index'
import { PrpgMenuComponent, PrpgTileboxComponent, PrpgScreenPositionComponent } from '../components'

export class MenuService {
    private logger = Logger.getInstance();

    static instance: MenuService;
  
    protected constructor() { }
  
    public static getInstance() {
        if (!MenuService.instance) {
            MenuService.instance = new MenuService();
        }
        return MenuService.instance;
    }

    public createMenu(scene: Scene, entityName: string) {
        const menu = resources.menus[entityName];
        if(!menu?.data) {
            throw new Error('Menu blueprint not found');
        }

        const menuEntity = BlueprintService.getInstance().createEntityFromBlueprint(menu.data, entityName);

        const screen = menuEntity.get<PrpgScreenPositionComponent>(PrpgComponentType.SCREEN_POSITION);

        const menuItemEntities = menuEntity.get(PrpgMenuComponent)?.items || {};
        for (const key in menuItemEntities) {
            if (Object.prototype.hasOwnProperty.call(menuItemEntities, key)) {
                const menuItemEntity = menuItemEntities[key];
                if(!menuItemEntity) {
                    throw new Error(`Entity ${key} not found`);
                }
                scene.add(menuItemEntity);
            }
        }

        const tilebox = menuEntity.get(PrpgTileboxComponent);
        if(tilebox) {
            // if the tilebox is a screen, set it to the screen
            if(screen) {
                const tilemap = TilemapService.getInstance();
                tilemap.setToScreen(tilebox.tilemap)
            }

            scene.add(tilebox.tilemap);
        }
        scene.add(menuEntity);

        return menuEntity;
    }

    public createMenus(scene: Scene) {
        const result: {[name: string]: Entity} = {};
        const menus = resources.menus;
        for (const entityName in menus) {
            const entity = this.createMenu(scene, entityName);
            result[entityName] = entity;
        }
        return result;
    }

}