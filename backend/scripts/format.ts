import { readFile, writeFile } from 'fs/promises';
import { csvParse } from 'd3-dsv';

const urls = await readFile('./data/urls.csv', { encoding: 'utf-8' });
const json = csvParse(urls);

console.log(json);

writeFile(`./data/urls.json`, JSON.stringify(json));
