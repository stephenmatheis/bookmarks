import type { Metadata } from 'next';
import '@/styles/app.scss';

export const metadata: Metadata = {
    title: {
        template: 'Bookmarks | %s',
        default: 'Bookmarks',
    },
    description: 'Bookmarks',
    viewport: 'width=device-width, initial-scale=1,  viewport-fit=cover',
    icons: {
        shortcut: '/favicon.ico',
        icon: '/favicons/icon.png',
        apple: '/favicons/apple-icon.png',
    },
    manifest: '/manifest.json',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
