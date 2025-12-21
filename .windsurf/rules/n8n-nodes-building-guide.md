---
trigger: always_on
---

# n8n-nodes building guide

## Guiding Principles for n8n Community Node Development
- **Adhere to n8n's documented node development best practices:** Adhere to n8n's best practices, including proper typing, code organization, and documentation, first as defined in this file but referring to external links when not included here but referenced, or when these directions are unclear or incomplete.
- When necessary, reference the node development documentation below but also additional details and pages that are built from the GitHub repository folder at https://github.com/n8n-io/n8n-docs/tree/main/docs/integrations/creating-nodes/build and more specifically, the reference details for node-building at https://github.com/n8n-io/n8n-docs/tree/main/docs/integrations/creating-nodes/build/reference and less specifically, there are also deploy, plan, and test folders of documentation at https://github.com/n8n-io/n8n-docs/tree/main/docs/integrations/creating-nodes
- **Follow Community Node Verification Guidelines:** Wherever possible, follow the deveopment guidelines for n8n community nodes that allows for verification and inclusion in the Cloud version of n8n. These guidelines are available at https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/ and in Markdown at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/verification-guidelines.md and are replicated under the 2nd-level heading "Verification Guidelines" below.

### When creating an n8n community node here's how to choose the right node type

Most of the nodes being built here will be programmatic nodes, but make suggestions about when declarative nodes might be more appropriate when creating a new node. Take automatic conversion of OpenAPI specs into account as well as being able to customize the UI of the node with overrides on top of the generated code from the OpenAPI spec.

The node selction guidelines are defined at https://docs.n8n.io/integrations/creating-nodes/plan/choose-node-method/ (raw Markdown located at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/plan/choose-node-method.md) part of which is copied below:

#### Choose your node building approach

n8n has two node-building styles, declarative and programmatic.

You should use the declarative style for most nodes. This style:

- Uses a JSON-based syntax, making it simpler to write, with less risk of introducing bugs.
- Is more future-proof.
- Supports integration with REST APIs.

The programmatic style is more verbose. You must use the programmatic style for:

- Trigger nodes
- Any node that isn't REST-based. This includes nodes that need to call a GraphQL API and nodes that use external dependencies.
- Any node that needs to transform incoming data.
- Full versioning. Refer to Node versioning for more information on types of versioning.

#### Data handling differences

The main difference between the declarative and programmatic styles is how they handle incoming data and build API requests. The programmatic style requires an execute() method, which reads incoming data and parameters, then builds a request. The declarative style handles this using the routing key in the operations object. Refer to Node base file for more information on node parameters and the execute() method.

The URL above includes some syntax examples as well that aren't copied here.

## Node UI Design
Taken from: https://docs.n8n.io/integrations/creating-nodes/plan/node-ui-design/
There are detailed code examples for Node user interface elements located at https://docs.n8n.io/integrations/creating-nodes/build/reference/ui-elements/ that are not copied below but can be referenced to clarify specific types and formatting as needed.

### Design your node's user interface

Most nodes are a GUI (graphical user interface) representation of an API. Designing the interface means finding a user-friendly way to represent API endpoints and parameters. Directly translating an entire API into form fields in a node may not result in a good user experience.

This document provides design guidance and standards to follow. These guidelines are the same as those used by n8n. This helps provide a smooth and consistent user experience for users mixing community and built-in nodes.

### Design guidance

All nodes use n8n's node UI elements, so you don't need to consider style details such as colors, borders, and so on. However, it's still useful to go through a basic design process:

- Review the documentation for the API you're integrating. Ask yourself:
  - What can you leave out?
  - What can you simplify?
  - Which parts of the API are confusing? How can you help users understand them?
- Use a wireframe tool to try out your field layout. If you find your node has a lot of fields and is getting confusing, consider n8n's guidance on showing and hiding fields.

### Standards

#### UI text style

| Element        | Style                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drop-down value | Title case                                                                                                                                                     |
| Hint          | Sentence case                                                                                                                                                   |
| Info box      | Sentence case. Don't use a period (.) for one-sentence information. Always use a period if there's more than one sentence. This field can include links, which should open in a new tab. |
| Node name     | Title case                                                                                                                                                     |
| Parameter name | Title case                                                                                                                                                     |
| Subtitle      | Title case                                                                                                                                                     |
| Tooltip       | Sentence case. Don't use a period (.) for one-sentence tooltips. Always use a period if there's more than one sentence. This field can include links, which should open in a new tab. |

#### UI text terminology

- Use the same terminology as the service the node connects to. For example, a Notion node should refer to Notion blocks, not Notion paragraphs, because Notion calls these elements blocks. There are exceptions to this rule, usually to avoid technical terms (for example, refer to the guidance on name and description for upsert operations).
- Sometimes a service has different terms for something in its API and in its GUI. Use the GUI language in your node, as this is what most users are familiar with. If you think some users may need to refer to the service's API docs, consider including this information in a hint.
- Don't use technical jargon when there are simpler alternatives.
- Be consistent when naming things. For example, choose one of directory or folder then stick to it.

### Node naming conventions

| Convention                                                                 | Correct        | Incorrect                        |
| -------------------------------------------------------------------------- | -------------- | -------------------------------- |
| If a node is a trigger node, the displayed name should have `Trigger` at the end, with a space before. | Shopify Trigger | ShopifyTrigger, Shopify trigger |
| Don't include `node` in the name.                                         | Asana          | Asana Node, Asana node          |

### Showing and hiding fields

Fields can either be:

- Displayed when the node opens: use this for resources and operations, and required fields.
- Hidden in the **Optional fields** section until a user clicks on that section: use this for optional fields.

Progressively disclose complexity: hide a field until any earlier fields it depends on have values. For example, if you have a **Filter by date** toggle, and a **Date to filter by** datepicker, don't display **Date to filter by** until the user enables **Filter by date**.

### Conventions by field type

#### Credentials

n8n automatically displays credential fields as the top fields in the node.

#### Resources and operations

APIs usually involve doing something to data. For example, "get all tasks." In this example, "task" is the resource, and "get all" is the operation.

When your node has this resource and operation pattern, your first field should be **Resource**, and your second field should be **Operation**.

#### Required fields

Order fields by:

- Most important to least important.
- Scope: from broad to narrow. For example, if you have fields for **Document**, **Page**, and **Text to insert**, put them in that order.

#### Optional fields

- Order fields alphabetically. To group similar things together, you can rename them. For example, rename **Email** and **Secondary Email** to **Email (primary)** and **Email (secondary)**.
- If an optional field has a default value that the node uses when the value isn't set, load the field with that value. Explain this in the field description. For example, `Defaults to false.`  
- Connected fields: if one optional field is dependent on another, bundle them together. They should both be under a single option that shows both fields when selected.
- If you have a lot of optional fields, consider grouping them by theme.

#### Help

There are five types of help built in to the GUI:

- **Info boxes**: yellow boxes that appear between fields. Refer to *UI elements \| Notice* for more information.  
  Use info boxes for essential information. Don't over-use them. By making them rare, they stand out more and grab the user's attention.
- **Parameter hints**: lines of text displayed beneath a user input field. Use this when there's something the user needs to know, but an info box would be excessive.
- **Node hints**: provide help in the input panel, output panel, or node details view. Refer to *UI elements \| Hints* for more information.
- **Tooltips**: callouts that appear when the user hovers over the tooltip icon ("Screenshot of the tooltip icon. The icon is a ? in a grey circle"). Use tooltips for extra information that the user might need.
  - You don't have to provide a tooltip for every field. Only add one if it contains useful information.
  - When writing tooltips, think about what the user needs. Don't just copy-paste API parameter descriptions. If the description doesn't make sense, or has errors, improve it.
- **Placeholder text**: n8n can display placeholder text in a field where the user hasn't entered a value. This can help the user know what's expected in that field.

Info boxes, hints, and tooltips can contain links to more information.

#### Errors

- Make it clear which fields are required.
- Add validation rules to fields if possible. For example, check for valid email patterns if the field expects an email.
- When displaying errors, make sure only the main error message displays in the red error title. More information should go in **Details**.

Refer to *Node Error Handling* for more information.

#### Toggles

- Tooltips for binary states should start with something like `Whether to ...`.
- You may need a list rather than a toggle:
  - Use toggles when it's clear what happens in a false state. For example, **Simplify Output?** The alternative (don't simplify output) is clear.
  - Use a dropdown list with named options when you need more clarity. For example, **Append?** What happens if you don't append is unclear (it could be that nothing happens, or information is overwritten, or discarded).

#### Lists

- Set default values for lists whenever possible. The default should be the most-used option.
- Sort list options alphabetically.
- You can include list option descriptions. Only add descriptions if they provide useful information.
- If there is an option like **All**, use the word **All**, not shorthand like `*`.

#### Trigger node inputs

When a trigger node has a parameter for specifying which events to trigger on:

- Name the parameter **Trigger on**.
- Don't include a tooltip.

#### Subtitles

Set subtitles based on the values of the main parameters. For example:

```ts
subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
```

#### IDs

When performing an operation on a specific record, such as "update a task comment", you need a way to specify which record you want to change.

- Wherever possible, provide two ways to specify a record:
  - By choosing from a pre-populated list. You can generate this list using the `loadOptions` parameter. Refer to *Base files* for more information.
  - By entering an ID.
- Name the field `<Record name> Name or ID`. For example, **Workspace Name or ID**.  
  - Add a tooltip saying: `Choose a name from the list, or specify an ID using an expression.`  
  - Link to n8n's Expressions documentation.
- Build your node so that it can handle users providing more information than required. For example:
  - If you need a relative path, handle the user pasting in the absolute path.
  - If the user needs to get an ID from a URL, handle the user pasting in the entire URL.

#### Dates and timestamps

n8n uses ISO timestamp strings for dates and times. Make sure that any date or timestamp field you add supports all ISO 8601 formats.

#### JSON

You should support two ways of specifying the content of a text input that expects JSON:

- Typing JSON directly into the text input: you need to parse the resulting string into a JSON object.
- Using an expression that returns JSON.

#### Node icons

#### Common patterns and exceptions

This section provides guidance on handling common design patterns, including some edge cases and exceptions to the main standards.

#### Simplify responses

APIs can return a lot of data that is not useful. Consider adding a toggle that allows users to choose to simplify the response data:

- **Name:** Simplify Response  
- **Description:** Whether to return a simplified version of the response instead of the raw data

#### Upsert operations

This should always be a separate operation with:

- **Name:** Create or Update  
- **Description:** Create a new record, or update the current one if it already exists (upsert)

#### Boolean operators

n8n does not have good support for combining boolean operators, such as AND and OR, in the GUI. Whenever possible, provide options for all ANDs or all ORs.

For example, you have a field called **Must match** to test if values match. Include options to test for **Any** and **All**, as separate options.

#### Source keys or binary properties

Binary data is file data, such as spreadsheets or images. In n8n, you need a named key to reference the data. Do not use the terms "binary data" or "binary property" for this field. Instead, use a more descriptive name, such as:

- **Input Data Field Name**
- **Output Data Field Name**

## Code Standards
The n8n official Code Standards for nodes is found at https://docs.n8n.io/integrations/creating-nodes/build/reference/code-standards/ which is built from the Markdown source at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/code-standards.md and is duplicated below:

### Code standards

Following defined code standards when building your node makes your code more readable and maintainable, and helps avoid errors. This document provides guidance on good code practices for node building. It focuses on code details. For UI standards and UX guidance, refer to [Node UI design](/integrations/creating-nodes/plan/node-ui-design.md).

## Use the linter

The n8n node linter provides automatic checking for many of the node-building standards. You should ensure your node passes the linter's checks before publishing it. Refer to the [n8n node linter](/integrations/creating-nodes/test/node-linter.md) documentation for more information.

## Use the starter

The n8n node starter project includes a recommended setup, dependencies (including the linter), and examples to help you get started. Begin new projects with the [starter](https://github.com/n8n-io/n8n-nodes-starter).

## Write in TypeScript

All n8n code is TypeScript. Writing your nodes in TypeScript can speed up development and reduce bugs.

## Detailed guidelines for writing a node

These guidelines apply to any node you build. 

### Resources and operations

If your node can perform several operations, call the parameter that sets the operation `Operation`. If your node can do these operations on more than one resource, create a `Resource` parameter. The following code sample shows a basic resource and operations setup:

```js
export const ExampleNode implements INodeType {
    description: {
        displayName: 'Example Node',
        ...
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Resource One',
                        value: 'resourceOne'
                    },
                    {
                        name: 'Resource Two',
                        value: 'resourceTwo'
                    }
                ],
                default: 'resourceOne'
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                // Only show these operations for Resource One
                displayOptions: {
                    show: {
                        resource: [
                            'resourceOne'
                        ]
                    }
                },
                options: [
                    {
                        name: 'Create',
                        value: 'create',
                        description: 'Create an instance of Resource One'
                    }
                ]
            }
        ]
    }
}
```

### Reuse internal parameter names

All resource and operation fields in an n8n node have two settings: a display name, set using the `name` parameter, and an internal name, set using the `value` parameter. Reusing the internal name for fields allows n8n to preserve user-entered data if a user switches operations. 

For example: you're building a node with a resource named 'Order'. This resource has several operations, including Get, Edit, and Delete. Each of these operations uses an order ID to perform the operation on the specified order. You need to display an ID field for the user. This field has a display label, and an internal name. By using the same internal name (set in `value`) for the operation ID field on each resource, a user can enter the ID with the Get operation selected, and not lose it if they switch to Edit.

When reusing the internal name, you must ensure that only one field is visible to the user at a time. You can control this using `displayOptions`.

## Detailed guidelines for writing a programmatic-style node

These guidelines apply when building nodes using the programmatic node-building style. They aren't relevant when using the declarative style. For more information on different node-building styles, refer to [Choose your node building approach](/integrations/creating-nodes/plan/choose-node-method.md).

### Don't change incoming data

Never change the incoming data a node receives (data accessible with `this.getInputData()`) as all nodes share it. If you need to add, change, or delete data, clone the incoming data and return the new data. If you don't do this, sibling nodes that execute after the current one will operate on the altered data and process incorrect data.

It's not necessary to always clone all the data. For example, if a node changes the binary data but not the JSON data, you can create a new item that reuses the reference to the JSON item.


### Use the built in request library

Some third-party services have their own libraries on npm, which make it easier to create an integration. The problem with these packages is that you add another dependency (plus all the dependencies of the dependencies). This adds more and more code, which has to be loaded, can introduce security vulnerabilities, bugs, and so on. Instead, use the built-in module:

```typescript
// If no auth needed
const response = await this.helpers.httpRequest(options);

// If auth needed
const response = await this.helpers.httpRequestWithAuthentication.call(
	this, 
	'credentialTypeName', // For example: pipedriveApi
	options,
);
```

This uses the npm package [Axios](https://www.npmjs.com/package/axios).

Refer to [HTTP helpers](/integrations/creating-nodes/build/reference/http-helpers.md) (raw Markdown located at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/http-helpers.md) for more information, and for migration instructions for the removed `this.helpers.request`.

## Ensure the following file structure best practices are followed
From https://docs.n8n.io/integrations/creating-nodes/build/reference/node-file-structure/ (Markdown at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/node-file-structure.md):

### Node file structure

Following best practices and standards in your node structure makes your node easier to maintain. It's helpful if other people need to work with the code.

The file and directory structure of your node depends on:

* Your node's complexity.
* Whether you use node versioning.
* How many nodes you include in the npm package.

n8n recommends using the [`n8n-node` tool](/integrations/creating-nodes/build/n8n-node.md) to create the expected node file structure. You can customize the generated scaffolding as required to meet more complex needs.

#### Required files and directories

Your node must include:

* A `package.json` file at the root of the project. Every npm module requires this.
* A `nodes` directory, containing the code for your node:
    * This directory must contain the [base file](/integrations/creating-nodes/build/reference/node-base-files/index.md), in the format `<node-name>.node.ts`. For example, `MyNode.node.ts`.
    * n8n recommends including a [codex file](/integrations/creating-nodes/build/reference/node-codex-files.md), containing metadata for your node. The codex filename must match the node base filename. For example, given a node base file named `MyNode.node.ts`, the codex name is `MyNode.node.json`.
    * The `nodes` directory can contain other files and subdirectories, including directories for versions, and node code split across more than one file to create a modular structure.
* A `credentials` directory, containing your credentials code. This code lives in a single [credentials file](/integrations/creating-nodes/build/reference/credentials-files.md). The filename format is `<node-name>.credentials.ts`. For example, `MyNode.credentials.ts`.

#### Modular structure

<!-- vale off -->
You can choose whether to place all your node's functionality in one file, or split it out into a base file and other modules, which the base file then imports. Unless your node is very simple, it's a best practice to split it out.
<!-- vale on -->

A basic pattern is to separate out operations. Refer to the [HttpBin starter node](https://github.com/n8n-io/n8n-nodes-starter/tree/master/nodes/HttpBin) for an example of this.

For more complex nodes, n8n recommends a directory structure. Refer to the [Airtable node](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/Airtable) or [Microsoft Outlook node](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/Microsoft/Outlook) as examples. 

  * `actions`: a directory containing sub-directories that represent resources.
    * Each sub-directory should contain two types of files: 
      * An index file with resource description (named either `<resourceName>.resource.ts` or `index.ts`) 
      * Files for operations `<operationName>.operation.ts`. These files should have two exports: `description` of the operation and an `execute` function.
  * `methods`: an optional directory dynamic parameters' functions.  
  * `transport`: a directory containing the communication implementation.

#### Versioning

If your node has more than one version, and you're using full versioning, this makes the file structure more complex. You need a directory for each version, along with a base file that sets the default version. Refer to [Node versioning](/integrations/creating-nodes/build/reference/node-versioning.md) for more information on working with versions, including types of versioning.

#### Decide how many nodes to include in a package

There are two possible setups when building a node:

* One node in one npm package.
* More than one node in a single npm package.

n8n supports both approaches. If you include more than one node, each node should have its own directory in the `nodes` directory.

#### A best-practice example for programmatic nodes

n8n's built-in [Airtable node](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/Airtable) implements a modular structure and versioning, following recommended patterns.

## Node Base Files
The base file contains the core of the node code, see various type of styles at https://docs.n8n.io/integrations/creating-nodes/build/reference/node-base-files/ (Markdown is at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/node-base-files/index.md) for more detail about struture and parameters for each type of node:

### Node base file

The node base file contains the core code of your node. All nodes must have a base file. The contents of this file are different depending on whether you're building a declarative-style or programmatic-style node. For guidance on which style to use, refer to [Choose your node building approach](/integrations/creating-nodes/plan/choose-node-method.md).

These documents give short code snippets to help understand the code structure and concepts. For full walk-throughs of building a node, including real-world code examples, refer to [Build a declarative-style node](/integrations/creating-nodes/build/declarative-style-node.md) or [Build a programmatic-style node](/integrations/creating-nodes/build/programmatic-style-node.md).

You can also explore the [n8n-nodes-starter](https://github.com/n8n-io/n8n-nodes-starter) and n8n's own [nodes](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes) for a wider range of examples. The starter contains basic examples that you can build on. The n8n [Mattermost node](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/Mattermost) is a good example of a more complex programmatic-style node, including versioning.

For all nodes, refer to the:

* [Structure of the node base file](/integrations/creating-nodes/build/reference/node-base-files/structure.md)
* [Standard parameters](/integrations/creating-nodes/build/reference/node-base-files/standard-parameters.md)

For declarative-style nodes, refer to the:

* [Declarative-style parameters](/integrations/creating-nodes/build/reference/node-base-files/declarative-style-parameters.md)

For programmatic-style nodes, refer to the:

* [Programmatic-style parameters](/integrations/creating-nodes/build/reference/node-base-files/programmatic-style-parameters.md)
* [Programmatic-style execute() method](/integrations/creating-nodes/build/reference/node-base-files/programmatic-style-execute-method.md)

## Codex Files
Ensure every node has a Codex file that follows this format documented at https://docs.n8n.io/integrations/creating-nodes/build/reference/node-codex-files/ (Markdown is at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/node-codex-files.md):

### Node codex files

The codex file contains metadata about your node. This file is the JSON file at the root of your node. For example, the [`HttpBin.node.json`](https://github.com/n8n-io/n8n-nodes-starter/blob/master/nodes/HttpBin/HttpBin.node.json) file in the n8n starter. 

The codex filename must match the node base filename. For example, given a node base file named `MyNode.node.ts`, the codex would be named `MyNode.node.json`.

| Parameter | Description |
| -------- | ----------- |
| `node`    | Includes the node name. Must start with `n8n-nodes-base.`. For example, `n8n-nodes-base.openweatherapi`. | 
| `nodeVersion` | The node version. This should have the same value as the `version` parameter in your main node file. For example, `"1.0"`. |
| `codexVersion` | The codex file version. The current version is `"1.0"`. |
| `categories` | The settings in the `categories` array determine which category n8n adds your node to in the GUI. See [Node categories](#node-categories) for more information. |
| `resources` | The `resources` object contains links to your node documentation. n8n automatically adds help links to credentials and nodes in the GUI. |

#### Node categories

You can define one or more categories in your node configuration JSON. This helps n8n put the node in the correct category in the nodes panel.

Choose from these categories:

* Data & Storage
* Finance & Accounting
* Marketing & Content
* Productivity
* Miscellaneous
* Sales
* Development
* Analytics
* Communication
* Utility

You must match the syntax. For example, `Data & Storage` not `data and storage`.

## Credentials File
Ensure node credentials file format is followed per https://docs.n8n.io/integrations/creating-nodes/build/reference/credentials-files/ (Markdown is at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/credentials-files.md):

---
contentType: reference
---

# Credentials file

The credentials file defines the authorization methods for the node. The settings in this file affect what n8n displays in the **Credentials** modal, and must reflect the authentication requirements of the service you're connecting to.

In the credentials file, you can use all the [n8n UI elements](/integrations/creating-nodes/build/reference/ui-elements.md). n8n encrypts the data that's stored using credentials using an encryption key.

## Structure of the credentials file

The credentials file follows this basic structure:

1. Import statements
2. Create a class for the credentials
3. Within the class, define the properties that control authentication for the node.

### Outline structure

```js
import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ExampleNode implements ICredentialType {
	name = 'exampleNodeApi';
	displayName = 'Example Node API';
	documentationUrl = '';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
    		// Can be body, header, qs or auth
			qs: {
        		// Use the value from `apiKey` above
				'api_key': '={{$credentials.apiKey}}'
			}

		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.domain}}',
			url: '/bearer',
		},
	};
}
```


## Parameters

### `name`

String. The internal name of the object. Used to reference it from other places in the node.

### `displayName`

String. The name n8n uses in the GUI.

### `documentationUrl`

String. URL to your credentials documentation.

### `properties`

Each object contains:

* `displayName`: the name n8n uses in the GUI.
* `name`: the internal name of the object. Used to reference it from other places in the node.
* `type`: the data type expected, such as `string`.
* `default`: the URL that n8n should use to test credentials.

### `authenticate`

* `authenticate`: Object. Contains objects that tell n8n how to inject the authentication data as part of the API request. 

#### `type`

String. If you're using an authentication method that sends data in the header, body, or query string, set this to `'generic'`. 

#### `properties`

Object. Defines the authentication methods. Options are:

* `body`: Object. Sends authentication data in the request body. Can contain nested objects.
```typescript
authenticate: IAuthenticateGeneric = {
	type: 'generic',
	properties: {
		body: {
			username: '={{$credentials.username}}',
			password: '={{$credentials.password}}',
		},
	},
};
``` 

* `header`: Object. Send authentication data in the request header.
```typescript
authenticate: IAuthenticateGeneric = {
	type: 'generic',
	properties: {
		header: {
			Authorization: '=Bearer {{$credentials.authToken}}',
		},
	},
};
``` 

* `qs`: Object. Stands for "query string." Send authentication data in the request query string.
```typescript
authenticate: IAuthenticateGeneric = {
	type: 'generic',
	properties: {
		qs: {
			token: '={{$credentials.token}}',
		},
	},
};
``` 

* `auth`: Object. Used for Basic Auth. Requires `username` and `password` as the key names.
```typescript
authenticate: IAuthenticateGeneric = {
	type: 'generic',
	properties: {
		auth: {
			username: '={{$credentials.username}}',
			password: '={{$credentials.password}}',
		},
	},
};
```

### `test`

Provide a `request` object containing a URL and authentication type that n8n can use to test the credential.

```typescript
test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.domain}}',
			url: '/bearer',
		},
	};
```

## HTTP request helper for node builders
For programmatic style nodes, not declarative, follow these helper guidelines for making HTTP requests documented at https://docs.n8n.io/integrations/creating-nodes/build/reference/http-helpers/ (Markdown is at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/http-helpers.md):

---
contentType: reference
---

# HTTP request helper for node builders

n8n provides a flexible helper for making HTTP requests, which abstracts away most of the complexity.

/// note | Programmatic style only
The information in this document is for node building using the programmatic style. It doesn't apply to declarative style nodes.
///

### Basic Usage

Call the helper inside the `execute` function. 

```typescript
// If no auth needed
const response = await this.helpers.httpRequest(options);

// If auth needed
const response = await this.helpers.httpRequestWithAuthentication.call(
	this, 
	'credentialTypeName', // For example: pipedriveApi
	options,
);
```

### Request Options

`options` is an object:

```typescript
{
	url: string;
	headers?: object;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
	body?: FormData | Array | string | number | object | Buffer | URLSearchParams;
	qs?: object;
	arrayFormat?: 'indices' | 'brackets' | 'repeat' | 'comma';
	auth?: {
		username: string,
		password: string,
	};
	disableFollowRedirect?: boolean;
	encoding?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
	skipSslCertificateValidation?: boolean;
	returnFullResponse?: boolean;
	proxy?: {
		host: string;
		port: string | number;
		auth?: {
			username: string;
			password: string;
		},
		protocol?: string;
	};
	timeout?: number;
	json?: boolean;
}	
```

### Field Descriptions

`url` is required. The other fields are optional. The default method is `GET`.

Some notes about the possible fields:

- `body`: you can use a regular JavaScript object for JSON payload, a buffer for file uploads, an instance of FormData for `multipart/form-data`, and `URLSearchParams` for `application/x-www-form-urlencoded`.
- `headers`: a key-value pair.  
	* If `body` is an instance of `FormData` then n8n adds `content-type: multipart/form-data` automatically.  
	* If `body` is an instance of `URLSearchParams`, then n8n adds `content-type: application/x-www-form-urlencoded`.  
	* To override this behavior, set a `content-type` header.
- `arrayFormat`: if your query string contains an array of data, such as `const qs = {IDs: [15,17]}`, the value of `arrayFormat` defines how n8n formats it.  
	* `indices` (default):  `{ a: ['b', 'c'] }` as `a[0]=b&a[1]=c`  
	* `brackets`: `{ a: ['b', 'c'] }` as `a[]=b&a[]=c`  
	* `repeat`: `{ a: ['b', 'c'] }` as `a=b&a=c`  
	* `comma`: `{ a: ['b', 'c'] }` as `a=b,c`
- `auth`: Used for Basic auth. Provide `username` and `password`. n8n recommends omitting this, and using `helpers.httpRequestWithAuthentication(...)` instead.
- `disableFollowRedirect`: By default, n8n follows redirects. You can set this to true to prevent this from happening.
- `skipSslCertificateValidation`: Used for calling HTTPS services without proper certificate
- `returnFullResponse`: Instead of returning just the body, returns an object with more data in the following format: `{body: body, headers: object, statusCode: 200, statusMessage: 'OK'}`
- `encoding`: n8n can detect the content type, but you can specify `arrayBuffer` to receive a Buffer you can read from and interact with.

### Example Implementation

For an example, refer to the [Mattermost node](https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/nodes/Mattermost/v1/MattermostV1.node.ts).

### Deprecation Notice

The previous helper implementation using `this.helpers.request(options)` used and exposed the `request-promise` library. This was removed in version 1.

To minimize incompatibility, n8n made a transparent conversion to another library called `Axios`.

If you are having issues, please report them in the [Community Forums](https://community.n8n.io/) or on [GitHub](https://github.com/n8n-io/n8n/issues).

### Migration Guide

The new helper is much more robust, library agnostic, and easier to use.

New nodes should all use the new helper. You should strongly consider migrating existing custom nodes to the new helper. These are the main considerations when migrating:

- Accepts `url`. Doesn't accept `uri`.
- `encoding: null` now must be `encoding: arrayBuffer`.
- `rejectUnauthorized: false` is now `skipSslCertificateValidation: true`
- Use `body` according to `content-type` headers to clarify the payload.
- `resolveWithFullResponse` is now `returnFullResponse` and has similar behavior

## Item Linking
Ensure that when relevant, these item linking guidelines for accessing data from items that precede the current item are followed, documented at https://docs.n8n.io/integrations/creating-nodes/build/reference/paired-items/ (Markdown is at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/paired-items.md):

The Markdown link above only contains a partial snippet in the documentation above but it references the following Markdown folder of files: https://github.com/n8n-io/n8n-docs/tree/main/docs/data/data-mapping/data-item-linking with the index.md file containing the following. When needing to handle data linking, reference the linked documentation when necessary for more detail:

---
contentType: overview
---

# Data item linking

An item is a single piece of data. Nodes receive one or more items, operate on them, and output new items. Each item links back to previous items. 

You need to understand this behavior if you're:

* Building a programmatic-style node that implements complex behaviors with its input and output data.
* Using the Code node or expressions editor to access data from earlier items in the workflow. 
* Using the Code node for complex behaviors with input and output data.

This section provides:

* A conceptual overview of [Item linking concepts](/data/data-mapping/data-item-linking/item-linking-concepts.md). 
* Information on [Item linking for node creators](/data/data-mapping/data-item-linking/item-linking-node-building.md).
* Support for end users who need to [Work with the data path](/data/data-mapping/data-item-linking/item-linking-code-node.md) to retrieve item data from previous nodes, and link items when using the Code node.
* Guidance on troubleshooting [Errors](/data/data-mapping/data-item-linking/item-linking-errors.md).

## UX Guidelines
Follow these User Experience (UX) guidelines for community nodes as defined at https://docs.n8n.io/integrations/creating-nodes/build/reference/ux-guidelines/ (Markdown is at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/ux-guidelines.md):

---
contentType: reference
---

### UX guidelines for community nodes

Your node's UI must conform to these guidelines to be a [verified community node](/integrations/creating-nodes/deploy/submit-community-nodes.md#submit-your-node-for-verification-by-n8n) candidate.

### Credentials

API key and sensitive credentials should always be password fields.

#### OAuth

Always include the OAuth credential if available.

### Node structure

#### Operations to include

Try to include **CRUD** operations for each resource type.

Try to include common operations in nodes for each resource. n8n uses some CRUD operations to keep the experience consistent and allow users to perform basic operations on the resource. The suggested operations are:

* **Create**
* **Create or Update (Upsert)**
* **Delete**
* **Get**
* **Get Many:** also used when some filtering or search is available
* **Update**

Notes:

1. These operations can apply to the resource itself or an entity inside of the resource (for example, a row inside a Google Sheet). When operating on an entity inside of the resource, you must specify the **name of the entity** in the operations name.
2. The naming could change depending on the node and the resource. Check the following guidelines for details.

#### Resource Locator

* Use a Resource Locator component whenever possible. This provides a much better UX for users. The Resource Locator Component is most often useful when you have to select a single item.
* The default option for the Resource Locator Component should be `From list` (if available).

#### Consistency with other nodes

* Maintain UX consistency: n8n tries to keep its UX consistent. This means following existing UX patterns, in particular, those used in the latest new or overhauled nodes.
* Check similar nodes: For example, if you're working on a database node, it's worth checking the Postgres node.

#### Sorting options

* You can enhance certain "Get Many" operations by providing users with sorting options.
* Add sorting in a dedicated collection (below the "Options" collection). Follow the example of [Airtable Record:Search](https://github.com/n8n-io/n8n/blob/92e2a8e61a4189025e5d4bac8be81576b624fe85/packages/nodes-base/nodes/Airtable/v2/actions/record/search.operation.ts#L85-L135).

### Node functionality

#### Deleting operations output

When deleting an item (like a record or a row), return an array with a single object: `{"deleted": true}`. This is a confirmation for the user that the deletion was successful and the item will trigger the following node.

#### Simplifying output fields

##### Normal nodes: 'Simplify' parameter

When an endpoint returns data with more than 10 fields, add the "Simplify" boolean parameter to return a simplified version of the output with max 10 fields.

* One of the main issues with n8n can be the size of data and the Simplify parameter limits that problem by reducing data size.
* Select the most useful fields to output in the simplified node and sort them to have the most used ones at the top.
* In the Simplify mode, it's often best to flatten nested fields
* Display Name: `Simplify`
* Description: `Whether to return a simplified version of the response instead of the raw data`

##### AI tool nodes: 'Output' parameter

When an endpoint returns data with more than 10 fields, add the 'Output' option parameter with 3 modes.

In AI tool nodes, allow the user to be more granular and select the fields to output. The rationale is that tools may run out of context window and they can get confused by too many fields, so it's better to pass only the ones they need.

Options:

* **Simplified:** Works the same as the "Simplify" parameter described above.
* **Raw:** Returns all the available fields.
* **Selected fields:** Shows a multi-option parameter for selecting the fields to add to the output and send to the AI agent. By default, this option always returns the ID of the record/entity.

### Copy

#### Text Case

Use **Title Case** for the node `name`, `parameters display names` (labels), `dropdown titles`. Title Case is when you capitalize the first letter of each word, except for certain small words, such as articles and short prepositions.

Use **Sentence case** for node `action` names, node `descriptions`, `parameters descriptions` (tooltips), `hints`, `dropdown descriptions`.

#### Terminology

* **Use the third-party service terminology:** Try to use the same terminology as the service you're interfacing with (for example, Notion 'blocks', not Notion 'paragraphs').
* **Use the terminology used in the UI:** Stick to the terminology used in the user interface of the service, rather than that used in the APIs or technical documentation (for example, in Trello you "archive" cards, but in the API they show up as "closed". In this case, you might want to use "archive").
* **No tech jargon:** Don't use technical jargon where simple words will do. For example, use "field" instead of "key".
* **Consistent naming:** Choose one term for something and stick to it. For example, don't mix "directory" and "folder".

#### Placeholders

It's often helpful to insert examples of content in parameters placeholders. These should start with "e.g." and use **camel case** for the demo content in fields.

Placeholder examples to copy:

* image: `e.g. https://example.com/image.png`
* video: `e.g. https://example.com/video.mp4`
* search term: `e.g. automation`
* email: `e.g. nathan@example.com`
* Twitter user (or similar): `e.g. n8n`
* Name and last name: `e.g. Nathan Smith`
* First name: `e.g. Nathan`
* Last name: `e.g. Smith`

#### Operations name, action, and description

* **Name:** This is the name displayed in the select when the node is open on the canvas. It must use title case and doesn't have to include the resource (for example, "Delete").
* **Action:** This is the name of the operation displayed in the panel where the user selects the node. It must be in sentence case and must include the resource (for example, "Delete record").
* **Description:** This is the sub-text displayed below the name in the select when the node is open on the canvas. It must use sentence case and must include the resource. It can add a bit of information and use alternative words than the basic resource/operation (for example, "Retrieve a list of users").
* If the operation acts on an entity that's not the Resource (for example, a row in a Google Sheet), specify that in the operation name (for example, "Delete Row").

As a general rule, is important to understand what the **object** of an operation is. Sometimes, the object of an Operation is the resource itself (for example, `Sheet:Delete` to delete a Sheet).

In other cases, the object of the operation isn't the resource, but something contained inside the resource (for example, `Table:Delete rows`, here the resource is the table, but what you are operating on are the rows inside of it).

##### Naming `name`

This is the name displayed in the select when the node is open on the canvas.

* Parameter: `name`
* Case: Title Case

Naming guidelines:

* **Don't repeat the resource (if the resource selection is above):** The resource is often displayed above the operation, so it's not necessary to repeat it in the operation (this is the case if the object of the operation is the resource itself).
	* For example: `Sheet:Delete` → No need to repeat `Sheet` in `Delete`, because n8n displays `Sheet` in the field above and what you're deleting is the Sheet.
* **Specify the resource if there's no resource selection above:** In some nodes, you won't have a resource selection (because there's only one resource). In these cases, specify the resource in the operation.
	* For example: `Delete Records` → In Airtable, there's no resource selection, so it's better to specify that the Delete operation will delete records.
* **Specify the object of the operation if it's not the resource:** Sometimes, the object of the operation isn't the resource. In these cases, specify the object in the operation as well.
	* For example: `Table:Get Columns` → Specify `Columns` because the resource is `Table`, while the object of the operation is `Columns`.

##### Naming `action`

This is the name of the operation displayed in the panel where the user selects the node.
* Parameter: `action`
* Case: Sentence case

Naming guidelines:

* **Omit articles:** To keep the text shorter, get rid of articles (a, an, the…).
	* **correct**: `Update row in sheet`
	* **incorrect**: `Update a row in a sheet`
* **Repeat the resource:** In this case, it's okay to repeat the resource. Even if the resource is visible in the list, the user might not notice and it's useful to repeat it in the operation label.
*  **Specify the object of the operation if it is not the resource:** Same as for the operation name. In this case, you don't need to repeat the resource.
	* For example: `Append Rows` → You have to specify `Rows` because rows are what you're actually appending to. Don't add the resource (`Sheet`) since you aren't appending to the resource.

##### Naming `description`

This is the sub-text displayed below the name in the selection when the node is open on the canvas.

* Parameter: `description`
* Case: Sentence case

Naming guidelines:

*  If possible, add more information than that specified in the operation `name`
*  Use alternative wording to help users better understand what the operation is doing. Some people might not understand the text used in the operation (maybe English isn't their native language), and using alternative working could help them.

##### Vocabulary

n8n uses a general vocabulary and some context-specific vocabulary for groups of similar applications (for example, databases or spreadsheets).

The general vocabulary takes inspiration from CRUD operations:

* **Clear**
    * Delete all the contents of the resource (empty the resource).
    * Description: `Delete all the <CHILD_ELEMENT>s inside the <RESOURCE>`
* **Create**
    * Create a new instance of the resource.
    * Description: `Create a new <RESOURCE>`
* **Create or Update**
    * Create or update an existing instance of the resource.
    * Description: `Create a new <RESOURCE> or update an existing one (upsert)`
* **Delete**
    * You can use "Delete" in two different ways:
        1. Delete a resource:
            * Description: `Delete a <RESOURCE> permanently` (use "permanently" only if that's the case)
        2. Delete something **inside** of the resource (for example, a row):
            * In this case, **always specify the object of the operation**: for example, `Delete Rows` or `Delete Records`.
            * Description: `Delete a <CHILD_ELEMENT> permanently`
* **Get**
    * You can use "Get" in two different ways:
        1. Get a resource:
            * Description: `Retrieve a <RESOURCE>`
        2. Get an item **inside** of the resource (for example, records):
            * In this case, **always specify the object of the operation**: for example, `Get Row` or `Get Record`.
            * Description: `Retrieve a <CHILD_ELEMENT> from the/a <RESOURCE>`
* **Get Many**
    * You can use "Get Many" in two different ways:
        1. Get a list of resources (without filtering):
            * Description: `Retrieve a list of <RESOURCE>s`
        2. Get a list of items **inside** of the resource (for example, records):
            * In this case, **always specify the object of the operation**: for example, `Get Many Rows` or `Get Many Records`.
            * You can omit `Many`: `Get Many Rows` can be `Get Rows`.
            * Description: `List all <CHILD_ELEMENT>s in the/a <RESOURCE>`
* **Insert** or **Append**
    * Add something inside of a resource.
    * Use `insert` for database nodes.
    * Description: `Insert <CHILD_ELEMENT>(s) in a <RESOURCE>`
* **Insert or Update** or **Append or Update**
    * Add or update something inside of a resource.
    * Use `insert` for database nodes.
    * Description: `Insert <CHILD_ELEMENT>(s) or update an existing one(s) (upsert)`
* **Update**
    * You can use "Update" in two different ways:
        1. Update a resource:
            * Description: `Update one or more <RESOURCE>s`
        2. Update something **inside** of a resource (for example, a row):
            * In this case, **always specify the object of the operation**: for example, `Update Rows` or `Update Records`.
            * Description: `Update <CHILD_ELEMENT>(s) inside a <RESOURCE>`

#### Referring to parameter and field name

When you need to refer to parameter names or field names in copy, wrap them in single quotation marks (for example, "Please fill the `'name'` parameter).

#### Boolean description

Start the description of boolean components with 'Whether...'

### Errors

#### General philosophy

Errors are sources of pain for users. For this reason, n8n always wants to tell the user:

* **What happened**: a description of the error and what went wrong.
* **How to solve the problem**: or at least how to get unstuck and continue using n8n without problems. n8n doesn't want users to remain blocked, so use this as an opportunity to guide them to success.

#### Error structure in the Output panel

##### Error Message - What happened

This message explains to the user what happened, and the current issue that prevents the execution completing.

* If you have the `displayName` of the parameter that triggered the error, include it in the error message or description (or both).
* Item index: if you have the ID of the item that triggered the error, append `[Item X]` to the error message. For example, `The ID of the release in the parameter "Release ID" for could not be found [item 2]`.
* Avoid using words like "error", "problem", "failure", "mistake".

##### Error Description - How to solve or get unstuck

The description explains to users how to solve the problem, what to change in the node configuration (if that's the case), or how to get unstuck. Here, you should guide them to the next step and unblock them.

Avoid using words like "error", "problem", "failure", "mistake".

## Verification Guidelines
Ensure that the verification guidelines at https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/ (Markdown is at https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/creating-nodes/build/reference/verification-guidelines.md) will likely succeed or be easy to adjust code so the verification will succeeed, when possible:

### Community node verification guidelines

/// note | Do you want n8n to verify your node?
Consider following these guidelines while building your node if you want to submit it for verification by n8n. Any user with verified community nodes enabled can discover and install verified nodes from n8n's nodes panel across all deployment types (self-hosted and n8n Cloud).
///

#### Use the n8n-node tool

All verified community node authors should strongly consider using the [`n8n-node` tool](/integrations/creating-nodes/build/n8n-node.md) to create and check their package. This helps n8n ensure quality and consistency by:

* Generating the expected package file structure
* Adding the required metadata and configuration to the `package.json` file
* Making it easy to lint your code against n8n's standards
* Allowing you to load your node in a local n8n instance for testing

#### Package source verification

* Verify that your npm package repository URL matches the expected GitHub (or other platform) repository.
* Confirm that the package author / maintainer matches between npm and the repository.
* Confirm that the git link in npm works and that the repository is public.
* Make sure your package has proper documentation (README, usage examples, etc.).
* Make sure your package license is MIT.

#### No external dependencies

* Ensure that your package does **not** include any external dependencies to keep it lightweight and easy to maintain.

#### Proper documentation

* Provide clear documentation, whether it's a **README** on GitHub or links to relevant **API documentation**.
* Include usage instructions, example workflows, and any necessary authentication details.

#### No access to environment variables or file system

* The code **must not** interact with environment variables or attempt to read/write files.
* Pass all necessary data through node parameters.

#### Follow n8n best practices

* Maintain a clear and consistent coding style.
* Use **TypeScript** and follow n8n's [**node development guidelines**](/integrations/creating-nodes/overview.md).
* Ensure proper error handling and validation.
* Make sure the linter passes (in other words, make sure running `npx @n8n/scan-community-package n8n-nodes-PACKAGE` passes).

#### Use English language only

* Both the node interface and all documentation must be in **English** only.
* This includes parameter names, descriptions, help text, error messages and **README** content.


## AI Instructions
- **TypeScript Generation:** Generate TypeScript code following TypeScript best practices and using JSDoc-style comments.
- **TypeScript Documentation:** Use JSDoc-style comments to document functions, classes, and modules.
- When unsure of best practices for building nodes, refer to the n8n documentation at the following URL: https://docs.n8n.io/integrations/creating-nodes/overview/ and the sub-pages and sections that include:
- https://docs.n8n.io/integrations/creating-nodes/plan/
- https://docs.n8n.io/integrations/creating-nodes/build/
- https://docs.n8n.io/integrations/creating-nodes/test/
- https://docs.n8n.io/integrations/creating-nodes/deploy/