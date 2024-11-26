import fs from 'fs';
import { createWriteStream } from 'fs';
import { chromium } from 'playwright';
import csvParser from 'csv-parser';

// Configurations
const MAX_CONCURRENT_BROWSERS = 8; // Adjust as needed
const INPUT_CSV = './urls.csv'; // Path to the input CSV
const OUTPUT_LOG = `./logs/${new Date().toISOString()}.csv`;

// Create write stream for logging
const stream = createWriteStream(OUTPUT_LOG, { flags: 'a' });
stream.write(`index,url,status,notes\n`);

console.log(`\nReading URLs from ${INPUT_CSV}...\n`);

// Function to read URLs from CSV
async function readUrlsFromCsv(filePath) {
    return new Promise((resolve, reject) => {
        const urls = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                const url = row.url || Object.values(row)[0];

                if (url) urls.push(url);
            })
            .on('end', () => resolve(urls))
            .on('error', (error) => reject(error));
    });
}

// Function to process a single URL
async function processUrl(browser, url, index) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(url, { timeout: 30000 });
        await page.screenshot({ path: `./public/screenshots/${index}-desktop.png` });

        writeLog('success', `${index},${url},success,desktop`);
    } catch (error) {
        writeLog('fail', `${index},${url},failed,"${csvify(error.message)}"`);
    } finally {
        await context.close();
    }
}

// Function to process URLs in batches
async function processBatch(batch, batchIndex) {
    const browser = await chromium.launch();

    await Promise.all(
        batch.map((url, index) => processUrl(browser, url, batchIndex * MAX_CONCURRENT_BROWSERS + index))
    );

    await browser.close();
}

// Main execution
(async () => {
    const urls = await readUrlsFromCsv(INPUT_CSV);
    console.log(`Processing ${urls.length} URLs with ${MAX_CONCURRENT_BROWSERS} workers.`);

    const batches = Array.from(
        { length: Math.ceil(urls.length / MAX_CONCURRENT_BROWSERS) },
        (_, i) => urls.slice(i * MAX_CONCURRENT_BROWSERS, (i + 1) * MAX_CONCURRENT_BROWSERS)
    );

    for (const [batchIndex, batch] of batches.entries()) {
        console.log(`Processing batch ${batchIndex + 1} of ${batches.length} (${batch.length} URLs)...`);
        await processBatch(batch, batchIndex);
    }

    console.log('All batches processed.');
    stream.end();
})();

// Helper functions
function writeLog(label, text, msg) {
    console.log(getLabel(label), text, (msg || ''));
    stream.write(`${text}\n`);
}

function getLabel(label) {
    switch (label) {
        case 'info': return info();
        case 'success': return success();
        case 'fail': return fail();
        default: return '';
    }
}

function csvify(text) {
    return text ? text.replace(/"/g, '""') : '';
}

function success() {
    return `\x1b[32m✔\x1b[0m`;
}

function fail() {
    return `\x1b[31m✖\x1b[0m`;
}

function info() {
    return `\x1b[36mℹ\x1b[0m`;
}
