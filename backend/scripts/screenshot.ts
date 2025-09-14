import { access } from 'fs/promises';
import { chromium } from 'playwright';
import path from 'path';
import chalk from 'chalk';
import urls from '@/data/urls';

console.log(`\nTaking ${urls.length} screenshots...\n`);

const browser = await chromium.launch();
const context = await browser.newContext();

for (let i = 5675; i < urls.length; i++) {
    const { url } = urls[i];
    const filename = path.join('./screenshots', `${i}-fullpage.png`);
    const exists = await checkFileExistsAsync(filename);

    if (exists) {
        console.log(`${i},${chalk.cyan('Exists')},${url}`);

        continue;
    }

    const page = await context.newPage();

    try {
        console.log(`${i},${chalk.gray('trying')},${url}`);

        // await page.goto(url, { timeout: 5000 });
        await page.goto(url);
        await page.screenshot({ path: filename, fullPage: true });

        console.log(`${i},${chalk.green('Succeeded')},${url}`);
    } catch (err) {
        console.log(`${i},${chalk.red('Failed')},${url}`);
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
