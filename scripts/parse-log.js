import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

const LOGS_DIR = './logs';

function getLastLogFile() {
    if (!fs.existsSync(LOGS_DIR)) return null;

    const files = fs
        .readdirSync(LOGS_DIR)
        .filter((file) => file.endsWith('.csv'))
        .map((file) => path.join(LOGS_DIR, file))
        .sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime);

    return files.length > 0 ? files[0] : null;
}

function parseLogFile(logFile) {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content
        .split('\n')
        .filter((line) => {
            const id = parseInt(line.split(',')[0]);

            if (!isNaN(id)) {
                return line;
            }
        })
        .map((line) => {
            const [id, url, status] = line.split(',');

            return {
                id: parseInt(id),
                url,
                status,
            };
        })
        .sort((a, b) => a.id - b.id);

    return lines;
}

const lastLogFile = getLastLogFile();
const parsed = parseLogFile(lastLogFile);
const content = JSON.stringify(parsed, null, 4);

await writeFile('log.json', content, 'utf8');
