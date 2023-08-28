import { Component } from 'excalibur';
import { PrpgComponentType } from "../types/component-type";

export abstract class PrpgBaseComponent<T extends PrpgComponentType, S> extends Component<T> {
    readonly abstract type: T;
    protected _state: S;

    /**
     * Contains the full state of the component.
     */
    get state(): Readonly<S> {
        return this._state;
    }

    constructor(data: Partial<S>) {
        super();
        this._state = data as S;
    }
}