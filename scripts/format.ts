import { writeFile } from 'fs/promises';
import CloudTabs from '../data/CloudTabs';

writeFile(
    `cloud-tabs.formatted.urls.json`,
    JSON.stringify(
        CloudTabs.map((item) => {
            return {
                title: item.title,
                url: item.url,
                timestamp:
                    item.last_viewed_time == '-1' ? new Date() : new Date(parseInt('1' + item.last_viewed_time) * 1000),
            };
        })
    )
);
