import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { createWriteStream } from 'fs';
import { chromium } from 'playwright';
import csvParser from 'csv-parser';

// config
const MAX_CONCURRENT_BROWSERS = 8;
const INPUT_CSV = './urls.csv';
const LOGS_DIR = './logs';
const SCREENSHOTS_DIR = './public/screenshots';
const NEW_LOG_FILE = `./logs/${new Date().toISOString()}.csv`;

// new log
const logStream = createWriteStream(NEW_LOG_FILE, { flags: 'a' });

logStream.write(`index,url,status,notes\n`);

function getLastLogFile() {
    if (!fs.existsSync(LOGS_DIR)) return null;

    const files = fs.readdirSync(LOGS_DIR)
        .filter(file => file.endsWith('.csv'))
        .map(file => path.join(LOGS_DIR, file))
        .sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime);

    return files.length > 0 ? files[0] : null;
}

function getLastProcessedIndexFromLog(logFile) {
    const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

    if (lines.length < 2) return null;

    const lastLine = lines[lines.length - 1];
    const [index] = lastLine.split(',');

    return parseInt(index, 10);
}

function getLastProcessedIndexFromScreenshots() {
    if (!fs.existsSync(SCREENSHOTS_DIR)) return null;

    const files = fs.readdirSync(SCREENSHOTS_DIR)
        .filter(file => file.endsWith('-desktop.png'))
        .map(file => parseInt(file.split('-')[0], 10))
        .filter(Number.isFinite);

    return files.length > 0 ? Math.max(...files) : null;
}

function getStartIndex() {
    const lastLogFile = getLastLogFile();

    if (lastLogFile) {
        console.log(`Found log file: ${lastLogFile}`);

        const indexFromLog = getLastProcessedIndexFromLog(lastLogFile);

        if (indexFromLog !== null) return indexFromLog + 1;
    }

    const indexFromScreenshots = getLastProcessedIndexFromScreenshots();

    if (indexFromScreenshots !== null) {
        console.log(`Found last screenshot at index ${indexFromScreenshots}`);

        return indexFromScreenshots + 1;
    }

    return 0;
}

// Function to read URLs from CSV
async function readUrlsFromCsv(filePath) {
    return new Promise((resolve, reject) => {
        const urls = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                const url = row.url || Object.values(row)[0]; // Fallback for no header
                if (url) urls.push(url);
            })
            .on('end', () => resolve(urls))
            .on('error', (error) => reject(error));
    });
}

// Function to write logs
function writeLog(index, url, status, notes = '') {
    const logEntry = `${index},${url},${status},"${notes.replace(/"/g, '""')}"\n`;
    logStream.write(logEntry);
    console.log(`${status === 'success' ? '✔' : '✖'} Logged: ${logEntry.trim()}`);
}

// Function to process a single URL
async function processUrl(browser, url, index) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(url, { timeout: 30000 });
        await page.screenshot({ path: `${SCREENSHOTS_DIR}/${index}-desktop.png` });
        writeLog(index, url, 'success', 'desktop');
    } catch (error) {
        writeLog(index, url, 'fail', error.message);
    } finally {
        await context.close();
    }
}

// Function to process URLs in batches
async function processBatch(batch, batchIndex, startIndex) {
    const browser = await chromium.launch();
    await Promise.all(
        batch.map((url, index) => {
            const absoluteIndex = batchIndex * MAX_CONCURRENT_BROWSERS + index + startIndex;
            return processUrl(browser, url, absoluteIndex);
        })
    );
    await browser.close();
}

// Main execution
(async () => {
    const urls = await readUrlsFromCsv(INPUT_CSV);
    const startIndex = getStartIndex();

    console.log(`Resuming from index ${startIndex}`);
    const remainingUrls = urls.slice(startIndex);

    const batches = Array.from(
        { length: Math.ceil(remainingUrls.length / MAX_CONCURRENT_BROWSERS) },
        (_, i) => remainingUrls.slice(i * MAX_CONCURRENT_BROWSERS, (i + 1) * MAX_CONCURRENT_BROWSERS)
    );

    for (const [batchIndex, batch] of batches.entries()) {
        console.log(`Processing batch ${batchIndex + 1} of ${batches.length}`);
        await processBatch(batch, batchIndex, startIndex);
    }

    console.log('All batches processed.');
    logStream.end();

    notify('The script has completed successfully!');
})();

function notify(message) {
    const platform = process.platform;

    if (platform === 'darwin') {
        exec(`osascript -e 'display notification "${message}" with title "Bookmarks"'`);
    } else if (platform === 'linux') {
        exec(`notify-send "Playwright Screenshots" "${message}"`);
    } else if (platform.startsWith('win')) {
        console.log('Windows support needs a notification tool!');
    }
}