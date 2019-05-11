import * as fs from 'fs';
import { CsvCreator } from '../src/csv/create-csv';
import { createBrotliDecompress } from 'zlib';

class Args {
    public readonly fullDataPath: string;
    public readonly periodDataPath: string;
    public readonly csvName: string;

    constructor() {
        if (process.argv.length !== 5) {
            throw new Error('Expected exactly 3 arguments - full-data-file period-data-file csv-file-name');
        }

        this.fullDataPath = process.argv[2];
        this.periodDataPath = process.argv[3];
        this.csvName = process.argv[4];
    }
}

function readFile(path) {
    const buffer = fs.readFileSync(path);
    const raw = buffer.toString();
    const obj = JSON.parse(raw);

    return obj;
}

const args = new Args();

console.log(`Loading full data from ${args.fullDataPath}`);
const full = readFile(args.fullDataPath);
const creator = new CsvCreator(full);

console.log(`Loading period data from ${args.periodDataPath}`);
const periods = readFile(args.periodDataPath);

console.log(`Writing CSV to ${args.csvName}`);

const fd = fs.openSync(args.csvName, 'w');
fs.writeSync(fd, Buffer.from(creator.csvHeader + '\n'))
for(const row of creator.generateCsvRows(periods)) {
    fs.writeSync(fd, Buffer.from(row + '\n'));
}
fs.closeSync(fd);

console.log('Done');