import * as React from 'react';
import Swal from 'sweetalert2';
import { Header } from '../../common/components/Header';
import { Loading } from '../../common/components/Loading';
import useLocalStorage from '../../common/hooks/useLocalStorage';
import { User } from '../../types/user';
import { ClassCreatingLoadingModal } from './components/ClassCreatingModal';
import { SemesterForm } from './components/SemesterForm';
import { TeachingClassTable } from './components/TeachingClassTable';
import { useCreateClass } from './hooks/useCreateClass';
import { useFetchingClasses } from './hooks/useTeachingClasses';
import { TeachingClass } from '../../types/teaching-class';
import { DownloadUtil } from '../../util/download-util';

type HomeProps = {
    user: User;
    onClickChangeTeacherId: () => void;
};
export function Home({ user, onClickChangeTeacherId }: HomeProps) {
    const {
        getTeachingClasses,
        updateTeachingClassCreateStatus,
        updateTeachingClassHasOnlineMeeting,
        teachingClasses,
        isLoading: isFetchingTeachingClasses,
        getTeachingClassesError,
        resetAllClassCreateStatus,
    } = useFetchingClasses();
    const { mutateAsync: createClassAsync } = useCreateClass();
    const [isCreatingClasses, setIsCreatingClasses] =
        React.useState<boolean>(false);
    const { value: authToken } = useLocalStorage<string>('authToken');
    const { value: tenantId } = useLocalStorage<string>('tenantId');

    const hasCreatedClasses =
        teachingClasses.length > 0 &&
        teachingClasses?.every(
            (item) =>
                item.createStatus.type === 'success' ||
                item.createStatus.type === 'error'
        );

    const getClasses = (semesterId: string, semesterCode?: string) => {
        getTeachingClasses(user.teacherId, semesterId, semesterCode);
    };

    if (getTeachingClassesError) {
        console.error(getTeachingClassesError);
        Swal.fire({
            icon: 'error',
            text: 'Có lỗi xảy ra khi lấy lịch dạy',
        });
    }

    const downloadClassesAsJson = (teachingClasses: TeachingClass[]) => {
        const semester = teachingClasses[0].semester;
        DownloadUtil.downloadJson(
            teachingClasses,
            `Lịch dạy của ${user.teacherId} HK${semester.index}-${semester.startYear}-${semester.endYear}.json`
        );
    };

    const createClasses = async () => {
        setIsCreatingClasses(true);
        resetAllClassCreateStatus();
        const creatingClasses = teachingClasses?.map((item) => ({
            ...item,
            createStatus: { type: 'none' as const },
            users: item.students.value.map(
                (student) => `${student.id}@sv.vnua.edu.vn`
            ),
        }));

        if (!creatingClasses) {
            Swal.fire({
                icon: 'info',
                text: 'KHông có lớp nào để tạo',
            });
            return;
        }

        for (const item of creatingClasses) {
            try {
                await createClassAsync({
                    authToken,
                    tenantId,
                    teachingClass: [item],
                });
                updateTeachingClassCreateStatus(item, { type: 'success' });
            } catch (error) {
                if (error.response?.status === 403) {
                    Swal.fire({
                        icon: 'error',
                        text: 'Đã hết phiên làm việc. Vui lòng đăng nhập lại',
                    });
                    return;
                }
                updateTeachingClassCreateStatus(item, {
                    type: 'error',
                    message: error.message,
                });
            }
        }

        // Cho người dùng nhìn thấy kết quả sau n giây
        setTimeout(() => setIsCreatingClasses(false), 1000);
    };

    return (
        <>
            {isCreatingClasses && (
                <ClassCreatingLoadingModal
                    successCount={
                        teachingClasses.filter(
                            (item) => item.createStatus.type === 'success'
                        ).length
                    }
                    errorCount={
                        teachingClasses.filter(
                            (item) => item.createStatus.type === 'error'
                        ).length
                    }
                    totalCount={teachingClasses.length}
                />
            )}

            <div className='mainWrap'>
                <div className={'containerWrap'}>
                    <Header
                        onClickChangeTeacherCode={onClickChangeTeacherId}
                        user={user}
                    />
                    <div className='content'>
                        <div className='teacherCodeContainer'>
                            <SemesterForm onSubmit={getClasses} />
                        </div>
                        <div className={'tableWrap'}>
                            <TeachingClassTable
                                teachingClasses={teachingClasses}
                                hasCreatedClasses={hasCreatedClasses}
                                onDownloadClasses={downloadClassesAsJson}
                                onUpdateClassHasOnineMeeting={
                                    updateTeachingClassHasOnlineMeeting
                                }
                                onCreateClasses={createClasses}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Loading enabled={isFetchingTeachingClasses} />
        </>
    );
}
