'use client';

import { useState } from 'react';
import screenshots from '@/db/screenshots';

export default function RootPage() {
    const [page, setPage] = useState(1);
    const limit = 10;

    return (
        <div>
            <h1>Bookmarks</h1>
            <div>
                {screenshots.slice(0 * page, 10).map(({ id, url, status }) => {
                    return (
                        <div key={id}>
                            <div>ID: {id}</div>
                            <div>URL: {url}</div>
                            <div>STATUS: {status}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
