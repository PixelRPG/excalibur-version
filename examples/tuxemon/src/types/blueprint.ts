import { PrpgComponentType } from '.';
export type Blueprint = {
    [entityName: string]: {
        [K in PrpgComponentType]?: any

    };
};
