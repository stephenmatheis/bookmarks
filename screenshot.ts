import fs from 'fs';
import { chromium } from 'playwright';
import csvParser from 'csv-parser';
import path from 'path';

const INPUT_CSV = './urls.csv';
const OUTPUT_DIR = './screenshots';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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

async function takeScreenshots(urls: string[]) {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const filename = path.join(OUTPUT_DIR, `${i}-desktop.png`);
        const page = await context.newPage();

        try {
            console.log(`📸 (${i}) ${url}`);

            await page.goto(url, { timeout: 30000 });
            await page.screenshot({ path: filename });
        } catch (err) {
            console.error(`❌ (${i}) Failed to screenshot: ${url}`);
        } finally {
            await page.close(); // 🧹 Clean up
        }
    }

    await browser.close();

    console.log('✅ Done!');
}

const urls = await readUrls(INPUT_CSV);

await takeScreenshots(urls);
