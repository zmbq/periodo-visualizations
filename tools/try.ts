import { report } from '../src/csv/create-csv';

const full = require('./data/full.json');
const authority = require('./data/authority.json');
const bag = require('./data/bag.json');

console.log('try is here');
console.log(bag);
report();