import * as msal from '@azure/msal-node';
import * as microsoftTeams from '@microsoft/teams-js';

// Khởi tạo
const msalClient = new msal.ConfidentialClientApplication({
  auth: {
    clientId: process.env.OAUTH_CLIENT_ID as string,
    authority: process.env.OAUTH_AUTHORITY,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(_unusedloglevel, message, _usuedContainsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    },
  },
});

// @ts-ignore
const scopes = process.env.MS_SCOPES.split(' ');

const AUTH_FAIL_MSG = 'Xác thực MS Team thất bại';

export async function getTokens() {
  const authToken = await getAuthToken();
  const context = await microsoftTeams.app.getContext();
  const tenantId = context?.user?.tenant?.id;
  if (!tenantId) {
    throw new Error('Tenant ID is undefined');
  }

  const authenticationResult = await msalClient.acquireTokenOnBehalfOf({
    authority: `https://login.microsoftonline.com/${tenantId}`,
    oboAssertion: authToken,
    scopes,
  });

  if (!authenticationResult || !authenticationResult.account) {
    throw new Error(AUTH_FAIL_MSG);
  }

  const { accessToken, account } = authenticationResult;
  const refreshToken = aquireRefreshToken(account.homeAccountId);

  return {
    accessToken,
    refreshToken,
    account,
  };
}

function aquireRefreshToken(homeAccountId: string) {
  const refreshTokenObject = JSON.parse(
    msalClient.getTokenCache().serialize()
  ).RefreshToken;

  for (const item of Object.values(refreshTokenObject)) {
    //@ts-ignore
    if (item['home_account_id'].includes(homeAccountId)) {
      //@ts-ignore
      return item.secret;
    }
  }
}

export function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    microsoftTeams.authentication.getAuthToken({
      successCallback: resolve,
      failureCallback: reject,
    });
  });
}
