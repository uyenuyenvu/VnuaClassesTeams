import {
    Provider
} from '@fluentui/react-northstar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTeams } from 'msteams-react-base-component';
import * as React from 'react';
import { useState } from 'react';
import Swal from 'sweetalert2';
// import { store } from '../client';
import { Loading } from './common/components/Loading';
import { useMsTeams } from './common/hooks/useMsTeams';
import { useUpdateUser } from './common/hooks/useUpdateUser';
import { Home } from './page/Home/Home';
import { Login } from './page/Login/Login';

enum APP_MODE {
    IS_AUTHENCATED,
    IS_REGISTER,
}

function Main() {
    const [appMode, setAppMode] = useState<APP_MODE>(APP_MODE.IS_REGISTER);
    const { currentUser, isFetchingCurrentUser, fetchingCurrentUserError } =
        useMsTeams({
            onSSOSuccess: () => setAppMode(APP_MODE.IS_AUTHENCATED),
        });

    const { isLoading: isUpdatingUser, mutateAsync: updateUserAsync } =
        useUpdateUser();

    if (fetchingCurrentUserError) {
        console.error(fetchingCurrentUserError);
        Swal.fire({
            icon: 'error',
            text: 'Có lỗi xảy ra khi lấy thông tin người dùng',
        });
    }

    const login = async (teacherId: string) => {
        if (!currentUser) {
            Swal.fire({
                icon: 'error',
                text: 'Có lỗi xảy ra khi đăng nhập',
            });
        } else {
            await updateUserAsync({ ...currentUser, teacherId });
            setAppMode(APP_MODE.IS_AUTHENCATED);
        }
    };

    switch (appMode) {
        case APP_MODE.IS_REGISTER:
            return (
                <>
                    <Login onLogin={login} />
                    <Loading
                        enabled={isFetchingCurrentUser || isUpdatingUser}
                    />
                </>
            );
        case APP_MODE.IS_AUTHENCATED:
            return (
                <Home
                    user={currentUser!}
                    onClickChangeTeacherId={() =>
                        setAppMode(APP_MODE.IS_REGISTER)
                    }
                />
            );
        default:
            return null;
    }
}

export function VnuaTeamsTab() {
    const [{ theme }] = useTeams();
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 2,
                retryDelay: 1000,
            },
        },
    });

    return (
        <Provider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <Main />
            </QueryClientProvider>
        </Provider>
    );
}
