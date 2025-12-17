import type { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class DefensXApi implements ICredentialType {
  name = 'defensxApi';

  displayName = 'DefensX API';

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
