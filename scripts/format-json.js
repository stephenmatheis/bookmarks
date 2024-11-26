import { writeFile } from 'fs/promises';
import urls from '../tabs.json' with { type: 'json' };

const items = urls.map(({ title, url, timestamp }, index) => {
    return {
        id: index + 1,
        title,
        url,
        timestamp: Math.trunc(timestamp)
    }
});

await writeFile('tabs.json', JSON.stringify(items));
