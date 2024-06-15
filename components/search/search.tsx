'use client';

import { Bookmark } from '@/lib/types';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './search.module.scss';

export function Search({ bookmarks, setBookmarks }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showClear, setShowClear] = useState(false);
    const [clearBtnText, setClearBtnText] = useState('');

    function handleClearSearch() {
        setBookmarks(bookmarks);

        if (!inputRef.current) {
            return;
        }

        inputRef.current.value = '';
    }

    function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
        setShowClear(event.target.value ? true : false);
    }

    const handleOnInput = useDebounce(
        (event: ChangeEvent<HTMLInputElement>) => {
            const query = event.target.value.toLowerCase();

            if (!query) {
                setBookmarks(bookmarks);
            }

            const filteredBookmarks = bookmarks.filter((bookmark: Bookmark) => {
                const { title, description } = bookmark;

                if (title?.toLowerCase().includes(query)) {
                    return bookmark;
                }

                if (description?.toLowerCase().includes(query)) {
                    return bookmark;
                }
            });

            setBookmarks(filteredBookmarks);
        },
        // https://stackoverflow.com/a/44755058
        100
    );

    useEffect(() => {
        const currentFont = localStorage.getItem('font-family');

        setClearBtnText(currentFont === '8-Bit' ? 'x' : '&times;');
    }, []);

    return (
        <div className={styles['search-row']}>
            <div className={styles['search-ctr']}>
                <input
                    ref={inputRef}
                    className={styles.search}
                    onInput={handleOnInput}
                    onChange={handleOnChange}
                    placeholder="search"
                />
                <button
                    className={classNames({
                        [styles.active]: showClear,
                        [styles.small]: clearBtnText === 'x',
                    })}
                    onClick={handleClearSearch}
                    data-btn-clear
                    dangerouslySetInnerHTML={{ __html: clearBtnText }}
                />
            </div>
        </div>
    );
}
