import { BodyComponentState } from './body-component-state';

export interface EntityState extends Partial<BodyComponentState> {
    /** The name of the entity */
    name?: string;
}