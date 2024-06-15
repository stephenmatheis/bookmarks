import Link from 'next/link';
import styles from './header.module.scss';

export function Header({ printOnly = false }) {
    return (
        <>
            <header
                className={[
                    styles.header,
                    ...(printOnly ? [styles['print-only']] : []),
                ].join(' ')}
                data-header
            >
                <Link href="/" aria-label="Stephen Matheis' personal website">
                    <span className={styles.text} data-link-text-ctr>
                        <span
                            className={[styles.name, styles.part].join(' ')}
                            data-link-text
                        >
                            Stephen Matheis
                        </span>{' '}
                        <br data-header-break />
                        <span
                            className={[styles.title, styles.part].join(' ')}
                            data-link-text
                        >
                            Front-end Software Engineer
                        </span>
                    </span>
                </Link>
            </header>
        </>
    );
}
