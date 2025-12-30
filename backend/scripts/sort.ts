import { writeFile } from 'fs/promises';
import urls from '../data/urls.json';

const sorted = urls.map((item) => {
    return {
        ...item,
        date: new Date(!item.date.includes('/') ? parseInt(item.date) * 1000 : item.date).toISOString(),
    };
});

writeFile(`./data/urls-iso-date.json`, JSON.stringify(sorted));
