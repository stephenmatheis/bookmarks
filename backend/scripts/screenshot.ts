import { access, mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { chromium, devices, Page } from 'playwright';
import path from 'path';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import urls from '@/data/urls-with-ids.json';

const logStream = createWriteStream(
    `screenshot-${new Date().toISOString().replaceAll(':', '').replaceAll('.', '_')}.log`
);

log(`\nTaking ${urls.length} screenshots...\n`);

await mkdir('./screenshots', { recursive: true });

const browser = await chromium.launch();
const deviceTypes = [
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
    { name: 'Mobile', ...devices['iPhone 15 Pro Max'] },
    { name: 'Desktop-Fullscreen', viewport: { width: 1920, height: 1080 }, fullPage: true },
    { name: 'Mobile-Fullscreen', ...devices['iPhone 15 Pro Max'], fullPage: true },
];

for (const deviceType of deviceTypes) {
    const context = await browser.newContext({ viewport: deviceType.viewport });

    for (let i = 744; i < urls.length; i++) {
        const { url, skip } = urls[i];

        if (skip) {
            log(`${i},${chalk.yellow('Skip')},${chalk.cyan(deviceType.name)},${url}`);

            continue;
        }

        const filename = path.join('./screenshots', `${i}-${deviceType.name}.png`);

        const exists = await checkFileExistsAsync(filename);

        if (exists) {
            log(`${i},${chalk.cyan('Exists')},${chalk.cyan(deviceType.name)},${url}`);

            continue;
        }

        const page = await context.newPage();

        try {
            await page.goto(url, { timeout: 10000 });
            await page.screenshot({ path: filename, fullPage: deviceType.fullPage });

            log(`${i},${chalk.green('Succeeded')},${chalk.cyan(deviceType.name)},${url}`);
        } catch (err) {
            console.log(err);

            log(`${i},${chalk.red('Failed')},${chalk.cyan(deviceType.name)},${url}`);
        } finally {
            console.log('page closed');
            await page.close();
        }
    }

    await context.close();
}

async function checkFileExistsAsync(filePath: string) {
    try {
        await access(filePath);

        return true;
    } catch (error) {
        return false;
    }
}

function log(msg: string) {
    console.log(msg);
    logStream.write(stripAnsi(msg.trim() + '\n'));
}

await browser.close();

log(`\nDone.\n`);

logStream.end();

process.exit(0);
