import { writeFile } from 'fs/promises';
import cloudTabs from '@/data/cloud-tabs';

writeFile(
    `./data/cloud-tabs.urls.json`,
    JSON.stringify(
        cloudTabs.map((item) => {
            return {
                title: item.title,
                url: item.url,
                timestamp: new Date(),
            };
        })
    )
);
