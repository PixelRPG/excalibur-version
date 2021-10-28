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
            console.debug("polylines", lines);
            for (let line of lines) {
                if (line && line.polyline) {
                    const start = vec(line.x, line.y);
                    const firstpoint = line.polyline[0];
                    const patrol = new Actor({x: start.x + firstpoint.x, y: start.y + firstpoint.y, color: Color.Green, width: 5, height: 5});
                    patrol.actions.repeat(ctx => {
                        for (const p of (line.polyline ?? [])) {
                            const x = p.x + line.x;
                            const y = p.y + line.y;
                            ctx.moveTo(x, y, 20);
                            console.debug("Movie polyline to ", x, y);
                        }
                    }, 5);
                    this.add(patrol);
                }
                
            }
     
            // Use polygon for patrols
            const polys = mapProperties[0].getPolygons();
            console.debug("polygons", polys);
            for (let poly of polys) {
                if (poly && poly.polygon) {
                    const firstpoint = poly.polygon[0];
                    const start = vec(poly.x, poly.y);
                    const patrol = new Actor({x: start.x + firstpoint.x, y: start.y + firstpoint.y, color: Color.Blue, width: 5, height: 5});
                    patrol.actions.repeat(ctx => {
                        for (const p of (poly.polygon ?? [])) {
                            const x = p.x + poly.x;
                            const y = p.y + poly.y;
                            ctx.moveTo(x, y, 20);
                            console.debug("Movie polygon to ", x, y);
                        }
                        ctx.moveTo(start.x + firstpoint.x, start.y + firstpoint.y, 20); // needs to end where it started
                    }, 5);
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