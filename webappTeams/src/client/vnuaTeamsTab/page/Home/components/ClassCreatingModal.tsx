import * as React from 'react';

export function ClassCreatingLoadingModal({ successCount, errorCount, totalCount }) {
    return (
        <div className={'loadWrap'}>
            <div className={'loadContainer'}>
                <img src='../assets/wait.png' alt='' className='wait' />
                <div className={'pending'}>
                    <div className={'run'}></div>
                </div>
                <div className={'txtLoad'}>
                    Quá trình tạo nhóm lớp có thể kéo dài trung bình 1 phút /
                    lớp
                    <br /> Vui lòng không thao tác trong quá trình chờ hệ thống
                    tạo.
                </div>
                <div className={'progressWrap'}>
                    <p className={'numberProgress'}>
                        {successCount + errorCount}/{totalCount}
                    </p>
                    <div className={'progress'}>
                        <div
                            className={'done'}
                            style={{
                                width: `${
                                    ((successCount + errorCount) / totalCount) * 100
                                }%`,
                            }}
                        ></div>
                    </div>
                    <div className={'progressTxt'}>
                        <div className={'item'}>
                            <img
                                src='../assets/iconDone.png'
                                alt=''
                                className='icon'
                            />
                            {successCount}/{totalCount}
                        </div>
                        <div className={'item'}>
                            <img
                                src='../assets/iconError.png'
                                alt=''
                                className='icon'
                            />
                            {errorCount}/{totalCount}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
