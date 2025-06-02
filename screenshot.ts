import fs from 'fs';
import { Browser, BrowserContext, chromium, devices } from 'playwright';
import csvParser from 'csv-parser';
import path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';
import { readdir } from 'fs/promises';

// Types
type ScreenshotResult = {
    index: number;
    url: string;
    success: boolean;
};

// Constants
const MAX_CONCURRENT = 10;
const INPUT_CSV = './urls.csv';
const LOG_DIR = './logs';
const OUTPUT_DIR = './screenshots';
const MAX_RETRIES = 3;
const IS_MOBILE = false;

// Logs
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = path.join(LOG_DIR, `${timestamp}.log`);
const logStream = fs.createWriteStream(logPath, { flags: 'a' });

// State
let shouldExit = false;
let shuttingDown = false;
let browser: Browser | null = null;

// Bail if dirs don't exist
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Shutdown
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);

    void shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);

    void shutdown('unhandledRejection');
});

// Tee console output to both log file and console
console.log = tee(console.log, 'LOG');
console.warn = tee(console.warn, 'WARN');
console.error = tee(console.error, 'ERROR');

function tee(streamFn: (...args: any[]) => void, label: string) {
    return (...args: any[]) => {
        const message = `[${label}] ${args.join(' ')}\n`;

        logStream.write(message);

        streamFn(...args);
    };
}

// Start
void main();

async function main() {
    try {
        const urls = await readUrls(INPUT_CSV);

        if (urls.length === 0) {
            console.warn(chalk.yellowBright('No URLs found in CSV.'));
            process.exit(0);
        }

        await takeScreenshots(urls);
    } catch (error) {
        console.error(chalk.redBright('Fatal error:'), error);

        await shutdown('fatal');
    }
}

// Async Functions

async function readUrls(file: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const urls: string[] = [];

        fs.createReadStream(file)
            .pipe(csvParser())
            .on('data', (row) => {
                const url = row.url || Object.values(row)[0];

                if (isValidUrl(url)) urls.push(url);
            })
            .on('end', () => resolve(urls))
            .on('error', reject);
    });
}

async function takeScreenshots(urls: string[]) {
    console.log(boxen(`Taking ${chalk.blueBright(urls.length)} screenshots`, { padding: 1 }));

    browser = await chromium.launch();

    const context = await browser.newContext(
        IS_MOBILE ? { ...devices['iPhone 13 Pro'], isMobile: true } : { viewport: { width: 1920, height: 1080 } }
    );
    const startIndex = await getResumeIndex();
    const suffix = IS_MOBILE ? 'mobile' : 'desktop';
    const totalStart = Date.now();
    const batchUrls = urls.map((url, index) => ({ url, index })).slice(startIndex);
    const allResults: PromiseSettledResult<ScreenshotResult>[] = [];

    console.log('');

    for (let i = 0; i < batchUrls.length; i += MAX_CONCURRENT) {
        if (shouldExit || shuttingDown) break;

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

        console.log(`\n${chalk.bold('Saved')}: ${chalk.greenBright(`${passed}/${MAX_CONCURRENT}`)}`);

        if (failed > 0) {
            console.warn(`Failed: ${chalk.redBright(`${failed}/${MAX_CONCURRENT}`)}`);
        }

        const batchEnd = Date.now();
        const batchSeconds = ((batchEnd - batchStart) / 1000).toFixed(2);

        console.log(`${chalk.bold('Time')}: ${batchSeconds}s\n`);
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

    browser?.close().catch(() => {});

    process.exit(0);
}

async function screenshotUrl(
    context: BrowserContext,
    url: string,
    filename: string,
    retries = MAX_RETRIES
): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        if (shouldExit || shuttingDown) break;

        const page = await context.newPage();

        try {
            await page.goto(url, { timeout: 30000 });
            await page.screenshot({ path: filename });

            console.log(`${chalk.greenBright('✓')} ${url}`);

            return true;
        } catch (err) {
            console.warn(`${chalk.yellowBright(`Reattempting (${attempt}/${retries}):`)} ${url}`);
        } finally {
            await page.close().catch(() => {});
        }
    }

    console.error(`${chalk.redBright('✗')} ${url}`);

    return false;
}

async function shutdown(reason = '') {
    if (shuttingDown || shouldExit) return;

    shuttingDown = true;
    shouldExit = true;

    console.log(chalk.yellowBright(`\nShutting down${reason ? ` due to ${reason}` : ''}...`));

    await browser?.close();

    console.log(chalk.blueBright('Browser closed.'));

    await new Promise<void>((res) =>
        logStream.end(() => {
            console.log(chalk.blueBright('Log file closed.'));
            res();
        })
    );

    console.log(chalk.greenBright('Shutdown.\n'));

    process.exit(0);
}

// Helpers
function isValidUrl(input: string) {
    return input?.startsWith('http://') || input?.startsWith('https://');
}

async function getResumeIndex(): Promise<number> {
    const suffix = IS_MOBILE ? 'mobile' : 'desktop';

    const files = await readdir(OUTPUT_DIR);
    const matching = files
        .filter((f) => f.endsWith(`${suffix}.png`))
        .map((f) => parseInt(f.split('-')[0], 10))
        .filter((n) => !isNaN(n));

    if (matching.length === 0) return 0;

    const maxIndex = Math.max(...matching);

    console.log(chalk.blueBright(`Resuming from index: ${maxIndex + 1}`));

    return maxIndex + 1;
}
