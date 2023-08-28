export type Blueprint = {
    entities: {
        [entityName: string]: {
            components: {
                [componentName: string]: any;
            };
        };
    }
};
