import { LinkCtr } from '@/components/link-ctr';

export default function NotFound() {
    return (
        <div
            style={{
                height: '100dvh',
                width: '100vw',
                display: 'grid',
                placeItems: 'center',
            }}
        >
            <div style={{ display: 'grid', placeItems: 'center', gap: 36 }}>
                <h1 style={{ textAlign: 'center', margin: 0 }}>
                    404 - Page not found
                </h1>
                <LinkCtr href="/">Go back to Home</LinkCtr>
            </div>
        </div>
    );
}
