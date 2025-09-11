import { access } from 'fs/promises';
import { chromium } from 'playwright';
import path from 'path';
import chalk from 'chalk';
import urls from '../data/formatted.urls';

console.log(`\nTaking ${urls.length} screenshots...\n`);

const browser = await chromium.launch();
// const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const context = await browser.newContext();

for (let i = 0; i < urls.length; i++) {
    const { url } = urls[i];
    // const filename = path.join('./screenshots', `${i}-1920x1080.png`);
    const filename = path.join('./screenshots', `${i}-fullpage.png`);
    const exists = await checkFileExistsAsync(filename);

    if (exists) {
        console.log(`[${i}]\t${chalk.cyan('Exists')}\t\t${url}`);

        continue;
    }

    const page = await context.newPage();

    try {
        await page.goto(url, { timeout: 30000 });
        await page.screenshot({ path: filename, fullPage: true });

        console.log(`[${i}]\t${chalk.green('Succeeded')}\t${url}`);
    } catch (err) {
        console.log(`[${i}]\t${chalk.red('Failed')}\t\t${url}`);
    } finally {
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
