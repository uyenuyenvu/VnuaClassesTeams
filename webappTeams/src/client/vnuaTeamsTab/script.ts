import * as microsoftTeams from '@microsoft/teams-js';
import jwtDecode from 'jwt-decode';

// @ts-ignore

export async function getTokens() {
    const authToken = await getAuthToken();
    const context = await microsoftTeams.app.getContext();
    const tenantId = context?.user?.tenant?.id;
    if (!tenantId) {
        throw new Error('Tenant ID is undefined');
    }

    const {email, name} = decodeAuthToken(authToken);

    return {
        authToken,
        tenantId,
        email,
        name,
    };
}

function decodeAuthToken(authToken: string) {
    const decoded: { [key: string]: any } = jwtDecode(authToken) as {
        [key: string]: any;
    };
    const {
        tid: tenantId,
        oid: homeAccountId,
        preferred_username: email,
        name,
    } = decoded;
    return { tenantId, homeAccountId, email, name };
}

export function getAuthToken(): Promise<string> {
    return microsoftTeams.authentication.getAuthToken({
        resources: [process.env.TAB_APP_URI as string],
        silent: false,
    } as microsoftTeams.authentication.AuthTokenRequestParameters);
}
