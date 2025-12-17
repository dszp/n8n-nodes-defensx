import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

import { generatedOperations, type GeneratedOperation } from '../../generated/openapi.generated';
import { operationOverrides } from '../../overrides/openapiOverrides';

function sanitizeKey(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, '_');
}

function normalizeLabel(value: string): string {
  return value
    .replace(/\bOf\b/g, 'of')
    .replace(/\burls\b/gi, 'URLs')
    .replace(/\burl\b/gi, 'URL');
}

function isDateLikeField(name: string): boolean {
  if (/date/i.test(name)) return true;
  const lowered = name.trim().toLowerCase();
  return lowered === 'from' || lowered === 'to';
}

function toTitleCaseWord(word: string): string {
  const lowered = word.toLowerCase();
  if (lowered === 'id') return 'ID';
  if (lowered === 'url') return 'URL';
  if (lowered === 'urls') return 'URLs';
  if (lowered === 'of') return 'of';
  return lowered ? `${lowered[0].toUpperCase()}${lowered.slice(1)}` : lowered;
}

function humanizeFieldName(name: string): string {
  const withSpaces = name
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();

  if (!withSpaces) return name;

  return normalizeLabel(
    withSpaces
      .split(/\s+/)
      .map(toTitleCaseWord)
      .join(' '),
  );
}

function formatParameterDisplayName(name: string): string {
  if (name === 'customerId') return 'Customer ID';
  if (name.includes('_') || /[A-Z]/.test(name) || isDateLikeField(name)) return humanizeFieldName(name);
  return name;
}

function normalizeResourceName(resource: string): string {
  return normalizeLabel(resource.trim());
}

export function buildResourceOptions(): INodePropertyOptions[] {
  const resourceNames = new Set<string>();

  for (const op of generatedOperations) {
    const override = operationOverrides[op.id];
    if (override?.hidden) continue;

    resourceNames.add(getResourceValue(op));
  }

  const resources = Array.from(resourceNames).sort((a, b) => a.localeCompare(b));

  return [{ name: 'Raw Request', value: 'raw' }, ...resources.map((r) => ({ name: r, value: r }))];
}

function stripRedundantResourcePrefix(resource: string, operationName: string): string {
  const trimmedName = normalizeLabel(operationName.trim());
  if (!trimmedName) return trimmedName;

  const normalizedResource = resource.trim().toLowerCase();
  const lowered = trimmedName.toLowerCase();

  const candidates = [`${normalizedResource} `, `${normalizedResource}: `, `${normalizedResource} - `];
  for (const prefix of candidates) {
    if (lowered.startsWith(prefix)) {
      const stripped = trimmedName.slice(prefix.length).trim();
      return stripped || trimmedName;
    }
  }

  return trimmedName;
}

function buildOperationOptionsForResource(resource: string): INodePropertyOptions[] {
  const options: INodePropertyOptions[] = [];

  for (const op of generatedOperations) {
    const override = operationOverrides[op.id];
    if (override?.hidden) continue;

    if (getResourceValue(op) !== resource) continue;

    const displayName =
      override?.operationName ??
      op.summary ??
      `${op.method.toUpperCase()} ${op.path}`;

    const label = stripRedundantResourcePrefix(resource, normalizeLabel(displayName));

    options.push({
      name: label,
      value: op.id,
      action: label,
      description: op.description,
    });
  }

  options.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return options;
}

export function buildOperationOptionProperties(): INodeProperties[] {
  const resources = buildResourceOptions()
    .map((r) => String(r.value))
    .filter((v) => v !== 'raw');

  const rawOperationProperty: INodeProperties = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    default: '__customApiQuery',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['raw'],
      },
    },
    options: [
      {
        name: 'Custom API Query',
        value: '__customApiQuery',
        action: 'Custom API Query',
        description: 'Make a custom request by providing method, endpoint, query, and body.',
      },
    ],
  };

  const operationProperties = resources.map(
    (resource): INodeProperties => ({
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      default: '',
      placeholder: 'Select operation',
      required: true,
      noDataExpression: true,
      displayOptions: {
        show: {
          resource: [resource],
        },
      },
      options: buildOperationOptionsForResource(resource),
    }),
  );

  return [rawOperationProperty, ...operationProperties];
}

function getResourceValue(operation: GeneratedOperation): string {
  const override = operationOverrides[operation.id];
  return normalizeResourceName(override?.resourceName ?? operation.tag ?? 'Default');
}

function getDisplayOptionsForOperation(operation: GeneratedOperation) {
  return {
    show: {
      resource: [getResourceValue(operation)],
      operation: [operation.id],
    },
  };
}

function toParamName(prefix: string, operationId: string, name: string): string {
  return `${prefix}_${sanitizeKey(operationId)}_${sanitizeKey(name)}`;
}

export function getOperationById(operationId: string): GeneratedOperation | undefined {
  return generatedOperations.find((op) => op.id === operationId);
}

function mapSchemaTypeToFieldType(_schemaType: string): 'string' {
  return 'string';
}

function isCustomerIdField(paramName: string): boolean {
  const normalized = paramName.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return normalized === 'customerid';
}

function isBrowserExtensionIdField(paramName: string): boolean {
  const normalized = paramName.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return normalized === 'browserextensionid';
}

function getCustomerParamNameForOperation(op: GeneratedOperation): string {
  const customerParam = op.parameters.find((p) => isCustomerIdField(p.name));
  const prefix = customerParam?.in === 'path' ? 'path' : 'query';
  return getParamName(prefix, op.id, customerParam?.name ?? 'customerId');
}

export function buildOpenApiOperationProperties(): INodeProperties[] {
  const properties: INodeProperties[] = [];

  for (const op of generatedOperations) {
    const override = operationOverrides[op.id];
    if (override?.hidden) continue;

    const displayOptions = getDisplayOptionsForOperation(op);

    for (const param of op.parameters) {
      const isCustomerId = isCustomerIdField(param.name);
      const isBrowserExtensionId = isBrowserExtensionIdField(param.name);
      const customerParamName = getCustomerParamNameForOperation(op);

      const fieldType = isCustomerId || isBrowserExtensionId
        ? 'options'
        : isDateLikeField(param.name)
          ? 'dateTime'
          : mapSchemaTypeToFieldType(param.schemaType);
      const name = toParamName(param.in === 'path' ? 'path' : 'query', op.id, param.name);

      properties.push({
        displayName: formatParameterDisplayName(param.name),
        name,
        type: fieldType,
        default: '',
        ...(isCustomerId && !param.required
          ? {
              placeholder: 'All customers (optional)',
            }
          : {}),
        required: param.required,
        description: param.description,
        displayOptions,
        ...(isCustomerId
          ? {
              typeOptions: {
                loadOptionsMethod: 'getCustomerOptions',
              },
            }
          : {}),
        ...(isBrowserExtensionId
          ? {
              typeOptions: {
                loadOptionsMethod: 'getBrowserExtensionOptions',
                loadOptionsDependsOn: [customerParamName],
              },
            }
          : {}),
      });
    }

    if (op.id === 'get_customers_by_customerid_browser_extensions_by_browserextensionid_users') {
      properties.push({
        displayName: 'Return All',
        name: toParamName('pagination', op.id, 'returnAll'),
        type: 'boolean',
        default: true,
        description: 'Whether to fetch all pages automatically.',
        displayOptions,
      });

      properties.push({
        displayName: 'Max Results',
        name: toParamName('pagination', op.id, 'maxResults'),
        type: 'number',
        default: 0,
        description: 'Optional maximum number of items to return (0 = no limit).',
        displayOptions,
      });
    }

    if (op.id === 'get_usage' || op.id === 'get_usage_current') {
      properties.push({
        displayName: 'Return All',
        name: toParamName('pagination', op.id, 'returnAll'),
        type: 'boolean',
        default: true,
        description: 'Whether to fetch all pages automatically.',
        displayOptions,
      });

      properties.push({
        displayName: 'Max Results',
        name: toParamName('pagination', op.id, 'maxResults'),
        type: 'number',
        default: 0,
        description: 'Optional maximum number of items to return (0 = no limit).',
        displayOptions,
      });

      properties.push({
        displayName: 'Page Size',
        name: toParamName('pagination', op.id, 'pageSize'),
        type: 'number',
        default: 1000,
        description: 'Number of records to return per page.',
        displayOptions,
      });
    }

    if (op.requestBody) {
      const schema = op.requestBody.schema;

      if (schema.isSimpleObject && schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          const name = toParamName('body', op.id, propName);
          const required = Array.isArray(schema.required) ? schema.required.includes(propName) : false;

          properties.push({
            displayName: formatParameterDisplayName(propName),
            name,
            type: isDateLikeField(propName) ? 'dateTime' : mapSchemaTypeToFieldType(propSchema.type),
            default: '',
            required,
            description: propSchema.description,
            displayOptions,
          });
        }

        properties.push({
          displayName: 'Body (JSON Override)',
          name: toParamName('bodyJson', op.id, 'json'),
          type: 'json',
          default: '{}',
          description: 'Optional JSON body override. If not empty, this JSON is sent instead of the structured body fields.',
          displayOptions,
        });
      } else {
        properties.push({
          displayName: 'Body',
          name: toParamName('bodyJson', op.id, 'json'),
          type: 'json',
          default: '{}',
          description: 'Request body as JSON.',
          displayOptions,
        });
      }
    }
  }

  return properties;
}

export function getParamName(prefix: string, operationId: string, name: string): string {
  return toParamName(prefix, operationId, name);
}

export function getResourceForOperation(operation: GeneratedOperation): string {
  return getResourceValue(operation);
}
