import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { generatedOperations } from '../../generated/openapi.generated';
import { operationOverrides } from '../../overrides/openapiOverrides';

function normalizeResourceName(resource: string): string {
  return resource
    .trim()
    .replace(/\bUrl\b/g, 'URL')
    .replace(/\bUrls\b/g, 'URLs');
}

export async function getResourceOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const resourceNames = new Set<string>();

  for (const op of generatedOperations) {
    const override = operationOverrides[op.id];
    if (override?.hidden) continue;

    const resource = normalizeResourceName(override?.resourceName ?? op.tag ?? 'Default');
    resourceNames.add(resource);
  }

  const resources = Array.from(resourceNames).sort((a, b) => a.localeCompare(b));

  const options: INodePropertyOptions[] = [
    { name: 'Raw Request', value: 'raw' },
    ...resources.map((r) => ({ name: r, value: r })),
  ];

  return options;
}

export async function getOperationOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const resource = this.getCurrentNodeParameter('resource') as string | undefined;
  if (!resource || resource === 'raw') return [];

  const options: INodePropertyOptions[] = [];

  for (const op of generatedOperations) {
    const override = operationOverrides[op.id];
    if (override?.hidden) continue;

    const opResource = normalizeResourceName(override?.resourceName ?? op.tag ?? 'Default');
    if (opResource !== resource) continue;

    const displayName =
      override?.operationName ??
      op.summary ??
      `${op.method.toUpperCase()} ${op.path}`;

    options.push({
      name: displayName,
      value: op.id,
      description: op.description,
    });
  }

  options.sort((a, b) => String(a.name).localeCompare(String(b.name)));

  return options;
}
