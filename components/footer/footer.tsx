import { LinkCtr } from '@/components/link-ctr';
import styles from './footer.module.scss';

type Link = {
    label: string;
    path: string;
    newTab?: boolean;
};

type Props = {
    links?: Link[];
    text?: string;
};

export function Footer({ links = [], text }: Props) {
    const copyright = `Copyright (C) ${new Date().getFullYear()} Stephen Matheis`;

    return (
        <footer className={styles.footer}>
            {links?.length !== 0 && (
                <nav>
                    <ol>
                        {links?.map(({ label, path, newTab }) => {
                            return (
                                <li key={path}>
                                    <LinkCtr href={path} newTab={newTab}>
                                        {label}
                                    </LinkCtr>
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            )}
            {text && <div className={styles.text}>{text}</div>}
            <div className={styles.copyright}>{copyright}</div>
        </footer>
    );
}
