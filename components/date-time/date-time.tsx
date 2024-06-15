import styles from './date-time.module.scss';

type Props = {
    dateString: string;
    className?: string;
};

export function DateTime({ dateString, className = '' }: Props) {
    if (!dateString) return null;

    // @see https://github.com/vercel/next.js/discussions/39425#discussioncomment-3367041
    return (
        <time
            className={[styles['date-time'], className].join(' ')}
            dateTime={dateString}
            suppressHydrationWarning
        >
            {dateString}
        </time>
    );
}
