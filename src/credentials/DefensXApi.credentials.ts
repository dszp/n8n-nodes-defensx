import type { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class DefensXApi implements ICredentialType {
  name = 'defensxApi';

  displayName = 'DefensX API';

  icon = 'file:DefensX.svg' as const;

  test = {
    request: {
      url: '={{$credentials.apiRoot.replace(/\\/$/, \'\').replace(/\\/api\\/partner\\/v1$/, \'\')}}/api/partner/v1/status',
      method: 'GET' as const,
      json: true,
    },
    rules: [
      {
        type: 'responseCode' as const,
        properties: {
          value: 200,
          message: 'Connection failed. Please check your API Root and API Key.',
        },
      },
    ],
  };

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  properties: INodeProperties[] = [
    {
      displayName: 'API Root',
      name: 'apiRoot',
      type: 'string',
      default: 'https://cloud.defensx.com',
      description: 'Base URL for DefensX (without the /api/partner/v1 path).',
      required: true,
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
    },
  ];
}
