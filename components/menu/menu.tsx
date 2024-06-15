'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './menu.module.scss';

export type MenuButton = {
    label: string;
    action: () => void;
};

type Props = {
    buttons: MenuButton[];
};

export function Menu({ buttons }: Props): JSX.Element {
    const menu = useRef<HTMLDivElement>(null!);
    const [showMenu, setShowMenu] = useState(false);

    function close() {
        menu.current.classList.add(styles.close);

        setTimeout(() => {
            setShowMenu(false);
        }, 150);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menu.current && !menu.current.contains(event.target as Node)) {
                close();
            }
        }

        window.addEventListener('mousedown', handleClickOutside);

        return () =>
            window.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles['menu-ctr']}>
            <button
                className={styles.btn}
                onClick={() => {
                    if (showMenu) {
                        close();
                    } else {
                        setShowMenu(true);
                    }
                }}
            >
                ···
            </button>
            {showMenu && (
                <div ref={menu} className={styles.menu}>
                    {buttons.map(({ label, action }) => {
                        return (
                            <button
                                key={label}
                                className={styles.btn}
                                onClick={(event): void => {
                                    action();
                                    setTimeout(() => {
                                        close();
                                    }, 150);
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
