const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function withDateFormatSuffix(description) {
  const suffix = ' (in format YYYY-MM-DD, with optional HH:MM:SS and no timezone)';
  const normalized = (description ?? '').trim();

  if (!normalized) return `Date${suffix}`;
  if (normalized.endsWith(suffix)) return normalized;
  if (normalized.includes(suffix.trim())) return normalized;

  return `${normalized}${suffix}`;
}

function isDateSchema(schema) {
  if (!schema || !isObject(schema)) return false;
  if (typeof schema.format === 'string' && schema.format.toLowerCase() === 'date') return true;

  const pattern = typeof schema.pattern === 'string' ? schema.pattern : '';
  if (pattern.includes('\\d{4}-\\d{2}-\\d{2}')) return true;
  if (pattern.includes('^\\d{4}-\\d{2}-\\d{2}$')) return true;

  return false;
}

function toStableId(method, openApiPath) {
  return `${method.toUpperCase()}_${openApiPath}`
    .replace(/\{([^}]+)\}/g, 'by_$1')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function resolveRef(doc, ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return undefined;
  const parts = ref.slice(2).split('/');
  let current = doc;
  for (const part of parts) {
    if (!isObject(current) || !(part in current)) return undefined;
    current = current[part];
  }
  return current;
}

function resolveParameter(doc, paramOrRef) {
  const resolved = paramOrRef && paramOrRef.$ref ? resolveRef(doc, paramOrRef.$ref) : paramOrRef;
  if (!resolved || typeof resolved !== 'object') return undefined;
  return resolved;
}

function resolveSchema(doc, schemaOrRef) {
  const resolved = schemaOrRef && schemaOrRef.$ref ? resolveRef(doc, schemaOrRef.$ref) : schemaOrRef;
  if (!resolved || typeof resolved !== 'object') return undefined;
  return resolved;
}

function extractSchemaShape(doc, schemaOrRef) {
  const schema = resolveSchema(doc, schemaOrRef);
  if (!schema || !isObject(schema)) return { type: 'unknown', isSimpleObject: false };

  const type = typeof schema.type === 'string' ? schema.type : 'unknown';

  if (type !== 'object' || !isObject(schema.properties)) {
    return { type, isSimpleObject: false };
  }

  const required = Array.isArray(schema.required) ? schema.required.filter((x) => typeof x === 'string') : [];
  const properties = {};
  let isSimpleObject = true;

  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    const resolvedProp = resolveSchema(doc, propSchema);
    const propType = resolvedProp && typeof resolvedProp.type === 'string' ? resolvedProp.type : 'unknown';

    const rawDescription = typeof resolvedProp?.description === 'string' ? resolvedProp.description : undefined;
    const description = isDateSchema(resolvedProp) ? withDateFormatSuffix(rawDescription) : rawDescription;

    properties[propName] = {
      type: propType,
      description,
    };

    if (!['string', 'number', 'integer', 'boolean'].includes(propType)) {
      isSimpleObject = false;
    }
  }

  return {
    type: 'object',
    required,
    properties,
    isSimpleObject,
  };
}

function extractParameters(doc, pathItem, operation) {
  const combined = [];
  const pathParams = Array.isArray(pathItem.parameters) ? pathItem.parameters : [];
  const opParams = Array.isArray(operation.parameters) ? operation.parameters : [];

  for (const paramOrRef of [...pathParams, ...opParams]) {
    const param = resolveParameter(doc, paramOrRef);
    if (!param) continue;

    const schema = resolveSchema(doc, param.schema);
    const schemaType = schema && typeof schema.type === 'string' ? schema.type : 'string';

    const rawDescription = typeof param.description === 'string' ? param.description : undefined;
    const description = isDateSchema(schema) ? withDateFormatSuffix(rawDescription) : rawDescription;

    combined.push({
      name: param.name,
      in: param.in,
      required: Boolean(param.required),
      description,
      schemaType,
    });
  }

  return combined.filter((p) => p.in === 'path' || p.in === 'query');
}

function extractRequestBody(doc, operation) {
  const requestBody = operation.requestBody && operation.requestBody.$ref
    ? resolveRef(doc, operation.requestBody.$ref)
    : operation.requestBody;

  if (!requestBody || !isObject(requestBody) || !isObject(requestBody.content)) return undefined;

  const content = requestBody.content;
  const jsonContent = content['application/json'] || content['application/*+json'];
  if (!jsonContent || !isObject(jsonContent)) return { contentType: 'application/json', schema: { type: 'unknown', isSimpleObject: false } };

  return {
    contentType: 'application/json',
    schema: extractSchemaShape(doc, jsonContent.schema),
  };
}

function main() {
  const packageRoot = path.resolve(__dirname, '..');
  const specPathInPackage = path.resolve(packageRoot, 'tools', 'openapi', 'defensx-partner.yaml');
  const specPathLegacy = path.resolve(__dirname, '..', '..', 'defensx-partner.yaml');
  const specPath = fs.existsSync(specPathInPackage) ? specPathInPackage : specPathLegacy;
  const outDir = path.join(packageRoot, 'src', 'generated');
  const outFile = path.join(outDir, 'openapi.generated.ts');

  if (!fs.existsSync(specPath)) {
    throw new Error(
      `OpenAPI spec not found. Expected one of:\n` +
        `- ${specPathInPackage}\n` +
        `- ${specPathLegacy}`,
    );
  }

  const raw = fs.readFileSync(specPath, 'utf8');
  const doc = YAML.parse(raw);

  if (!doc || !isObject(doc) || !isObject(doc.paths)) {
    throw new Error('OpenAPI spec is missing required "paths" object');
  }

  const operations = [];
  const usedIds = new Set();

  for (const [openApiPath, pathItemAny] of Object.entries(doc.paths)) {
    const pathItem = pathItemAny;
    if (!isObject(pathItem)) continue;

    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
      const operation = pathItem[method];
      if (!isObject(operation)) continue;

      const tags = Array.isArray(operation.tags) ? operation.tags.filter((t) => typeof t === 'string') : [];
      const tag = tags.length > 0 ? tags[0] : 'Default';

      const id = typeof operation.operationId === 'string' && operation.operationId.trim()
        ? operation.operationId.trim()
        : toStableId(method, openApiPath);

      let uniqueId = id;
      if (usedIds.has(uniqueId)) {
        let counter = 2;
        while (usedIds.has(`${uniqueId}_${counter}`)) counter++;
        uniqueId = `${uniqueId}_${counter}`;
      }
      usedIds.add(uniqueId);

      operations.push({
        id: uniqueId,
        tag,
        method: method.toUpperCase(),
        path: openApiPath,
        summary: typeof operation.summary === 'string' ? operation.summary : undefined,
        description: typeof operation.description === 'string' ? operation.description : undefined,
        parameters: extractParameters(doc, pathItem, operation),
        requestBody: extractRequestBody(doc, operation),
      });
    }
  }

  fs.mkdirSync(outDir, { recursive: true });

  const ts = `export type SchemaProperty = {\n  type: string;\n  description?: string;\n};\n\nexport type SchemaShape = {\n  type: string;\n  isSimpleObject: boolean;\n  required?: string[];\n  properties?: Record<string, SchemaProperty>;\n};\n\nexport type GeneratedParameter = {\n  name: string;\n  in: 'path' | 'query';\n  required: boolean;\n  description?: string;\n  schemaType: string;\n};\n\nexport type GeneratedRequestBody = {\n  contentType: string;\n  schema: SchemaShape;\n};\n\nexport type GeneratedOperation = {\n  id: string;\n  tag: string;\n  method: string;\n  path: string;\n  summary?: string;\n  description?: string;\n  parameters: GeneratedParameter[];\n  requestBody?: GeneratedRequestBody;\n};\n\nexport const generatedOperations: GeneratedOperation[] = ${JSON.stringify(operations, null, 2)};\n`;

  fs.writeFileSync(outFile, ts, 'utf8');
}

main();
