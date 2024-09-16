import axios from 'axios';
import { Semester } from '../../types/Semester';
import { TeachingClass } from './types/teaching-class';

const API_URL = process.env.API_URL;

function getAppToken() {
    return localStorage.getItem('appToken') ?? '';
}

export function getAllSemester() {
    return axios.get<Semester[]>(API_URL + 'api/vnua/semesters/', {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${getAppToken()}`,
        },
    });
}

type CurrentUserApiArgs = {
    authToken: string;
    tenantId: string;
    email: string;
    name: string;
};
export function getCurrentUser({
    authToken,
    tenantId,
    email,
    name,
}: CurrentUserApiArgs) {
    return axios.post<any>(
        API_URL + 'api/msteam/me/',
        {
            authToken,
            tenantId,
            email,
            name,
        },
        {
            headers: {
                Accept: 'application/json',
            },
        }
    );
}

type GetTeachingClassesArgs = {
    teacherId: string;
    semesterId: string;
};

export async function getTeachingClasses({
    teacherId,
    semesterId,
}: GetTeachingClassesArgs) {
    return axios.post<{ events: TeachingClass[] }>(
        API_URL + 'api/vnua/schedule/',
        { teacherId, semesterId },
        {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${getAppToken()}`,
            },
        }
    );
}

type CreateMsClassArgs = {
    authToken: string;
    tenantId: string;
    teachingClass: TeachingClass[];
};

export function createMsClass({
    authToken,
    tenantId,
    teachingClass,
}: CreateMsClassArgs) {
    return axios.post<object>(
        API_URL + 'api/msteam/main/',
        { token: authToken, tenantId, data: [teachingClass] },
        {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${getAppToken()}`,
            },
        }
    );
}

type UpdateUserArgs = {
    id: string;
    teacherId: string;
    email: string;
};

export function updateUser(user: UpdateUserArgs) {
    return axios.post<object>(API_URL + `api/users/${user.id}`, user, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${getAppToken()}`,
        },
    });
}
