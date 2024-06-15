import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import styles from './page.module.scss';

export function Page({
    children,
    noFooter = false,
    noHeader = false,
    ...props
}) {
    const { links, text } = props;

    return (
        <div className={styles.page} data-page>
            {!noHeader && <Header />}
            {children}

            {!noFooter && <Footer links={links} text={text} />}
        </div>
    );
}
