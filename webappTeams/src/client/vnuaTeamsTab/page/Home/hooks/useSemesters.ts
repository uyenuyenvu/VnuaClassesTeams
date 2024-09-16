import { useQuery } from '@tanstack/react-query';
import { Semester } from '../../../../../types/Semester';
import { getAllSemester } from '../../../api';

export function useSemesters() {
    return useQuery<Semester[]>({
        queryKey: ['semesters'],
        queryFn: () => getAllSemester().then(({ data }) => data),
        retry: 1,
    });
}
