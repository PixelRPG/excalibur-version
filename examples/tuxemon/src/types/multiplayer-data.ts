export interface MultiplayerData<T = any> {
    /**
     * Returns the data to be synced across the other players
     */
    serialize(): T;

    /**
     * Applies the data received from the other players
     * @param data
     * @returns
     * @throws Error if the data is invalid
     */
    deserialize(data: T): void;
}