import type { Scene } from 'excalibur';
export const findEntityByNameFromScene = (scene: Scene, name: string) => {
    return scene.entities.find(entity => entity.name === name);
}

export const findEntityByNameInScenes = (scenes: {[name: string]: Scene}, name: string) => {
    for (const key in scenes) {
        const entity = findEntityByNameFromScene(scenes[key], name);
        if(entity) {
           return entity;
        }
    }
}