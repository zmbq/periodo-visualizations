import * as fs from 'fs';
import { report } from '../src/csv/create-csv';

class Args {
    public readonly dataPath: string;
    constructor() {
        if (process.argv.length !== 3) {
            throw new Error('Expected exactly 1 arguments - data path');
        }

        this.dataPath = process.argv[2];
    }
}

function readFile(dataPath, filename) {
    const file = dataPath + '/' + filename;
    const buffer = fs.readFileSync(file);
    const raw = buffer.toString();
    const obj = JSON.parse(raw);

    return obj;
}

const args = new Args();

const full = readFile(args.dataPath, 'full.json');
const authority = readFile(args.dataPath, 'authority.json');
const bag = readFile(args.dataPath, 'bag.json');

console.log('try is here');
console.log(bag);