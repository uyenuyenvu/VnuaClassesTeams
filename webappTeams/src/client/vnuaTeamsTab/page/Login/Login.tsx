import { Button, Input } from '@fluentui/react-northstar';
import * as React from 'react';

type LoginProps = {
    onLogin: (teacherCode: string) => void;
};
export function Login({ onLogin }: LoginProps) {
    const [teacherCode, setTeacherCode] = React.useState('');
    const [errTeacherCode, setErrTeacherCode] = React.useState('');
    
    const onTypeTeacherCode = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const typedTeachingCode = e.currentTarget.value;
        if (e.key === 'Enter') {
            login();
        } else {
            setTeacherCode(typedTeachingCode);
        }
    };

    const login = () => {
        if (teacherCode.length === 0) {
            setErrTeacherCode('Vui lòng nhập mã giảng viên');
            return;
        }

        setErrTeacherCode('');
        onLogin(teacherCode);
    };

    return (
        <div className="mainWrap">
            <div className='loginLayout'>
                <img src='../assets/bg.jpg' alt='' className='background' />
                <div className='registerWrap'>
                    <div className='loginContainer'>
                        <img
                            src='../assets/logo.png'
                            alt=''
                            className='logoLogin'
                        />
                        <div className='itemField'>
                            <div className='inputField'>
                                <Input
                                    placeholder={'Mã giảng viên'}
                                    onKeyPress={(e) => onTypeTeacherCode(e)}
                                    onChange={(e) => {
                                        setErrTeacherCode('');
                                        setTeacherCode(
                                            e.currentTarget.nodeValue as string
                                        );
                                    }}
                                />
                                {errTeacherCode?.length > 0 && (
                                    <div className={'err'}>{errTeacherCode}</div>
                                )}
                            </div>
                        </div>
                        <div className='buttonLoginWrap'>
                            <Button
                                primary
                                className={'active'}
                                content='Cập nhật mã giảng viên'
                                onClick={login}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
