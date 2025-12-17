export type OperationOverride = {
  resourceName?: string;
  operationName?: string;
  hidden?: boolean;
};

export const operationOverrides: Record<string, OperationOverride> = {
  get_customers_by_customerid_agents_with_children: {
    operationName: 'Get a list of agents including children',
  },
  post_customers_by_customerid_custom_url_groups: {
    operationName: 'Create custom URL group under a customer',
  },
};
