import type { Metadata } from 'next';
import type { Viewport } from 'next';
import '@/styles/app.scss';

export const metadata: Metadata = {
    title: {
        template: 'Bookmarks | %s',
        default: 'Bookmarks',
    },
    description: 'Bookmarks',
    icons: {
        shortcut: '/favicon.ico',
        icon: '/favicons/icon.png',
        apple: '/favicons/apple-icon.png',
    },
    manifest: '/manifest.json',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
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
