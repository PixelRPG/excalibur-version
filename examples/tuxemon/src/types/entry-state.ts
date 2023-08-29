import { BodyComponentState } from '.';

export interface EntityState extends Partial<BodyComponentState> {
    /** The name of the entity */
    name?: string;
}