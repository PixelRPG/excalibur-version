import { Component } from 'excalibur';
import { PrpgComponentType } from "../types";

export abstract class PrpgBaseComponent<TYPE extends PrpgComponentType, STATE, ARGS extends Partial<STATE> = STATE> extends Component {
    readonly abstract type: TYPE;
    protected abstract _state: STATE;

    /**
     * Contains the full state of the component.
     */
    get state(): Readonly<STATE> {
        return this._state;
    }

    constructor(data: ARGS) {
        super();
        // this._state = data as unknown as STATE; // TODO?
    }
}