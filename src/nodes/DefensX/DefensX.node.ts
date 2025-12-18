import type {
  IDataObject,
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
  NodeParameterValue,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
  buildOpenApiOperationProperties,
  buildOperationOptionProperties,
  buildResourceOptions,
  getOperationById,
  getParamName,
} from './openapiProperties';

function buildRequestUrl(apiRoot: string, endpoint: string): string {
  const normalizedRoot = apiRoot.replace(/\/$/, '');
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${normalizedRoot}/api/partner/v1${normalizedEndpoint}`;
}

function parseJsonParameter(
  ctx: IExecuteFunctions,
  value: NodeParameterValue,
  errorPrefix: string,
): Record<string, unknown> {
  if (value === null || value === undefined) return {};
  if (typeof value === 'object') return value as Record<string, unknown>;
  if (typeof value === 'string') {
    if (!value.trim()) return {};
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch (error) {
      throw new NodeOperationError(ctx.getNode(), `${errorPrefix}: ${String(error)}`);
    }
  }
  return {};
}

function coerceValue(
  ctx: IExecuteFunctions,
  schemaType: string,
  value: unknown,
  fieldLabel: string,
): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;

  if (schemaType === 'integer' || schemaType === 'number') {
    const num = typeof value === 'number' ? value : Number(String(value));
    if (Number.isNaN(num)) {
      throw new NodeOperationError(ctx.getNode(), `Invalid number for ${fieldLabel}`);
    }
    return schemaType === 'integer' ? Math.trunc(num) : num;
  }

  if (schemaType === 'boolean') {
    if (typeof value === 'boolean') return value;
    const normalized = String(value).trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
    throw new NodeOperationError(ctx.getNode(), `Invalid boolean for ${fieldLabel}`);
  }

  return String(value);
}

function appendResponseItems(
  returnItems: INodeExecutionData[],
  response: unknown,
  outputMode: 'items' | 'raw',
): void {
  if (outputMode === 'items' && Array.isArray(response)) {
    for (const element of response) {
      if (typeof element === 'object' && element !== null && !Array.isArray(element)) {
        returnItems.push({ json: element as IDataObject });
        continue;
      }

      returnItems.push({ json: { value: element as any } });
    }
    return;
  }

  if (outputMode === 'raw') {
    if (typeof response === 'object' && response !== null && !Array.isArray(response)) {
      returnItems.push({ json: response as IDataObject });
      return;
    }

    returnItems.push({ json: { items: response as any } });
    return;
  }

  returnItems.push({ json: response as any });
}

/**
 * Enriches an array response by adding an ID field to each element.
 * This is used to add context identifiers (like customerId or customUrlGroupId)
 * to API response items.
 *
 * @param response - The API response, expected to be an array
 * @param idFieldName - The name of the ID field to add (e.g., 'customerId')
 * @param idValue - The value to assign to the ID field
 * @returns An array with each element enriched with the specified ID field
 */
function enrichResponseWithId(
  response: unknown,
  idFieldName: string,
  idValue: unknown,
): unknown[] {
  if (!Array.isArray(response)) {
    return [];
  }

  return response.map((element) => {
    if (typeof element === 'object' && element !== null && !Array.isArray(element)) {
      return { [idFieldName]: idValue as any, ...(element as any) };
    }
    return { [idFieldName]: idValue as any, value: element as any };
  });
}

async function getApiRootFromCredentials(ctx: IExecuteFunctions): Promise<string> {
  const creds = (await ctx.getCredentials('defensxApi')) as { apiRoot?: string };
  const apiRoot = (creds?.apiRoot ?? '').trim();
  if (!apiRoot) {
    throw new NodeOperationError(ctx.getNode(), 'Missing API Root in credentials.');
  }
  return apiRoot;
}

async function getApiRootFromCredentialsAny(ctx: IExecuteFunctions | ILoadOptionsFunctions): Promise<string> {
  const creds = (await ctx.getCredentials('defensxApi')) as { apiRoot?: string };
  const apiRoot = (creds?.apiRoot ?? '').trim();
  if (!apiRoot) {
    throw new NodeOperationError(ctx.getNode(), 'Missing API Root in credentials.');
  }
  return apiRoot;
}

async function requestWithDefensXAuthAny(
  ctx: IExecuteFunctions | ILoadOptionsFunctions,
  requestOptions: Record<string, unknown>,
): Promise<unknown> {
  const helpersAny = (ctx as any).helpers as any;
  const requestWithAuth = helpersAny.httpRequestWithAuthentication ?? helpersAny.requestWithAuthentication;

  if (typeof requestWithAuth !== 'function') {
    throw new NodeOperationError(
      (ctx as any).getNode(),
      'No supported authenticated request helper found (expected httpRequestWithAuthentication or requestWithAuthentication).',
    );
  }

  return requestWithAuth.call(ctx, 'defensxApi', requestOptions);
}

async function getCustomerOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const apiRoot = await getApiRootFromCredentialsAny(this);

  const operationId = this.getCurrentNodeParameter('operation') as string | undefined;
  const operation = operationId ? getOperationById(operationId) : undefined;
  const customerParam = operation?.parameters.find((p) => {
    const normalized = String(p.name ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    return normalized === 'customerid';
  });
  const customerRequired = customerParam?.required === true;

  const url = buildRequestUrl(apiRoot, '/customers');
  const requestOptions: Record<string, unknown> = {
    method: 'GET',
    url,
    json: true,
  };

  const response = await requestWithDefensXAuthAny(this, requestOptions);
  const customers = Array.isArray(response) ? response : [];

  const options = customers
    .filter((c) => typeof c === 'object' && c !== null)
    .map((c: any) => ({
      name: String(c.name ?? c.id ?? ''),
      value: String(c.id ?? ''),
    }))
    .filter((o) => o.name && o.value);

  options.sort((a, b) => a.name.localeCompare(b.name));

  const emptyOptionLabel = customerRequired ? 'Select a customer' : 'All customers';
  return [{ name: emptyOptionLabel, value: '' }, ...options];
}

async function getBrowserExtensionOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const apiRoot = await getApiRootFromCredentialsAny(this);
  const operationId = this.getCurrentNodeParameter('operation') as string | undefined;
  if (!operationId) return [];

  const customerParamName = getParamName('path', operationId, 'customerId');
  const customerId = this.getCurrentNodeParameter(customerParamName) as string | undefined;
  if (!customerId) return [];

  const url = buildRequestUrl(apiRoot, `/customers/${customerId}/browser_extensions`);
  const requestOptions: Record<string, unknown> = {
    method: 'GET',
    url,
    json: true,
  };

  const response = await requestWithDefensXAuthAny(this, requestOptions);
  const extensions = Array.isArray(response) ? response : [];

  const options = extensions
    .filter((e) => typeof e === 'object' && e !== null)
    .map((e: any) => {
      const idValue = e.id;
      const parsedId = typeof idValue === 'number' ? idValue : Number(String(idValue));
      return {
        name: String(e.name ?? e.id ?? ''),
        value: Number.isFinite(parsedId) ? parsedId : String(e.id ?? ''),
      };
    })
    .filter((o) => o.name && `${o.value}`);

  options.sort((a, b) => a.name.localeCompare(b.name));
  return options;
}

async function getPolicyGroupOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const apiRoot = await getApiRootFromCredentialsAny(this);
  const operationId = this.getCurrentNodeParameter('operation') as string | undefined;
  if (!operationId) return [];

  const customerParamName = getParamName('path', operationId, 'customerId');
  const customerId = this.getCurrentNodeParameter(customerParamName) as string | undefined;
  if (!customerId) return [];

  const url = buildRequestUrl(apiRoot, `/customers/${customerId}/policies`);
  const requestOptions: Record<string, unknown> = {
    method: 'GET',
    url,
    json: true,
  };

  const response = await requestWithDefensXAuthAny(this, requestOptions);
  const policies = Array.isArray(response) ? response : [];

  const options = policies
    .filter((p) => typeof p === 'object' && p !== null)
    .map((p: any) => {
      const idValue = p.id;
      const parsedId = typeof idValue === 'number' ? idValue : Number(String(idValue));
      const baseName = String(p.name ?? p.id ?? '').trim();
      const configType = String(p.config_type ?? p.configType ?? '').trim();
      const targets = Array.isArray(p.targets)
        ? p.targets.map((t: unknown) => String(t)).filter(Boolean).join(', ')
        : String(p.targets ?? '').trim();

      const parts = [baseName];
      if (configType) parts.push(configType);
      if (targets) parts.push(targets);

      return {
        name: parts.join(' - '),
        value: Number.isFinite(parsedId) ? parsedId : String(p.id ?? ''),
      };
    })
    .filter((o) => o.name && `${o.value}`);

  options.sort((a, b) => a.name.localeCompare(b.name));
  return options;
}

function isBrowserExtensionUsersOperation(operationId: string): boolean {
  return operationId === 'get_customers_by_customerid_browser_extensions_by_browserextensionid_users';
}

function isUsageOperation(operationId: string): boolean {
  return operationId === 'get_usage' || operationId === 'get_usage_current';
}

function isUsersListOperation(operationId: string): boolean {
  return operationId === 'get_customers_by_customerid_users';
}

function isGroupsListOperation(operationId: string): boolean {
  return operationId === 'get_customers_by_customerid_groups';
}

function isLogsOperation(operationId: string): boolean {
  return (
    operationId === 'get_customers_by_customerid_logs_urls' ||
    operationId === 'get_customers_by_customerid_logs_credentials' ||
    operationId === 'get_customers_by_customerid_logs_file_transfers' ||
    operationId === 'get_customers_by_customerid_logs_consents' ||
    operationId === 'get_customers_by_customerid_logs_dns' ||
    operationId === 'get_customers_by_customerid_logs_rbi'
  );
}

function isBrowserExtensionsListOperation(operationId: string): boolean {
  return (
    operationId === 'get_customers_by_customerid_browser_extensions' ||
    operationId === 'get_customers_by_customerid_browser_extensions_low_reputation'
  );
}

function shouldSkipPaginationParam(operationId: string, paramIn: string, paramName: string): boolean {
  if (paramIn !== 'query') {
    return false;
  }

  if (paramName !== 'page' && paramName !== 'limit') {
    return false;
  }

  return (
    isUsersListOperation(operationId) ||
    isGroupsListOperation(operationId) ||
    isLogsOperation(operationId) ||
    isBrowserExtensionUsersOperation(operationId)
  );
}

function extractUsageBySubscriptions(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    const flattened: unknown[] = [];
    for (const element of response) {
      if (typeof element === 'object' && element !== null && Array.isArray((element as any).usageBySubscriptions)) {
        flattened.push(...((element as any).usageBySubscriptions as unknown[]));
        continue;
      }
      flattened.push(element);
    }
    return flattened;
  }

  if (typeof response === 'object' && response !== null && Array.isArray((response as any).usageBySubscriptions)) {
    return (response as any).usageBySubscriptions as unknown[];
  }

  return [];
}

function extractListItems(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  if (typeof response !== 'object' || response === null) return [];

  const obj = response as any;
  const candidates = ['items', 'users', 'results', 'data'];
  for (const key of candidates) {
    if (Array.isArray(obj?.[key])) return obj[key];
  }

  return [];
}

async function requestWithDefensXAuth(
  ctx: IExecuteFunctions,
  requestOptions: Record<string, unknown>,
): Promise<unknown> {
  const helpersAny = ctx.helpers as any;
  const requestWithAuth = helpersAny.httpRequestWithAuthentication ?? helpersAny.requestWithAuthentication;

  if (typeof requestWithAuth !== 'function') {
    throw new NodeOperationError(
      ctx.getNode(),
      'No supported authenticated request helper found (expected httpRequestWithAuthentication or requestWithAuthentication).',
    );
  }

  return requestWithAuth.call(ctx, 'defensxApi', requestOptions);
}

interface PaginationConfig {
  defaultPageSize: number;
  supportRequestedPageAndLimit?: boolean;
}

async function executePaginatedRequest(
  ctx: IExecuteFunctions,
  requestOptions: Record<string, unknown>,
  qs: Record<string, unknown>,
  returnAll: boolean,
  maxResults: number,
  configuredPageSize: number,
  config: PaginationConfig,
): Promise<unknown[]> {
  let initialPage = 1;
  let pageSize = Number.isFinite(configuredPageSize) && configuredPageSize > 0 ? configuredPageSize : config.defaultPageSize;

  if (config.supportRequestedPageAndLimit) {
    const requestedPage = Number.isFinite(Number(qs.page)) && Number(qs.page) > 0 ? Number(qs.page) : 1;
    const requestedLimit = Number.isFinite(Number(qs.limit)) && Number(qs.limit) > 0 ? Number(qs.limit) : 0;
    pageSize = requestedLimit || pageSize;
    initialPage = requestedPage;
  }

  const collected: unknown[] = [];
  let page = initialPage;
  let totalPages = 1;

  while (true) {
    const pagedRequestOptions = {
      ...requestOptions,
      qs: {
        ...qs,
        page,
        limit: pageSize,
      },
    };

    const response = await requestWithDefensXAuth(ctx, pagedRequestOptions);
    const responseObj =
      typeof response === 'object' && response !== null && !Array.isArray(response) ? (response as any) : {};
    const itemsArr = extractListItems(response);

    collected.push(...itemsArr);

    if (maxResults && maxResults > 0 && collected.length >= maxResults) break;
    if (!returnAll) break;

    const currentPage = Number(responseObj?.page) || page;
    const foundTotalPages = Number(responseObj?.totalPages);
    if (Number.isFinite(foundTotalPages) && foundTotalPages > 0) {
      totalPages = foundTotalPages;
    } else if (itemsArr.length < pageSize) {
      totalPages = currentPage;
    }

    if (currentPage >= totalPages) break;
    page = currentPage + 1;
  }

  return maxResults && maxResults > 0 ? collected.slice(0, maxResults) : collected;
}

export class DefensX implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DefensX',
    name: 'defensx',
    icon: 'file:defensx-logo.png',
    group: ['transform'],
    version: 1,
    description: 'Call DefensX Partner API endpoints.',
    defaults: {
      name: 'DefensX',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'defensxApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        default: 'raw',
        options: buildResourceOptions(),
      },
      ...buildOperationOptionProperties(),
      {
        displayName: 'Method',
        name: 'method',
        type: 'options',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'DELETE', value: 'DELETE' },
        ],
        default: 'GET',
        displayOptions: {
          show: {
            resource: ['raw'],
          },
        },
      },
      {
        displayName: 'Endpoint',
        name: 'endpoint',
        type: 'string',
        default: '/status',
        description: 'Path under /api/partner/v1, for example /status',
        displayOptions: {
          show: {
            resource: ['raw'],
          },
        },
      },
      {
        displayName: 'Query Parameters',
        name: 'query',
        type: 'json',
        default: '{}',
        description: 'Query string parameters as JSON object',
        displayOptions: {
          show: {
            resource: ['raw'],
          },
        },
      },
      {
        displayName: 'Body',
        name: 'body',
        type: 'json',
        default: '{}',
        description: 'Request body as JSON object (used for POST/PUT/PATCH)',
        displayOptions: {
          show: {
            resource: ['raw'],
          },
        },
      },
      {
        displayName: 'Output Mode',
        name: 'outputMode',
        type: 'options',
        default: 'items',
        options: [
          {
            name: 'One Item Per Element',
            value: 'items',
            description: 'If the API returns an array, output one n8n item per element',
          },
          {
            name: 'Single Item (Raw)',
            value: 'raw',
            description: 'Return the full response as-is in a single item',
          },
        ],
        displayOptions: {
          hide: {
            resource: ['raw'],
          },
        },
      },
      ...buildOpenApiOperationProperties(),
    ],
  };

  methods = {
    loadOptions: {
      getCustomerOptions,
      getBrowserExtensionOptions,
      getPolicyGroupOptions,
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnItems: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const apiRoot = await getApiRootFromCredentials(this);
      const resource = this.getNodeParameter('resource', itemIndex) as string;

      if (resource === 'raw') {
        const method = this.getNodeParameter('method', itemIndex) as string;
        const endpoint = this.getNodeParameter('endpoint', itemIndex) as string;
        const queryValue = this.getNodeParameter('query', itemIndex) as NodeParameterValue;
        const bodyValue = this.getNodeParameter('body', itemIndex) as NodeParameterValue;

        const url = buildRequestUrl(apiRoot, endpoint);
        const qs = parseJsonParameter(this, queryValue, 'Invalid Query Parameters JSON');
        const jsonBody = parseJsonParameter(this, bodyValue, 'Invalid Body JSON');

        const requestOptions: Record<string, unknown> = {
          method,
          url,
          qs,
          json: true,
        };

        if (method !== 'GET' && method !== 'DELETE') {
          requestOptions.body = jsonBody;
        }

        try {
          const response = await requestWithDefensXAuth(this, requestOptions);
          returnItems.push({ json: response as any });
          continue;
        } catch (error) {
          throw new NodeOperationError(this.getNode(), `DefensX request failed: ${String(error)}`);
        }
      }

      const operationId = this.getNodeParameter('operation', itemIndex) as string;
      if (!operationId) {
        throw new NodeOperationError(this.getNode(), 'Please select an operation.');
      }

      const outputMode = this.getNodeParameter('outputMode', itemIndex) as 'items' | 'raw';
      const operation = getOperationById(operationId);
      if (!operation) {
        throw new NodeOperationError(this.getNode(), `Unknown operation: ${operationId}`);
      }

      let resolvedPath = operation.path;
      const qs: Record<string, unknown> = {};
      let customerIdForOutput: unknown;
      let customUrlGroupIdForOutput: unknown;

      for (const param of operation.parameters) {
        if (shouldSkipPaginationParam(operation.id, param.in, param.name)) {
          continue;
        }

        const paramName = getParamName(param.in === 'path' ? 'path' : 'query', operation.id, param.name);
        const value = this.getNodeParameter(paramName, itemIndex) as any;
        const coerced = coerceValue(this, param.schemaType, value, param.name);
        if (coerced === undefined) continue;

        if (param.in === 'path' && param.name === 'customerId') {
          customerIdForOutput = coerced;
        }

        if (param.in === 'path' && param.name === 'customUrlGroupId') {
          customUrlGroupIdForOutput = coerced;
        }

        if (param.in === 'path') {
          resolvedPath = resolvedPath.replace(`{${param.name}}`, encodeURIComponent(String(coerced)));
        } else {
          qs[param.name] = coerced;
        }
      }

      const url = buildRequestUrl(apiRoot, resolvedPath);

      let requestBody: Record<string, unknown> | undefined;
      if (operation.requestBody) {
        const jsonOverrideName = getParamName('bodyJson', operation.id, 'json');
        const overrideValue = this.getNodeParameter(jsonOverrideName, itemIndex) as NodeParameterValue;
        const overrideObject = parseJsonParameter(this, overrideValue, 'Invalid Body JSON');

        if (Object.keys(overrideObject).length > 0) {
          requestBody = overrideObject;
        } else if (operation.requestBody.schema.isSimpleObject && operation.requestBody.schema.properties) {
          const body: Record<string, unknown> = {};
          for (const [propName, propSchema] of Object.entries(operation.requestBody.schema.properties)) {
            const fieldName = getParamName('body', operation.id, propName);
            const rawValue = this.getNodeParameter(fieldName, itemIndex, '') as unknown;
            const coerced = coerceValue(this, propSchema.type, rawValue, propName);
            if (coerced === undefined) continue;
            body[propName] = coerced;
          }
          requestBody = body;
        }
      }

      const requestOptions: Record<string, unknown> = {
        method: operation.method,
        url,
        qs,
        json: true,
      };

      if (operation.method !== 'GET' && operation.method !== 'DELETE') {
        requestOptions.body = requestBody ?? {};
      }

      try {
        if (isUsageOperation(operation.id)) {
          const returnAllParam = getParamName('pagination', operation.id, 'returnAll');
          const maxResultsParam = getParamName('pagination', operation.id, 'maxResults');
          const pageSizeParam = getParamName('pagination', operation.id, 'pageSize');

          const returnAll = this.getNodeParameter(returnAllParam, itemIndex) as boolean;
          const maxResults = this.getNodeParameter(maxResultsParam, itemIndex) as number;
          const configuredPageSize = this.getNodeParameter(pageSizeParam, itemIndex) as number;

          const requestedPage = Number.isFinite(Number(qs.page)) && Number(qs.page) > 0 ? Number(qs.page) : 1;
          const requestedLimit = Number.isFinite(Number(qs.limit)) && Number(qs.limit) > 0 ? Number(qs.limit) : 0;
          const pageSize = requestedLimit || (Number.isFinite(configuredPageSize) && configuredPageSize > 0 ? configuredPageSize : 1000);

          const collected: unknown[] = [];
          let page = requestedPage;
          let paginationSupported = operation.parameters.some((p) => p.name === 'page' || p.name === 'limit');
          let totalPages = 1;

          while (true) {
            const pagedRequestOptions = {
              ...requestOptions,
              qs: {
                ...qs,
                ...(paginationSupported ? { page, limit: pageSize } : {}),
              },
            };

            const response = await requestWithDefensXAuth(this, pagedRequestOptions);
            const responseObj = response as any;
            const usageItems = extractUsageBySubscriptions(response);
            collected.push(...usageItems);

            if (maxResults && maxResults > 0 && collected.length >= maxResults) break;
            if (!returnAll) break;

            const currentPage = Number(responseObj?.page) || page;
            const foundTotalPages = Number(responseObj?.totalPages);
            if (Number.isFinite(foundTotalPages) && foundTotalPages > 0) {
              totalPages = foundTotalPages;
            }

            if (!paginationSupported && totalPages > 1) {
              paginationSupported = true;
            }

            if (currentPage >= totalPages) break;
            page = currentPage + 1;
          }

          const finalItems = maxResults && maxResults > 0 ? collected.slice(0, maxResults) : collected;
          appendResponseItems(returnItems, finalItems, outputMode);
        } else if (isUsersListOperation(operation.id)) {
          const returnAllParam = getParamName('pagination', operation.id, 'returnAll');
          const maxResultsParam = getParamName('pagination', operation.id, 'maxResults');
          const pageSizeParam = getParamName('pagination', operation.id, 'pageSize');

          const returnAll = this.getNodeParameter(returnAllParam, itemIndex) as boolean;
          const maxResults = this.getNodeParameter(maxResultsParam, itemIndex) as number;
          const configuredPageSize = this.getNodeParameter(pageSizeParam, itemIndex) as number;

          const finalItems = await executePaginatedRequest(
            this,
            requestOptions,
            qs,
            returnAll,
            maxResults,
            configuredPageSize,
            { defaultPageSize: 1000, supportRequestedPageAndLimit: true },
          );

          appendResponseItems(returnItems, finalItems, outputMode);
        } else if (isGroupsListOperation(operation.id)) {
          const returnAllParam = getParamName('pagination', operation.id, 'returnAll');
          const maxResultsParam = getParamName('pagination', operation.id, 'maxResults');
          const pageSizeParam = getParamName('pagination', operation.id, 'pageSize');

          const returnAll = this.getNodeParameter(returnAllParam, itemIndex) as boolean;
          const maxResults = this.getNodeParameter(maxResultsParam, itemIndex) as number;
          const configuredPageSize = this.getNodeParameter(pageSizeParam, itemIndex) as number;

          const finalItems = await executePaginatedRequest(
            this,
            requestOptions,
            qs,
            returnAll,
            maxResults,
            configuredPageSize,
            { defaultPageSize: 100 },
          );

          appendResponseItems(returnItems, finalItems, outputMode);
        } else if (isLogsOperation(operation.id)) {
          const returnAllParam = getParamName('pagination', operation.id, 'returnAll');
          const maxResultsParam = getParamName('pagination', operation.id, 'maxResults');
          const pageSizeParam = getParamName('pagination', operation.id, 'pageSize');

          const returnAll = this.getNodeParameter(returnAllParam, itemIndex) as boolean;
          const maxResults = this.getNodeParameter(maxResultsParam, itemIndex) as number;
          const configuredPageSize = this.getNodeParameter(pageSizeParam, itemIndex) as number;

          const finalItems = await executePaginatedRequest(
            this,
            requestOptions,
            qs,
            returnAll,
            maxResults,
            configuredPageSize,
            { defaultPageSize: 100 },
          );

          appendResponseItems(returnItems, finalItems, outputMode);
        } else if (isBrowserExtensionUsersOperation(operation.id)) {
          const returnAllParam = getParamName('pagination', operation.id, 'returnAll');
          const maxResultsParam = getParamName('pagination', operation.id, 'maxResults');
          const pageSizeParam = getParamName('pagination', operation.id, 'pageSize');

          const returnAll = this.getNodeParameter(returnAllParam, itemIndex) as boolean;
          const maxResults = this.getNodeParameter(maxResultsParam, itemIndex) as number;
          const configuredPageSize = this.getNodeParameter(pageSizeParam, itemIndex) as number;

          const finalItems = await executePaginatedRequest(
            this,
            requestOptions,
            qs,
            returnAll,
            maxResults,
            configuredPageSize,
            { defaultPageSize: 100 },
          );

          appendResponseItems(returnItems, finalItems, outputMode);
        } else {
          const response = await requestWithDefensXAuth(this, requestOptions);

          if (
            isBrowserExtensionsListOperation(operation.id) &&
            customerIdForOutput !== undefined &&
            outputMode === 'items' &&
            Array.isArray(response)
          ) {
            const enriched = enrichResponseWithId(response, 'customerId', customerIdForOutput);
            appendResponseItems(returnItems, enriched, outputMode);
            continue;
          }

          if (
            operation.id === 'get_customers_by_customerid_custom_url_groups_by_customurlgroupid_custom_urls' &&
            customUrlGroupIdForOutput !== undefined &&
            outputMode === 'items' &&
            Array.isArray(response)
          ) {
            const enriched = enrichResponseWithId(response, 'customUrlGroupId', customUrlGroupIdForOutput);
            appendResponseItems(returnItems, enriched, outputMode);
          } else {
            appendResponseItems(returnItems, response, outputMode);
          }
        }
      } catch (error) {
        throw new NodeOperationError(this.getNode(), `DefensX request failed: ${String(error)}`);
      }
    }

    return [returnItems];
  }
}
