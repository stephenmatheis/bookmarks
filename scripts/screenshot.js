import puppeteer from 'puppeteer';
import { createWriteStream } from 'fs';
import { stat } from 'fs/promises';
import log from '../utils/log.js';

// TODO: Add GUID or some kind of unique ID to entries
import bookmarks from '../bookmarks.js';

// Log File
const fileName = `./logs/log-${new Date().toISOString()}.txt`;
const stream = createWriteStream(fileName, { flags: 'a' });

// Launch the browser and open a new blank page
let browser = await puppeteer.launch({ headless: 'new' });
let page = await browser.newPage();

for (let [index, bookmark] of bookmarks.entries()) {
    const doesExist = await fileExists(`./public/bookmarks/${index}.png`);

    if (doesExist) {
        writeLog('info', `#${index}: Screenshot exists '${bookmark.URL}'`);

        continue;
    }

    try {
        // Navigate the page to a URL
        await page.goto(bookmark.URL, { waitUntil: 'networkidle2' });
    } catch (error) {
        writeLog('fail', `#${index}: Failed '${bookmark.URL}' > ${error}`);

        continue;
    }

    // Set screen size
    await page.setViewport({ width: 1920, height: 1080 });

    // Screenshot
    await page.screenshot({ path: `./public/bookmarks/${index}.png` });

    writeLog('success', `#${index}: Created screenshot '${bookmark.URL}'`);
}

await browser.close();

stream.end();

async function fileExists(path) {
    return !!(await stat(path).catch((e) => false));
}

function writeLog(label, text) {
    console.log(getLabel(label), text);
    stream.write(`${getLogLabel(label)}${text}\n`);
}

function getLabel(label) {
    switch (label) {
        case 'info':
            return log.info();
        case 'success':
            return log.success();
        case 'fail':
            return log.fail();
        default:
            return '';
    }
}

function getLogLabel(label) {
    switch (label) {
        case 'info':
            return 'INFO    ';
        case 'success':
            return 'SUCCESS ';
        case 'fail':
            return 'FAIL    ';
        default:
            return '';
    }
}
