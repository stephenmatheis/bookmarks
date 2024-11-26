import puppeteer from 'puppeteer';
import { createWriteStream } from 'fs';
import { stat } from 'fs/promises';
import log from '../utils/log.js';
import urls from '../urls.json' with { type: 'json' };

const fileName = `./logs/${new Date().toISOString()}.log`;
const stream = createWriteStream(fileName, { flags: 'a' });

let browser = await puppeteer.launch({ headless: 'new' });
let page = await browser.newPage();

for (let [_, bookmark] of urls.entries()) {
    const { id, url } = bookmark;

    // const doesExist = await fileExists(`./public/screenshots/${id}.png`);

    // if (doesExist) {
    //     writeLog('info', `#${id} screenshot exists '${url}'`);

    //     continue;
    // }

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
    } catch (error) {
        writeLog('failed', `id: ${id} failed to take a screenshot for '${url}'`);

        continue;
    }

    await page.setViewport({ width: 1920, height: 1080 });
    await page.screenshot({ path: `./public/screenshots/${id}.png` });

    writeLog('success', `id: ${id} created 1920x1080 (desktop) screenshot for '${url}'`);
}

await browser.close();

stream.end();

async function fileExists(path) {
    return !!(await stat(path).catch((e) => false));
}

function writeLog(label, text) {
    console.log(getLabel(label), text);
    stream.write(`${label}\t${text}\n`);
}

function getLabel(label) {
    switch (label) {
        case 'info':
            return log.info();
        case 'success':
            return log.success();
        case 'failed':
            return log.fail();
        default:
            return '';
    }
}