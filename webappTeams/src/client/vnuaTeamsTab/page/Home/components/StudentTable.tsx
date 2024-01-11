import { Button, Dialog, ListIcon } from '@fluentui/react-northstar';
import * as React from 'react';
import { TeachingClass } from '../../../types/teaching-class';

type StudentListTableProps = {
    teachingClass: TeachingClass;
};

export function StudentListTable({ teachingClass }: StudentListTableProps) {
    return (
        <Dialog
            confirmButton='Đóng'
            content={{
                content: (
                    <div className='dialogStudents'>
                        <table className='tableStudents'>
                            <tr>
                                <th className='txt-center'>STT</th>
                                <th className='txt-center'>MSV</th>
                                <th className='txt-center'>Họ và tên</th>
                            </tr>
                            {teachingClass.students.value.length > 0 && (
                                <>
                                    {teachingClass.students.value.map(
                                        (student, indexStudent) => (
                                            <tr key={indexStudent}>
                                                <td className='txt-center'>
                                                    {indexStudent + 1}
                                                </td>
                                                <td className='txt-center'>
                                                    {student.id}
                                                </td>
                                                <td className='pd-50'>
                                                    {student.name}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </>
                            )}
                        </table>
                    </div>
                ),
                styles: {
                    // keep only 1 scrollbar while zooming
                    height: '100%',
                    maxHeight: '250px',
                    overflow: 'auto',
                },
            }}
            header={
                'Danh sách sinh viên lớp ' +
                teachingClass.subjectName +
                ' nhóm ' +
                teachingClass.subjectGroup
            }
            trigger={
                <Button
                    icon={<ListIcon />}
                    text
                    primary
                    content='Danh sách sinh viên'
                />
            }
        />
    );
}
