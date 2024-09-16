import { Button } from '@fluentui/react-northstar';
import * as React from 'react';

export function Header({ user, onClickChangeTeacherCode }) {
    return (
        <div className='header'>
            <div className='logoWrap'>
                <img src='../assets/logo.png' alt='' className='logoVnua' />
                <div className='titlePage'>HỌC VIỆN NÔNG NGHIỆP VIỆT NAM</div>
            </div>
            <div className={'profileInf'}>
                <div className={'inf'}>
                    <p>
                        {user.displayName} - {user.teacherId}
                    </p>
                    <p>{user.mail}</p>
                    <Button
                        className={'buttonMain'}
                        primary
                        content='Cập nhật mã giảng viên'
                        onClick={onClickChangeTeacherCode}
                    />
                </div>
            </div>
        </div>
    );
}
