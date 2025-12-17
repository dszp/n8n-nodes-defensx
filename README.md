# n8n-nodes-defensx

The Partner API provides access to DefensX functions for Partners and MSPs.

To use this API, you must first obtain an API key from the API Keys page in the DefensX portal.

After generating the API token, include it in your requests as an Authorization: Bearer header.

For further details directly from DefenseX, refer to the [DefensX Partner API documentation](https://kb.defensx.com/docs/categories/72-Partner-API/topics/91d5908c-ee58-4e51-8397-ba6823407ff8).

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

You can install this node as a community node on your self-hosted [n8n](https://n8n.io) instance from the UI (if community nodes are enabled) since it's [published to npm](https://www.npmjs.com/package/n8n-nodes-defensx) as `n8n-nodes-defensx`.

## Usage

This node provides integration with DefensX API v1.3.0 following their provided OpenAPI 3.0.1 specification as retrieved on Dec. 15, 2025.

Note: Initial testing was performed more heavily on read operations. Please test carefully any write operations before using in production and open GitHub issues if you discover issues.

### Credentials

Create a new credential of type "DefensX API" and configure:

- **API Key**: Your Partner API key from DefensX.
- **API Root**: The base URL of your DefensX API environment.

The node will automatically call the Partner API under the path `api/partner/v1`.

### Resources and operations

The node exposes the DefensX Partner API as:

- **Resource**: A top-level grouping (based on OpenAPI tags).
- **Operation**: A specific endpoint (method + path) within that resource.

Parameters are generated from the OpenAPI definition and shown as fields in the node.

### Output mode

For OpenAPI-driven operations, the node supports:

- **One Item Per Element**: If the API returns an array, output one n8n item per array element.
- **Single Item (Raw)**: Return the full API response in a single item.

If the API response is an array (or a primitive), Raw output is wrapped under `{ "items": ... }`.

### Raw Request

If you need to call an endpoint that is not yet modeled (or you need full control over the request), use:

- **Resource**: `Raw Request`
- **Operation**: `Custom API Query`

Then provide the HTTP method, endpoint, query, and body.

### Dynamic dropdowns

Some fields load values dynamically:

- **Customer ID**: Loaded from `GET /customers`.
- **Browser Extension ID**: Loaded from `GET /customers/{customerId}/browser_extensions` and depends on the selected Customer ID.

### Pagination handling

Some operations automatically paginate and return the combined list of results by default.
Where supported, pagination settings can be used to:

- Fetch all pages automatically.
- Optionally cap the total number of returned items.

## Development

```bash
npm install
npm run build
npm link
```

## License

MIT

## Attribution

All trademarks and logos are the properties of their respective companies and are not owned by the author of this integration.
