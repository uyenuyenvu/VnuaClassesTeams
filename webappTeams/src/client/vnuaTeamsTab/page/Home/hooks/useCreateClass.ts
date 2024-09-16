import { useMutation } from '@tanstack/react-query';
import { createMsClass } from '../../../api';
import { TeachingClass } from '../../../types/teaching-class';

type UseCreateClassParams = {
    authToken: string;
    tenantId: string;
    teachingClass: TeachingClass[];
};

export function useCreateClass() {
    return useMutation<object, Error, UseCreateClassParams>({
        mutationKey: ['create-class'],
        mutationFn: (params) => createMsClass(params).then(({ data }) => data),
    });
}
