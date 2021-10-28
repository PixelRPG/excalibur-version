import { Scene, Engine, vec, Actor, Color } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgPlayerSystem } from "../systems/player.system";
import { PrpgPlayerActor } from '../actors/player.actor';

export class MapScene extends Scene {

    constructor(readonly activeTiledMap: TiledMapResource) {
        super();
    }

    /**
     * Init properties defined in tiled map
     * TODO move this to a polygon system?
     */
    private initTiledMapProperties() {
        const mapProperties = this.activeTiledMap.data.getExcaliburObjects();

        console.debug("map camera zoom", mapProperties[0].getCamera().zoom);
     
        if (mapProperties.length > 0) {
            
            // Use polyline for patrols
            const lines = mapProperties[0].getPolyLines();
            for (let line of lines) {
                    if (line && line.polyline) {
                        const start = vec(line.x, line.y);
                        const firstpoint = line.polyline[0];
                        const patrol = new Actor({x: line.x + firstpoint.x, y: line.y + firstpoint.y, color: Color.Green, width: 25, height: 25});
                        patrol.actions.repeatForever(ctx => {
                            for (const p of (line.polyline ?? [])) {
                                ctx.moveTo(p.x + start.x, p.y + start.y, 100);
                            }
                        });
                        this.add(patrol);
                    }
            }
     
            // Use polygon for patrols
            const polys = mapProperties[0].getPolygons();
            for (let poly of polys) {
                poly.polygon?.push(poly.polygon[0]); // needs to end where it started
                if (poly && poly.polygon) {
                    const start = vec(poly.x, poly.y);
                    const firstpoint = poly.polygon[0];
                    const patrol = new Actor({x: poly.x + firstpoint.x, y: poly.y + firstpoint.y, color: Color.Green, width: 25, height: 25});
                    patrol.actions.repeatForever(ctx => {
                        for (const p of (poly.polygon ?? [])) {
                            ctx.moveTo(p.x + start.x, p.y + start.y, 100);
                        }
                    })
                    this.add(patrol);
                }
            }
        }
    }


    public onInitialize(engine: Engine) {
        this.activeTiledMap.addTiledMapToScene(this);
        this.world.add(new PrpgPlayerSystem(engine.input));

        const player = new PrpgPlayerActor();
        this.add(player);
        
        this.initTiledMapProperties();
    }
}