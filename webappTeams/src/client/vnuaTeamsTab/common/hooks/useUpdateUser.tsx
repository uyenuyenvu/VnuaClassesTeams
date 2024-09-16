import { useMutation } from '@tanstack/react-query';
import * as api from '../../api';
import { User } from '../../types/user';

export function useUpdateUser() {
    return useMutation<unknown, Error, User>({
        mutationFn: (params) => api.updateUser(params),
    });
}
