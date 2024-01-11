import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../api';
import * as microsoftTeams from '@microsoft/teams-js';
import { getTokens } from '../../script';
import useLocalStorage from './useLocalStorage';
import { User } from '../../types/user';

export function useMsTeams({ onSSOSuccess }) {
    const [currentUser, setCurrentUser] = useState<User>();
    const [isFetchingCurrentUser, setIsGettingCurrentUser] = useState(true);
    const [fetchingCurrentUserError, setError] = useState(null);

    const { setItem: setTenantId } = useLocalStorage<string>('tenantId');
    const { setItem: setAuthToken } = useLocalStorage<string>('authToken');
    const { setItem: setAppToken } = useLocalStorage<string>('appToken');

    useEffect(() => {
        (async () => {
            microsoftTeams.initialize();
            try {
                const { authToken, tenantId, email, name } = await getTokens();
                const { data } = await getCurrentUser({
                    authToken,
                    tenantId,
                    email,
                    name,
                });
                setCurrentUser(() => ({
                    id: data.userId,
                    displayName: name,
                    email,
                    teacherId: data.teacherId,
                }));
                setTenantId(tenantId);
                setAuthToken(authToken);
                setAppToken(data.accessToken)

                if (data.teacherId) {
                    onSSOSuccess();
                }
            } catch (error) {
                setError(error);
            } finally {
                setIsGettingCurrentUser(false);
            }
        })();
    }, []);

    return { currentUser, isFetchingCurrentUser, fetchingCurrentUserError };
}
