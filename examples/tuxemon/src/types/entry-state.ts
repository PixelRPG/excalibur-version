import { BodyState } from './body-state';

export interface EntityState extends Partial<BodyState> {
    /** The name of the entity */
    name?: string;
}