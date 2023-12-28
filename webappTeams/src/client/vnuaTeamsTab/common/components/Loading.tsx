import * as React from 'react';

export function Loading({ enabled }) {
    if (!enabled) {
        return null;
    }

    return (
        <div className={'loadingAll'}>
            <div className='loader'></div>
        </div>
    );
}
