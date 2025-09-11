import fs from 'fs';
import { access } from 'fs/promises';
import { chromium } from 'playwright';
import path from 'path';
import chalk from 'chalk';
import urls from '../data/formatted.urls';

console.log(`\nTaking ${urls.length} screenshots...\n`);

const browser = await chromium.launch();
const context = await browser.newContext();
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = path.join('./logs', `${timestamp}.log`);
const logStream = fs.createWriteStream(logPath, { flags: 'a' });

let screenshot: Buffer | null;
let shouldShutdown = false;

console.log = tee(console.log);
console.warn = tee(console.warn);
console.error = tee(console.error);

function tee(streamFn: (...args: any[]) => void) {
    return (...args: any[]) => {
        const message = `${args.join(' ')}\n`;

        logStream.write(message);

        streamFn(...args);
    };
}

function gracefulShutdown(reason = '') {
    console.log(`\nShutting down${reason ? ` due to ${reason}` : ''}...`);

    Promise.resolve()
        .then(() => {
            if (!screenshot) {
                browser ? browser.close() : undefined;
            }
        })
        .then(() => {
            if (browser) console.log('Browser closed.');
        })
        .finally(() => {
            if (!screenshot) {
                console.log('Shutdown complete.');
                process.exit(0);
            } else {
                shouldShutdown = true;
            }
        });
}

process.on('SIGINT', () => gracefulShutdown());
process.on('SIGTERM', () => gracefulShutdown());

for (let i = 0; i < urls.length; i++) {
    const { url } = urls[i];
    const filename = path.join('./screenshots', `${i}-fullpage.png`);
    const exists = await checkFileExistsAsync(filename);

    if (exists) {
        console.log(`[${i}]\t${chalk.cyan('Exists')}\t\t${url}`);

        continue;
    }

    const page = await context.newPage();

    try {
        await page.goto(url, { timeout: 30000 });
        screenshot = await page.screenshot({ path: filename, fullPage: true });

        console.log(`[${i}]\t${chalk.green('Succeeded')}\t${url}`);
    } catch (err) {
        console.log(`[${i}]\t${chalk.red('Failed')}\t\t${url}`);
    } finally {
        screenshot = null;

        if (shouldShutdown) {
            gracefulShutdown();

            break;
        }

        await page.close().catch(() => {});
    }
}

async function checkFileExistsAsync(filePath: string) {
    try {
        await access(filePath);

        return true;
    } catch (error) {
        return false;
    }
}

browser?.close().catch(() => {});

console.log(`\nDone.\n`);

process.exit(0);
