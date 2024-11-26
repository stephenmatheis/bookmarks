import puppeteer from 'puppeteer';
import { createWriteStream } from 'fs';
import log from '../utils/log.js';
import urls from '../urls.json' with { type: 'json' };

const fileName = `./logs/${new Date().toISOString()}.log`;
const stream = createWriteStream(fileName, { flags: 'a' });

let browser = await puppeteer.launch({ headless: 'new' });

for (let [_, bookmark] of urls.entries()) {
    const { id, url } = bookmark;

    try {
        let page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.setViewport({ width: 1920, height: 1080 });
        await page.screenshot({ path: `./public/screenshots/${id}-1920x1080.png` });

        writeLog('success', `id: ${id} created 1920x1080 (desktop) screenshot`);
    } catch (error) {
        writeLog('failed', `id: ${id} failed to take a 1920x1080 screenshot`);

        continue;
    }

    try {
        let page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.setViewport({ width: 390, height: 844 });
        await page.screenshot({ path: `./public/screenshots/${id}-390x844.png` });

        writeLog('success', `id: ${id} created 390x844 (mobile) screenshot`);
    } catch (error) {
        writeLog('failed', `id: ${id} failed to take a 390x844 screenshot`);

        continue;
    }
}

await browser.close();

stream.end();

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