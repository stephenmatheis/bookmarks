import { createWriteStream } from 'fs';
import { chromium } from 'playwright';
import log from '../utils/log.js';
import urls from '../urls.json' with { type: 'json' };

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

// Log File
const fileName = `./logs/log-${new Date().toISOString()}.txt`;
const stream = createWriteStream(fileName, { flags: 'a' });

stream.write(`Index,URL,Title,Status,Notes\n`);

console.log(`\nURLS: ${urls.length}\n\n`)

for (let [index, item] of urls.entries()) {
    const { URL, Title } = item;
    const formattedTitle = csvify(Title);

    try {
        await page.goto(URL);
        await page.screenshot({ path: `screenshots/${index}.png` });

        writeLog('success', `${index},${URL},"${formattedTitle}",Success,""`);
    } catch (error) {
        writeLog('fail', `${index},${URL},"${formattedTitle}",Failed,"${csvify(error.message)}"`);
    }
}

await context.close();
await browser.close();

function writeLog(label, text, msg) {
    console.log(getLabel(label), text, (msg || ''));
    stream.write(`${text}\n`);
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

function csvify(text) {
    return text ? text.replaceAll('[2m', '').replaceAll('[22m', '').replaceAll('"', '""') : '';
}

