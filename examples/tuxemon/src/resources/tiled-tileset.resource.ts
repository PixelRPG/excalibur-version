import { Resource, ImageSource } from 'excalibur';
import type { Loadable } from 'excalibur';
import { TiledTileset, RawTiledTileset, parseExternalTsx, parseExternalJson } from '@excaliburjs/plugin-tiled';

export class TiledTilesetResource implements Loadable<TiledTileset | null> {

    protected _resource: Resource<RawTiledTileset>

    /**
     * Data associated with a loadable
     */
    data: TiledTileset | null = null;

    image: ImageSource | null = null;

    get raw() {
        return this._resource.data;
    }

    constructor(public path: string, public isJson: boolean = false) {
        this._resource = new Resource<RawTiledTileset>(path, isJson ? 'json' : 'text');
    }

    /**
     * Begins loading the resource and returns a promise to be resolved on completion
     */
    public async load(): Promise<TiledTileset> {
        let rawTileSet = await this._resource.load();
        if (this.isJson) {
            this.data = parseExternalJson(rawTileSet, 0, this.path);
        } else {
            this.data = parseExternalTsx(rawTileSet as unknown as string, 0, this.path);
        }
        if(this.data.image) {
            this.image = new ImageSource(this.convertPath(this.path, this.data.image));
            await this.image.load();
        }
        console.debug(`Loaded tileset ${this.data.name} from ${this.path}`, this.data, this.image);
        return this.data;
    }

    /**
     * Returns true if the loadable is loaded
     */
    public isLoaded(): boolean {
        return this._resource.isLoaded();
    }

    protected convertPath(originPath: string, relativePath: string) {
        // Use absolute path if specified
        if (relativePath.indexOf('/') === 0) {
           return relativePath;
        }

        const originSplit = originPath.split('/');
        const relativeSplit = relativePath.split('/');
        // if origin path is a file, remove it so it's a directory
        if (originSplit[originSplit.length - 1].includes('.')) {
           originSplit.pop();
        }
        return originSplit.concat(relativeSplit).join('/');
    }

}