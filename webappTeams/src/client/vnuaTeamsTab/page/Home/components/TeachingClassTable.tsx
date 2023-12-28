import {
    Button,
    TeamCreateIcon,
    DownloadIcon,
} from '@fluentui/react-northstar';
import { TeachingClass } from '../../../types/teaching-class';
import * as React from 'react';
import { StudentListTable } from './StudentTable';

type TeachingClassTableProps = {
    teachingClasses: TeachingClass[];
    onCreateClasses: () => void;
    onDownloadClasses: (teachingClasses: TeachingClass[]) => void;
    onUpdateClassHasOnineMeeting: (
        classIndex: number,
        hasOnlineMeeting: boolean
    ) => void;
    hasCreatedClasses: boolean;
};
export function TeachingClassTable({
    teachingClasses,
    onCreateClasses,
    onDownloadClasses,
    onUpdateClassHasOnineMeeting,
    hasCreatedClasses,
}: TeachingClassTableProps) {
    if (teachingClasses.length === 0) {
        return (
            <div className={'nodataWrap'}>
                <img src='../assets/nodata.png' alt='' className='logoVnua' />
                <div className={'nodataText'}>
                    Vui lòng chọn học kì và nhập mã học kì chính xác để tìm kiếm
                    lịch
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='tableMain'>
                <table cellSpacing={0}>
                    <tr>
                        <th>STT</th>
                        <th>Tên nhóm lớp</th>
                        <th>Tên môn học</th>
                        <th>Tên lớp</th>
                        <th>Nhóm</th>

                        <th
                            style={{
                                width: 'auto',
                            }}
                        >
                            Tạo lịch online
                        </th>
                        <th></th>
                        {hasCreatedClasses && <th>Trạng thái</th>}
                    </tr>
                    {teachingClasses?.map((thisClass: TeachingClass, index) => (
                        <tr key={index + 1}>
                            <td>{index + 1}</td>
                            <td className='txt-center '>
                                <div className='flex'>
                                    <input
                                        value={thisClass.displayName}
                                        onChange={(e) => {
                                            teachingClasses[index].displayName =
                                                e.target.value;
                                        }}
                                        className={'inputClass'}
                                    />
                                    <img
                                        src='../assets/pencial.svg'
                                        alt=''
                                        className='iconPencial'
                                    />
                                </div>
                            </td>
                            <td>{thisClass.subjectName}</td>
                            <td className='txt-center'>
                                {thisClass.classCodes}
                            </td>

                            <td className='txt-center'>
                                {thisClass.subjectGroup}
                            </td>

                            <td
                                style={{
                                    textAlign: 'center',
                                }}
                            >
                                <input
                                    style={{
                                        width: 'auto',
                                    }}
                                    type='checkbox'
                                    onClick={(e) => {
                                        onUpdateClassHasOnineMeeting(
                                            index,
                                            // @ts-ignore
                                            e.target.checked
                                        );
                                    }}
                                />
                            </td>
                            <td>
                                <StudentListTable teachingClass={thisClass} />
                            </td>
                            {hasCreatedClasses && (
                                <td>
                                    {thisClass.createStatus.type ===
                                        'success' && (
                                        <span className={'textDone'}>
                                            Thành công
                                        </span>
                                    )}
                                    {thisClass.createStatus.type ===
                                        'error' && (
                                        <span className={'textError'}>
                                            {thisClass.createStatus.message}
                                        </span>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </table>
            </div>
            <div className='buttonWrap'>
                <Button
                    style={{ marginRight: '10px' }}
                    className={'buttonMain'}
                    icon={<DownloadIcon />}
                    onClick={() => onDownloadClasses(teachingClasses)}
                    content='Tải thời khoá biểu dạng JSON'
                    primary
                />
                <Button
                    className={'buttonMain'}
                    icon={<TeamCreateIcon />}
                    onClick={onCreateClasses}
                    content='Tạo nhóm lớp và lịch học online'
                    primary
                />
            </div>
        </>
    );
}
