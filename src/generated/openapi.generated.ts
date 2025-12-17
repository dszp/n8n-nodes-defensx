export type SchemaProperty = {
  type: string;
  description?: string;
};

export type SchemaShape = {
  type: string;
  isSimpleObject: boolean;
  required?: string[];
  properties?: Record<string, SchemaProperty>;
};

export type GeneratedParameter = {
  name: string;
  in: 'path' | 'query';
  required: boolean;
  description?: string;
  schemaType: string;
};

export type GeneratedRequestBody = {
  contentType: string;
  schema: SchemaShape;
};

export type GeneratedOperation = {
  id: string;
  tag: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  parameters: GeneratedParameter[];
  requestBody?: GeneratedRequestBody;
};

export const generatedOperations: GeneratedOperation[] = [
  {
    "id": "get_status",
    "tag": "Status",
    "method": "GET",
    "path": "/status",
    "summary": "Status (health) check endpoint",
    "parameters": []
  },
  {
    "id": "get_products",
    "tag": "Products",
    "method": "GET",
    "path": "/products",
    "summary": "List all available products for subscription",
    "parameters": []
  },
  {
    "id": "get_message_templates",
    "tag": "Message Templates",
    "method": "GET",
    "path": "/message_templates",
    "summary": "List all available message templates for customers",
    "parameters": []
  },
  {
    "id": "get_policy_templates",
    "tag": "Policy Templates",
    "method": "GET",
    "path": "/policy_templates",
    "summary": "List all available policy templates for customers",
    "parameters": []
  },
  {
    "id": "get_usage",
    "tag": "Usage",
    "method": "GET",
    "path": "/usage",
    "summary": "Get the calculated usage of customers",
    "description": "To filter the results by customer, you need to provide `customerId` parameter. Otherwise, all of the customer subscriptions will be returned.\n\n`from` parameter is required, date format can be YYYY-MM-DD or javascript notation of as 2021-03-06T00:00:00.000Z\n\nIf `to` parameter is not present, current time will be used as end of the interval.\n\nYou can only query usage records by maximum of 6 months period. If the range between\n`from` and `to` exceeds 6 months, an error code will be returned.\n",
    "parameters": [
      {
        "name": "customerId",
        "in": "query",
        "required": false,
        "description": "Customer ID related to the usage report",
        "schemaType": "string"
      },
      {
        "name": "from",
        "in": "query",
        "required": true,
        "description": "Date from which usage will be obtained (in format YYYY-MM-DD, with optional HH:MM:SS and no timezone)",
        "schemaType": "string"
      },
      {
        "name": "to",
        "in": "query",
        "required": false,
        "description": "Date up to which usage will be obtained (in format YYYY-MM-DD, with optional HH:MM:SS and no timezone)",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_usage_current",
    "tag": "Usage",
    "method": "GET",
    "path": "/usage/current",
    "summary": "Get the current usage which is not billed yet in current subscription term window",
    "description": "To filter the results by customer, you need to provide `customerId` parameter. Otherwise, all of the customer subscriptions will be returned.\n\nOnly the records in current term which is not billed yet will be returned.\n",
    "parameters": [
      {
        "name": "customerId",
        "in": "query",
        "required": false,
        "description": "Customer ID related to the usage report",
        "schemaType": "string"
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "description": "Page number wanted for pagination (default: 1)",
        "schemaType": "integer"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "description": "Number of records to be returned in pagination (default: 1000)",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_usage_details",
    "tag": "Usage",
    "method": "GET",
    "path": "/usage/details",
    "summary": "Get the usage details per user of a subscription",
    "description": "Both of the `subscriptionId` and `usageId` must be present in the query parameters.\n",
    "parameters": [
      {
        "name": "subscriptionId",
        "in": "query",
        "required": true,
        "description": "Subscription ID received previously received on /usage response",
        "schemaType": "string"
      },
      {
        "name": "usageId",
        "in": "query",
        "required": true,
        "description": "Usage ID for a given period in a subscription previously received on /usage response",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers",
    "tag": "Customers",
    "method": "GET",
    "path": "/customers",
    "summary": "List all customers under the Partner account",
    "parameters": []
  },
  {
    "id": "post_customers",
    "tag": "Customers",
    "method": "POST",
    "path": "/customers",
    "summary": "Create customer",
    "description": "Create a new customer\n",
    "parameters": [],
    "requestBody": {
      "contentType": "application/json",
      "schema": {
        "type": "object",
        "required": [
          "name",
          "subscription_id"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "domain": {
            "type": "string"
          },
          "subscription_id": {
            "type": "integer"
          },
          "message_template_id": {
            "type": "string"
          },
          "policy_template_id": {
            "type": "string"
          }
        },
        "isSimpleObject": true
      }
    }
  },
  {
    "id": "get_customers_self",
    "tag": "Customers",
    "method": "GET",
    "path": "/customers/self",
    "summary": "Get self customer of Partner",
    "parameters": []
  },
  {
    "id": "get_customers_by_customerid_agents",
    "tag": "Agents",
    "method": "GET",
    "path": "/customers/{customerId}/agents",
    "summary": "Get list of agents",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_agents_with_children",
    "tag": "Agents",
    "method": "GET",
    "path": "/customers/{customerId}/agents_with_children",
    "summary": "Get list of agents including with children element",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_deployments",
    "tag": "Deployments",
    "method": "GET",
    "path": "/customers/{customerId}/deployments",
    "summary": "Get list of deployments",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_groups",
    "tag": "Groups",
    "method": "GET",
    "path": "/customers/{customerId}/groups",
    "summary": "Get list of groups",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "description": "Page number wanted for pagination (default: 1)",
        "schemaType": "integer"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "description": "Number of users to be returned in pagination (default: 100)",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_users",
    "tag": "Users",
    "method": "GET",
    "path": "/customers/{customerId}/users",
    "summary": "Get list of users",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "description": "Page number wanted for pagination (default: 1)",
        "schemaType": "integer"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "description": "Number of users to be returned in pagination (default: 1000)",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_browser_extensions",
    "tag": "Browser Extensions",
    "method": "GET",
    "path": "/customers/{customerId}/browser_extensions",
    "summary": "Get list of browser extensions",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_browser_extensions_low_reputation",
    "tag": "Browser Extensions",
    "method": "GET",
    "path": "/customers/{customerId}/browser_extensions/low_reputation",
    "summary": "Get list of browser extensions with low reputation",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_browser_extensions_by_browserextensionid_users",
    "tag": "Browser Extensions",
    "method": "GET",
    "path": "/customers/{customerId}/browser_extensions/{browserExtensionId}/users",
    "summary": "Get list of users using browser extension",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "browserExtensionId",
        "in": "path",
        "required": true,
        "description": "ID of browser extension",
        "schemaType": "integer"
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "description": "Page number wanted for pagination (default: 1)",
        "schemaType": "integer"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "description": "Number of users to be returned in pagination (default: 100)",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_webfilter_categories",
    "tag": "Policies",
    "method": "GET",
    "path": "/webfilter_categories",
    "summary": "Get list of Webfilter Categories",
    "parameters": []
  },
  {
    "id": "get_customers_by_customerid_policies",
    "tag": "Policies",
    "method": "GET",
    "path": "/customers/{customerId}/policies",
    "summary": "Get list of policy groups",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "post_customers_by_customerid_policies",
    "tag": "Policies",
    "method": "POST",
    "path": "/customers/{customerId}/policies",
    "summary": "Create policy group",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      }
    ],
    "requestBody": {
      "contentType": "application/json",
      "schema": {
        "type": "unknown",
        "isSimpleObject": false
      }
    }
  },
  {
    "id": "get_customers_by_customerid_policies_by_policygroupid",
    "tag": "Policies",
    "method": "GET",
    "path": "/customers/{customerId}/policies/{policyGroupId}",
    "summary": "Show Policy",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "policyGroupId",
        "in": "path",
        "required": true,
        "description": "ID of policy group",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "patch_customers_by_customerid_policies_by_policygroupid",
    "tag": "Policies",
    "method": "PATCH",
    "path": "/customers/{customerId}/policies/{policyGroupId}",
    "summary": "Update policy group partially",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "policyGroupId",
        "in": "path",
        "required": true,
        "description": "ID of policy group",
        "schemaType": "integer"
      }
    ],
    "requestBody": {
      "contentType": "application/json",
      "schema": {
        "type": "unknown",
        "isSimpleObject": false
      }
    }
  },
  {
    "id": "delete_customers_by_customerid_policies_by_policygroupid",
    "tag": "Policies",
    "method": "DELETE",
    "path": "/customers/{customerId}/policies/{policyGroupId}",
    "summary": "Delete policy group",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "policyGroupId",
        "in": "path",
        "required": true,
        "description": "ID of policy group",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_custom_urls_search",
    "tag": "Custom Urls",
    "method": "GET",
    "path": "/customers/{customerId}/custom_urls/search",
    "summary": "Search custom url groups for a given hostname",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "hostname",
        "in": "query",
        "required": true,
        "description": "Queried hostname",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_custom_url_groups",
    "tag": "Custom Url Groups",
    "method": "GET",
    "path": "/customers/{customerId}/custom_url_groups",
    "summary": "Get list of custom url groups for a customer",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "post_customers_by_customerid_custom_url_groups",
    "tag": "Custom Url Groups",
    "method": "POST",
    "path": "/customers/{customerId}/custom_url_groups",
    "summary": "Creates custom url group under a customer",
    "description": "In order to be create a custom url group for a given customer, customer must have a valid subscription.",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      }
    ],
    "requestBody": {
      "contentType": "application/json",
      "schema": {
        "type": "object",
        "required": [],
        "properties": {
          "name": {
            "type": "string"
          },
          "config_type": {
            "type": "string"
          }
        },
        "isSimpleObject": true
      }
    }
  },
  {
    "id": "delete_customers_by_customerid_custom_url_groups_by_customurlgroupid",
    "tag": "Custom Url Groups",
    "method": "DELETE",
    "path": "/customers/{customerId}/custom_url_groups/{customUrlGroupId}",
    "summary": "Delete a custom url group and all of its custom urls",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "customUrlGroupId",
        "in": "path",
        "required": true,
        "description": "ID of custom url group",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_custom_url_groups_by_customurlgroupid_custom_urls",
    "tag": "Custom Urls",
    "method": "GET",
    "path": "/customers/{customerId}/custom_url_groups/{customUrlGroupId}/custom_urls",
    "summary": "Get list of custom urls or search for a given hostname in the custom url group",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "customUrlGroupId",
        "in": "path",
        "required": true,
        "description": "ID of custom url group",
        "schemaType": "integer"
      },
      {
        "name": "q",
        "in": "query",
        "required": false,
        "description": "Optional string to search in custom urls",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "post_customers_by_customerid_custom_url_groups_by_customurlgroupid_custom_urls",
    "tag": "Custom Urls",
    "method": "POST",
    "path": "/customers/{customerId}/custom_url_groups/{customUrlGroupId}/custom_urls",
    "summary": "Create one or more custom urls in specific custom url group",
    "description": "Multiple custom urls can be created in a single request.\n\nYou can insert maximum of `1000` custom urls per request.\n\nIf you want to add a rule for a specific domain and all of the subdomains, you should use `*.` prefix for the domain.\nFor example, `*.facebook.com`\n",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "customUrlGroupId",
        "in": "path",
        "required": true,
        "description": "ID of custom url group",
        "schemaType": "integer"
      }
    ],
    "requestBody": {
      "contentType": "application/json",
      "schema": {
        "type": "array",
        "isSimpleObject": false
      }
    }
  },
  {
    "id": "delete_customers_by_customerid_custom_url_groups_by_customurlgroupid_custom_urls_by_customurlid",
    "tag": "Custom Urls",
    "method": "DELETE",
    "path": "/customers/{customerId}/custom_url_groups/{customUrlGroupId}/custom_urls/{customUrlId}",
    "summary": "Delete a custom url in specific custom url group",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "customUrlGroupId",
        "in": "path",
        "required": true,
        "description": "ID of custom url group",
        "schemaType": "integer"
      },
      {
        "name": "customUrlId",
        "in": "path",
        "required": true,
        "description": "ID of custom url",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_logs_urls",
    "tag": "Logs",
    "method": "GET",
    "path": "/customers/{customerId}/logs/urls",
    "summary": "Get URL logs from extension, mobile and RBI sessions",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Log window start date, can be in json datetime or unix timestamp (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "Log window end date, can be in json datetime or unix timestamp (default: end of the month)",
        "schemaType": "string"
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "description": "Page number wanted for pagination (default: 1)",
        "schemaType": "integer"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "description": "Number of partners to be returned in pagination (default: 5000)",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_logs_credentials",
    "tag": "Logs",
    "method": "GET",
    "path": "/customers/{customerId}/logs/credentials",
    "summary": "Get credential logs for extension and mobile endpoints",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Log window start date, can be in json datetime or unix timestamp (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "Log window end date, can be in json datetime or unix timestamp (default: end of the month)",
        "schemaType": "string"
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "description": "Page number wanted for pagination (default: 1)",
        "schemaType": "integer"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "description": "Number of partners to be returned in pagination (default: 5000)",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_logs_file_transfers",
    "tag": "Logs",
    "method": "GET",
    "path": "/customers/{customerId}/logs/file_transfers",
    "summary": "Get file transfers logs",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Log window start date, can be in json datetime or unix timestamp (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "Log window end date, can be in json datetime or unix timestamp (default: end of the month)",
        "schemaType": "string"
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "description": "Page number wanted for pagination (default: 1)",
        "schemaType": "integer"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "description": "Number of partners to be returned in pagination (default: 5000)",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_logs_consents",
    "tag": "Logs",
    "method": "GET",
    "path": "/customers/{customerId}/logs/consents",
    "summary": "Get consent logs",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Log window start date, can be in json datetime or unix timestamp (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "Log window end date, can be in json datetime or unix timestamp (default: end of the month)",
        "schemaType": "string"
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "description": "Page number wanted for pagination (default: 1)",
        "schemaType": "integer"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "description": "Number of partners to be returned in pagination (default: 5000)",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_logs_dns",
    "tag": "Logs",
    "method": "GET",
    "path": "/customers/{customerId}/logs/dns",
    "summary": "Get DNS logs from agent",
    "description": "DNS logs only created by the agent itself. If browser extension or mobile applications in used, no separate DNS logs provided. You can get all the logs as URL Logs on this case.\n\nNote: In default mode, DNS requests that is allowed by the policy not logged. Queries logged only if getting a policy other than the Allow.\n",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Log window start date, can be in json datetime or unix timestamp (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "Log window end date, can be in json datetime or unix timestamp (default: end of the month)",
        "schemaType": "string"
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "description": "Page number wanted for pagination (default: 1)",
        "schemaType": "integer"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "description": "Number of partners to be returned in pagination (default: 5000)",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_logs_rbi",
    "tag": "Logs",
    "method": "GET",
    "path": "/customers/{customerId}/logs/rbi",
    "summary": "Get RBI (Remote Browser Isolation) session logs",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Log window start date, can be in json datetime or unix timestamp (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "Log window end date, can be in json datetime or unix timestamp (default: end of the month)",
        "schemaType": "string"
      },
      {
        "name": "page",
        "in": "query",
        "required": false,
        "description": "Page number wanted for pagination (default: 1)",
        "schemaType": "integer"
      },
      {
        "name": "limit",
        "in": "query",
        "required": false,
        "description": "Number of partners to be returned in pagination (default: 5000)",
        "schemaType": "integer"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_stats_categories",
    "tag": "Stats",
    "method": "GET",
    "path": "/customers/{customerId}/stats/categories",
    "summary": "Get Top 20 visited categories",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of customer",
        "schemaType": "string"
      },
      {
        "name": "source",
        "in": "query",
        "required": false,
        "description": "By default, URL logs from the browsers are used to provide better visibility and eliminate false positives. \nDNS requests from the fat clients are not logged, except for clientless deployments.\n",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Start date, can be in json datetime or unix timestamp format (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "End date, can be in json datetime or unix timestamp format (default: end of the month)",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_stats_category_by_categoryid_hostnames",
    "tag": "Stats",
    "method": "GET",
    "path": "/customers/{customerId}/stats/category/{categoryId}/hostnames",
    "summary": "Get Top 20 visited hostname under a specific category",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of the customer",
        "schemaType": "string"
      },
      {
        "name": "categoryId",
        "in": "path",
        "required": true,
        "description": "ID of the category",
        "schemaType": "integer"
      },
      {
        "name": "source",
        "in": "query",
        "required": false,
        "description": "By default, URL logs from the browsers are used to provide better visibility and eliminate false positives. \nDNS requests from the fat clients are not logged, except for clientless deployments.\n",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Start date, can be in json datetime or unix timestamp format (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "End date, can be in json datetime or unix timestamp format (default: end of the month)",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_stats_uncategorized_hostnames",
    "tag": "Stats",
    "method": "GET",
    "path": "/customers/{customerId}/stats/uncategorized_hostnames",
    "summary": "Get Top 20 visited uncategorized hostnames or IP address",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of the customer",
        "schemaType": "string"
      },
      {
        "name": "source",
        "in": "query",
        "required": false,
        "description": "By default, URL logs from the browsers are used to provide better visibility and eliminate false positives. \nDNS requests from the fat clients are not logged, except for clientless deployments.\n",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Start date, can be in json datetime or unix timestamp format (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "End date, can be in json datetime or unix timestamp format (default: end of the month)",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_stats_blocked_hostnames",
    "tag": "Stats",
    "method": "GET",
    "path": "/customers/{customerId}/stats/blocked_hostnames",
    "summary": "Get Top 20 blocked hostnames or IP address",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of the customer",
        "schemaType": "string"
      },
      {
        "name": "source",
        "in": "query",
        "required": false,
        "description": "By default, URL logs from the browsers are used to provide better visibility and eliminate false positives. \nDNS requests from the fat clients are not logged, except for clientless deployments.\n",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Start date, can be in json datetime or unix timestamp format (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "End date, can be in json datetime or unix timestamp format (default: end of the month)",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_stats_blocked_categories",
    "tag": "Stats",
    "method": "GET",
    "path": "/customers/{customerId}/stats/blocked_categories",
    "summary": "Get Top 20 blocked categories",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of the customer",
        "schemaType": "string"
      },
      {
        "name": "source",
        "in": "query",
        "required": false,
        "description": "By default, URL logs from the browsers are used to provide better visibility and eliminate false positives. \nDNS requests from the fat clients are not logged, except for clientless deployments.\n",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Start date, can be in json datetime or unix timestamp format (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "End date, can be in json datetime or unix timestamp format (default: end of the month)",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_stats_credentials",
    "tag": "Stats",
    "method": "GET",
    "path": "/customers/{customerId}/stats/credentials",
    "summary": "Get Top 20 hostnames or IP address that users put their credentials",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of the customer",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Start date, can be in json datetime or unix timestamp format (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "End date, can be in json datetime or unix timestamp format (default: end of the month)",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_stats_credentials_with_consents",
    "tag": "Stats",
    "method": "GET",
    "path": "/customers/{customerId}/stats/credentials_with_consents",
    "summary": "Get Top 20 hostnames or IP address that users give their consents and put the credentials",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of the customer",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Start date, can be in json datetime or unix timestamp format (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "End date, can be in json datetime or unix timestamp format (default: end of the month)",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_stats_credentials_blocked",
    "tag": "Stats",
    "method": "GET",
    "path": "/customers/{customerId}/stats/credentials_blocked",
    "summary": "Get Top 20 hostnames or IP address that users try to put their credentials and blocked by the policy",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of the customer",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Start date, can be in json datetime or unix timestamp format (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "End date, can be in json datetime or unix timestamp format (default: end of the month)",
        "schemaType": "string"
      }
    ]
  },
  {
    "id": "get_customers_by_customerid_cyber_resilience",
    "tag": "Cyber Resilience",
    "method": "GET",
    "path": "/customers/{customerId}/cyber_resilience",
    "summary": "Get the cyber resilience score of the company between the time range including top 10 risky users",
    "parameters": [
      {
        "name": "customerId",
        "in": "path",
        "required": true,
        "description": "ID of the customer",
        "schemaType": "string"
      },
      {
        "name": "start_date",
        "in": "query",
        "required": false,
        "description": "Start date, can be in json datetime or unix timestamp format (default: beginning of the month)",
        "schemaType": "string"
      },
      {
        "name": "end_date",
        "in": "query",
        "required": false,
        "description": "End date, can be in json datetime or unix timestamp format (default: end of the month)",
        "schemaType": "string"
      }
    ]
  }
];
