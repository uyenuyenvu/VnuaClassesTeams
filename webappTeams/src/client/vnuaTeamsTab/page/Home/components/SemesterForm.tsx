import { Button } from '@fluentui/react-northstar';
import { Semester } from '../../../../../types/Semester';
import { useSemesters } from '../hooks/useSemesters';
import * as React from 'react';
import Swal from 'sweetalert2';
import { Loading } from '../../../common/components/Loading';

type SemesterSelectorProps = {
    onChangeSemester: (semesterId: string) => void;
    errorMessage?: string;
};

function SemesterSelector({
    onChangeSemester,
    errorMessage = '',
}: SemesterSelectorProps) {
    const {
        data: semesters,
        error: fetchingSemesterError,
        isLoading: isFetchingSemesters,
    } = useSemesters();

    if (fetchingSemesterError) {
        console.error(fetchingSemesterError);
        Swal.fire({
            icon: 'error',
            text: 'Có lỗi xảy ra khi lấy danh sách học kì',
        });
    }

    return (
        <>
            <select
                className={'select'}
                onChange={(e) => onChangeSemester(e.target.value)}
            >
                <option value='0'>Chọn học kỳ</option>
                {semesters?.map((item: Semester) => (
                    <option value={item.id} key={item.id}>
                        {item.name}
                    </option>
                ))}
            </select>
            <div className='err'>{errorMessage}</div>
            <Loading enabled={isFetchingSemesters} />
        </>
    );
}

type SemesterFormProps = {
    onSubmit: (semesterId: string, semesterCode?: string) => void;
};
export function SemesterForm({ onSubmit }: SemesterFormProps) {
    const [errSemester, setErrSemester] = React.useState<string>('');
    const [semesterId, setSemesterId] = React.useState<string>();
    const [semesterCode, setSemesterCode] = React.useState<string>('');

    const submit = () => {
        if (!semesterId) {
            setErrSemester('Vui lòng chọn học kì');
            return;
        }

        setErrSemester('');
        onSubmit(semesterId, semesterCode);
    };

    return (
        <>
            <SemesterSelector
                onChangeSemester={setSemesterId}
                errorMessage={errSemester}
            />
            <input
                className='inputSemesterCode'
                placeholder={'Mã học kỳ'}
                onChange={({ currentTarget: { value } }) =>
                    setSemesterCode(() => value)
                }
            />
            <Button
                className={'buttonMain'}
                primary
                content='Lấy lịch học'
                onClick={submit}
            />
        </>
    );
}
