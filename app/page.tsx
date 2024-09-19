import type { Metadata } from 'next';
import { Page } from '@/components/page';
import { Main } from '@/components/main';

export const metadata: Metadata = {
    title: 'Bookmarks',
    description: 'Bookmarks',
};

export default async function RootPage() {
    return (
        <Page links={[]}>
            <Main></Main>
        </Page>
    );
}
