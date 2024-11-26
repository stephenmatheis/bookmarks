import { createWriteStream } from 'fs';
import { chromium } from 'playwright';
import urls from './urls.json' with { type: 'json' };

// Log colors
const colors = {
    // Reset
    Reset: '\x1b[0m',

    // Terminal
    Bright: '\x1b[1m',
    Dim: '\x1b[2m',
    Underscore: '\x1b[4m',
    Blink: '\x1b[5m',
    Reverse: '\x1b[7m',
    Hidden: '\x1b[8m',

    // Foreground
    FgBlack: '\x1b[30m',
    FgRed: '\x1b[31m',
    FgGreen: '\x1b[32m',
    FgYellow: '\x1b[33m',
    FgBlue: '\x1b[34m',
    FgMagenta: '\x1b[35m',
    FgCyan: '\x1b[36m',
    FgWhite: '\x1b[37m',
    FgGray: '\x1b[90m',

    // Background
    BgBlack: '\x1b[40m',
    BgRed: '\x1b[41m',
    BgGreen: '\x1b[42m',
    BgYellow: '\x1b[43m',
    BgBlue: '\x1b[44m',
    BgMagenta: '\x1b[45m',
    BgCyan: '\x1b[46m',
    BgWhite: '\x1b[47m',
    BgGray: '\x1b[100m',
};
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const fileName = `./logs/${new Date().toISOString()}.csv`;
const stream = createWriteStream(fileName, { flags: 'a' });

stream.write(`index,url,status,notes\n`);

console.log(`\nURLS: ${urls.length}\n\n`)

for (let [_, item] of urls.entries()) {
    const { id, url } = item;

    try {
        // Desktop
        await page.setViewportSize({
            width: 1920,
            height: 1080,
        });
        await page.goto(url);
        await page.screenshot({ path: `./public/screenshots/${id}-desktop.png` });

        writeLog('success', `${id},${url},success,desktop`);
    } catch (error) {
        writeLog('fail', `${id},${url},failed,"${csvify(error.message)}"`);
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
            return info();
        case 'success':
            return success();
        case 'fail':
            return fail();
        default:
            return '';
    }
}

function csvify(text) {
    return text ? text.replaceAll('[2m', '').replaceAll('[22m', '').replaceAll('"', '""') : '';
}

function success() {
    return `${colors.FgGreen}✔${colors.Reset}`;
}

function fail() {
    return `${colors.FgRed}✖${colors.Reset}`;
}

function info() {
    return `${colors.FgCyan}ℹ${colors.Reset}`;
}