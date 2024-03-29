import type { MultiplayerSyncDirection } from ".";

/**
 * Interface for classes that support deserialization of data for network exchange in a multiplayer scenario.
 */
export interface MultiplayerSyncable<S = any, U = Partial<S>> {

    get syncDirection(): MultiplayerSyncDirection;

    get dirty(): boolean;

    /**
     * Contains the full state of the component.
     */
    get state(): Readonly<S>;

    /**
     * Contains the state or changes of the component that are sent over the network.
     * This can be the full state or just the properties that have changed depending on what you want to transmit over the network.
     * The structure of this object can be as complex or as simple as necessary, the only requirement is that you can properly `deserialize` the data in order to apply the update.
     * Changes to the object are automatically detected and transmitted to other participants over P2P.
     * For instance, with the Body component, the `position` object is only included when the position has changed beyond a certain threshold, preventing every minor decimal change from being transmitted.
     */
    get updates(): Readonly<U>;

    resetUpdates(): void;

    /**
     * Applies the data received from the network (send from other players in P2P)
     * @param data
     * @returns
     * @throws Error if the data is invalid
     */
    applyUpdates(data: S): void;


}