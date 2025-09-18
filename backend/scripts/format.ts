import { writeFile } from 'fs/promises';
import { csvFormat } from 'd3-dsv';
import urls from '@/data/urls';

writeFile(
    `./data/bookmarks.csv`,
    csvFormat(
        urls.map((item, index) => {
            return {
                title: item.title,
                url: item.url,
                timestamp: new Date(),
                screenshot: `${index}-fullscreen.png`,
            };
        })
    )
);
