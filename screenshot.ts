import fs from 'fs';
import { chromium, devices } from 'playwright';
import csvParser from 'csv-parser';
import path from 'path';

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

async function screenshotUrl(
    context: any,
    url: string,
    filename: string,
    retries = MAX_RETRIES
): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const page = await context.newPage();

        try {
            await page.goto(url, { timeout: 30_000 });
            await page.screenshot({ path: filename });

            console.log(`✅ Saved: ${filename}`);

            await page.close();

            return true;
        } catch (err) {
            console.warn(`⚠️ (${attempt}/${retries}) Failed: ${url}`);

            await page.close();
        }
    }
    console.error(`❌ Gave up: ${url}`);
    return false;
}

async function takeScreenshots(urls: string[]) {
    const browser = await chromium.launch();
    const context = await browser.newContext(
        IS_MOBILE
            ? { ...devices['iPhone 13 Pro'], isMobile: true }
            : { viewport: { width: 1920, height: 1080 } }
    );

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const suffix = IS_MOBILE ? 'mobile' : 'desktop';
        const filename = path.join(OUTPUT_DIR, `${i}-${suffix}.png`);

        await screenshotUrl(context, url, filename);
    }

    await browser.close();

    console.log('✅ Done.');
}

const urls = await readUrls(INPUT_CSV);

await takeScreenshots(urls);
