import { writeFile } from 'fs/promises';
import urls from '../data/urls.json';

const sorted = urls.map((item, index) => {
    return {
        id: index,
        ...item,
    };
});

writeFile(`./data/urls-with-ids.json`, JSON.stringify(sorted));
