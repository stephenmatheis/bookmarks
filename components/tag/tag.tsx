'use client';

import styles from './tag.module.scss';

type Props = {
    tag: string;
    selected?: string[];
    spacer?: boolean;
    newTab?: boolean;
};

export function Tag({ selected = [], tag, spacer, newTab }: Props) {
    return (
        <span
            key={tag}
            className={[
                styles.tag,
                ...(selected.includes(tag) ? [styles.selected] : []),
            ].join(' ')}
            onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();

                let queryParams: string[];

                if (selected.includes(tag)) {
                    queryParams = selected.filter((t) => t !== tag);
                } else {
                    queryParams = [...new Set([...selected, tag])];
                }

                const href = `${
                    queryParams.length ? `?tags=${queryParams.join(',')}` : ''
                }`;

                if (newTab) {
                    window.open(href);
                } else {
                    location.href = href;
                }
            }}
        >
            <span className={styles.name}>{tag}</span>
            {spacer && <span className={styles.spacer}>,</span>}
        </span>
    );
}
