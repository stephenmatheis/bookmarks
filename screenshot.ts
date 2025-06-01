import fs from 'fs';
import { Browser, chromium, devices } from 'playwright';
import csvParser from 'csv-parser';
import path from 'path';
import chalk from 'chalk';

type ScreenshotResult = {
    index: number;
    url: string;
    success: boolean;
};

const MAX_CONCURRENT = 10;
const INPUT_CSV = './urls.csv';
const LOG_DIR = './logs';
const OUTPUT_DIR = './screenshots';
const MAX_RETRIES = 3;
const IS_MOBILE = false;

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = path.join(LOG_DIR, `${timestamp}.log`);
const logStream = fs.createWriteStream(logPath, { flags: 'a' });

let shouldExit = false;
let browser: Browser | null = null;

function gracefulShutdown(reason = '') {
    console.log(`\nShutting down${reason ? ` due to ${reason}` : ''}...`);
    shouldExit = true;

    Promise.resolve()
        .then(() => (browser ? browser.close() : undefined))
        .then(() => {
            if (browser) console.log('Browser closed.');

            return new Promise((res) =>
                logStream.end(() => {
                    console.log('Log file closed.');

                    res(null);
                })
            );
        })
        .finally(() => process.exit(0));
}

process.on('SIGINT', () => gracefulShutdown());
process.on('SIGTERM', () => gracefulShutdown());
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);

    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);

    gracefulShutdown('unhandledRejection');
});

function tee(streamFn: (...args: any[]) => void, label: string) {
    return (...args: any[]) => {
        const message = `[${label}] ${args.join(' ')}\n`;

        logStream.write(message);

        streamFn(...args);
    };
}

console.log = tee(console.log, 'LOG');
console.warn = tee(console.warn, 'WARN');
console.error = tee(console.error, 'ERROR');

async function readUrls(file: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const urls: string[] = [];

        fs.createReadStream(file)
            .pipe(csvParser())
            .on('data', (row) => {
                const url = row.url || Object.values(row)[0];

                if (url) urls.push(url);
            })
            .on('end', () => resolve(urls))
            .on('error', reject);
    });
}

async function screenshotUrl(context: any, url: string, filename: string, retries = MAX_RETRIES): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const page = await context.newPage();

        try {
            await page.goto(url, { timeout: 30000 });
            await page.screenshot({ path: filename });

            console.log(`${chalk.greenBright('✔️')} Saved: ${url}`);

            return true;
        } catch (err) {
            console.warn(`${chalk.yellowBright(`Reattempting (${attempt}/${retries}):`)} ${url}`);
        } finally {
            await page.close().catch(() => {});
        }
    }

    console.error(`${chalk.redBright('❌')} Failed: ${url}`);

    return false;
}

function getResumeIndex(): number {
    const suffix = IS_MOBILE ? 'mobile' : 'desktop';

    const files = fs.readdirSync(OUTPUT_DIR);
    const matching = files
        .filter((f) => f.endsWith(`${suffix}.png`))
        .map((f) => parseInt(f.split('-')[0], 10))
        .filter((n) => !isNaN(n));

    if (matching.length === 0) return 0;

    const maxIndex = Math.max(...matching);

    console.log(chalk.blueBright(`Resuming from index: ${maxIndex + 1}`));

    return maxIndex + 1;
}

async function takeScreenshots(urls: string[]) {
    console.log(chalk.blueBright(`Taking screenshots of ${urls.length} URLs...\n`));

    browser = await chromium.launch();

    const context = await browser.newContext(
        IS_MOBILE ? { ...devices['iPhone 13 Pro'], isMobile: true } : { viewport: { width: 1920, height: 1080 } }
    );
    const startIndex = getResumeIndex();
    const suffix = IS_MOBILE ? 'mobile' : 'desktop';
    const totalStart = Date.now();
    const batchUrls = urls.map((url, index) => ({ url, index })).slice(startIndex);
    const allResults: PromiseSettledResult<ScreenshotResult>[] = [];

    for (let i = 0; i < batchUrls.length; i += MAX_CONCURRENT) {
        if (shouldExit) break;

        const batchStart = Date.now();
        const batch = batchUrls.slice(i, i + MAX_CONCURRENT);
        const batchIndex = Math.floor(i / MAX_CONCURRENT) + 1;

        console.log(`Batch ${batchIndex} (${i} - ${Math.min(i + MAX_CONCURRENT - 1, batchUrls.length - 1)})`);

        const tasks = batch.map(async ({ url, index }): Promise<ScreenshotResult> => {
            const filename = path.join(OUTPUT_DIR, `${index}-${suffix}.png`);
            const success = await screenshotUrl(context, url, filename);

            return { index, url, success };
        });

        const results = await Promise.allSettled(tasks);
        allResults.push(...results);

        const total = results.length;
        const passed = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
        const failed = total - passed;

        console.log(`\nSaved: ${chalk.greenBright(`${passed}/${MAX_CONCURRENT}`)}`);

        if (failed > 0) {
            console.warn(`Failed: ${chalk.redBright(`${failed}/${MAX_CONCURRENT}`)}`);
        }

        const batchEnd = Date.now();
        const batchSeconds = ((batchEnd - batchStart) / 1000).toFixed(2);

        console.log(chalk.cyanBright(`Time: ${batchSeconds}s\n`));
    }

    if (browser) {
        await browser.close();

        browser = null;
    }

    const totalEnd = Date.now();
    const totalSeconds = ((totalEnd - totalStart) / 1000).toFixed(2);
    const successful = allResults.filter(
        (result): result is PromiseFulfilledResult<ScreenshotResult> =>
            result.status === 'fulfilled' && result.value.success
    );
    const failed = allResults.length - successful.length;

    console.log(`Total saved: ${chalk.greenBright(`${successful.length}`)}`);

    if (failed > 0) {
        console.log(`Total failed: ${chalk.redBright(`${failed}`)}`);
    }

    console.log(`\n${chalk.greenBright(`Done.`)} ${chalk.blueBright(`Time: ${totalSeconds}s`)}\n`);
}

const urls = await readUrls(INPUT_CSV);

await takeScreenshots(urls);
