import { readdir } from 'fs/promises';

const files = await readdir('./screenshots');
const ids = files.map((file) => parseInt(file.split('-')[0])).sort((a, b) => a - b);
const missing: number[] = [];

for (let i = 0; i <= 5676; i++) {
    if (ids.includes(i)) continue;
    missing.push(i);
}

console.log(missing);
