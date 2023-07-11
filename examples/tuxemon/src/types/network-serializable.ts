/**
 * Interface for classes that support serialization and deserialization 
 * of data for network exchange in a multiplayer scenario.
 *
 * A class implementing this interface provides the capability to convert 
 * its instance data into a format (serialize) that can be transmitted 
 * over a network, and the ability to convert these serialized data back 
 * into instance data (deserialize).
 *
 * Both methods, `serialize` and `deserialize`, should be used in pair, 
 * i.e., the `deserialize` method should be able to correctly convert 
 * any string produced by the `serialize` method back into instance data.
 */
export interface NetworkSerializable<T = any> {
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