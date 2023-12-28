import { useState } from 'react';
import { getTeachingClasses } from '../../../api';
import {
    ClassCreateStatus,
    TeachingClass,
} from '../../../types/teaching-class';
import { StringUtil } from '../../../util/string-util';

export function useFetchingClasses() {
    const [teachingClasses, setTeachingClasses] = useState<TeachingClass[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    return {
        isLoading,
        teachingClasses,
        getTeachingClassesError: error,
        updateTeachingClassCreateStatus(
            teachingClass: TeachingClass,
            status: ClassCreateStatus
        ) {
            const newTeachingClasses = [...teachingClasses];
            const index = newTeachingClasses.findIndex(
                (item) =>
                    item.subjectId === teachingClass.subjectId &&
                    item.subjectGroup === teachingClass.subjectGroup
            );
            newTeachingClasses[index].createStatus = status;
            setTeachingClasses(newTeachingClasses);
        },
        getTeachingClasses(
            teacherId: string,
            semesterId: string,
            semesterCode?: string
        ) {
            setIsLoading(true);
            getTeachingClasses({
                teacherId,
                semesterId,
            })
                .then(({ data }) => {
                    // @ts-ignore
                    setTeachingClasses(
                        data.events.map((event) => ({
                            ...event,
                            displayName: getDisplayName(event, semesterCode),
                            createStatus: { type: 'none' as const },
                        }))
                    );
                })
                .catch((error) => {
                    setError(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        updateTeachingClassHasOnlineMeeting(
            classIndex: number,
            hasOnlineMeeting: boolean
        ) {
            const newTeachingClasses = [...teachingClasses];
            newTeachingClasses[classIndex].hasOnlineMeeting = hasOnlineMeeting;
            setTeachingClasses(newTeachingClasses);
        },
        resetAllClassCreateStatus() {
            setTeachingClasses(
                teachingClasses.map((item) => ({
                    ...item,
                    createStatus: { type: 'none' },
                }))
            );
        },
    };
}

function getDisplayName(classInfo: TeachingClass, semesterCode?: string) {
    const subjectName = StringUtil.removeVietnameseTones(classInfo.subjectName)
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    const subjectGroup =
        Number(classInfo.subjectGroup) < 10
            ? `0${classInfo.subjectGroup}`
            : classInfo.subjectGroup;
    const semester = classInfo.semester.index;
    const semesterStartYear = classInfo.semester.startYear;
    const semesterEndYear = classInfo.semester.endYear;
    if (semesterCode)
        return `${semesterCode}-${classInfo.subjectId}-${subjectName}-${subjectGroup}-HK${semester}-${semesterStartYear}-${semesterEndYear}`;
    return `${classInfo.subjectId}-${subjectName}-${subjectGroup}-HK${semester}-${semesterStartYear}-${semesterEndYear}`;
}
