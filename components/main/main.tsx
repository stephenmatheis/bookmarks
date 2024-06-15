import { ReactNode } from 'react';
import styles from './main.module.scss';

type Props = {
    children?: ReactNode;
};

// TODO: Add Header and Footer links to list of page prompts
export function Main({ children }: Props) {
    return (
        <main className={styles.main}>
            <div className={styles.right}>{children}</div>
        </main>
    );
}
