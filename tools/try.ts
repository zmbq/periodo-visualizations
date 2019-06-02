import * as fs from 'fs';
import { PeriodProcessor } from '../src/logic/periods';
import { PlaceProcessor } from '../src/logic/places';

class Args {
    public readonly fullDataPath: string;
    public readonly periodDataPath: string;
    public readonly csvName: string;
    public readonly placesDataPath: string;
    public readonly mapsCsvName: string;

    constructor() {
        if (process.argv.length !== 7) {
            throw new Error('Expected exactly 4 arguments - full-data-file places-data-file period-data-file csv-file-name map-csv-filename');
        }

        this.fullDataPath = process.argv[2];
        this.placesDataPath = process.argv[3];
        this.periodDataPath = process.argv[4];
        this.csvName = process.argv[5];
        this.mapsCsvName = process.argv[6];
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
const creator = new PeriodProcessor(full);

console.log(`Loading places data from ${args.placesDataPath}`);
const places = readFile(args.placesDataPath);
const placeProcessor = new PlaceProcessor(places);

console.log(`Loading period data from ${args.periodDataPath}`);
const periods = readFile(args.periodDataPath);

console.log(`Writing CSV to ${args.csvName}`);
let fd = fs.openSync(args.csvName, 'w');
fs.writeSync(fd, creator.getCsv(periods));
fs.closeSync(fd);

console.log(`Writing maps CSV to ${args.mapsCsvName}`);
creator.enhancePeriods(periods);
fd = fs.openSync(args.mapsCsvName, 'w');
fs.writeSync(fd, placeProcessor.getCsv(creator.iteratePeriods(periods)));
fs.closeSync(fd);

console.log('Done');