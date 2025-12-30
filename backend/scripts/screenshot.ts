import { access, mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { chromium, devices } from 'playwright';
import path from 'path';
import chalk from 'chalk';
import urls from '@/data/urls.json';

const logStream = createWriteStream('screenshot.log');

log(`\nTaking ${urls.length} screenshots...\n`);

await mkdir('./screenshots', { recursive: true });

const browser = await chromium.launch();
const deviceTypes = [
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
    { name: 'Mobile', ...devices['iPhone 15 Pro Max'] },
];

for (const deviceType of deviceTypes) {
    const context = await browser.newContext({
        viewport: deviceType.viewport,
    });
    const page = await context.newPage();

    for (let i = 0; i < 1; i++) {
        const { url } = urls[i];
        const filename = path.join('./screenshots', `${i}-${deviceType.name}.png`);
        const exists = await checkFileExistsAsync(filename);

        if (exists) {
            log(`${i},${chalk.cyan('Exists')},${url}`);

            continue;
        }

        try {
            log(`${i},${chalk.gray('trying')},${url}`);

            await page.goto(url);
            await page.screenshot({ path: filename, fullPage: true });

            log(`${i},${chalk.green('Succeeded')},${url}`);
        } catch (err) {
            log(`${i},${chalk.red('Failed')},${url}`);
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
    const line = msg + '\n';

    console.log(line);
    logStream.write(line);
}

await browser.close();

log(`\nDone.\n`);

logStream.end();

process.exit(0);
