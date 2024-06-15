import styles from './comment.module.scss';

export function Comment({ text, ...props }) {
    const content = `// ${text}`;

    return (
        <div className={styles['comment']} {...props}>
            <span>{content}</span>
        </div>
    );
}
