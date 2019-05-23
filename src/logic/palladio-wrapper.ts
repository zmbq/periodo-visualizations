/*
 * This file contains the wrapper of Palladio.
 * The Palladio Bricks are not yet ready for simple usage. A lot of tinkering needs to be applied
 * to. We hope to place everything here.
 * 
 * Note: Palladio can't be imported properly as a module. The Palladio team is working on it, but until then,
 * Palladio needs to be loaded with <script> tags from the HTML page. For this to work, we've directed Webpack to copy
 * the three Palladio packages we use - palladio, palladtio-map-component and palladio-timestamp-component - to
 * the assets/ directory. We also need to add the following to index.html:
 * 
 *
    <script src="assets/palladio/palladio.js"></script>
    <script src="assets/palladio-timespan-component/dist/palladio-timespan-component.min.js"></script>
    <script src="assets/palladio-map-component/dist/palladio-map-component.min.js"></script>

 * This is a ugly hack, but it's all that is available to us right now.
 *
 * The Palladio CSS files also need to be referenced from index.html, as they have some errors preventing them
 * from being imported by Webpack.
 * 
 * Palladio expects data to be in the "Palladio Save Format", which is a JSON object of an undocumented nature.
 * We cheat a little here, by using Palladio Web to generate the JSON template. We then just add the data array.
 */

import { CsvCreator, EnhancedPeriod } from './create-csv';

declare const startPalladio: any;

export class PalladioWrapper {
    private _components: any;

    public constructor() {
        this._components = startPalladio(['palladioMapComponent', 'palladioTimespanComponent',]);
    }

    // Adds a Palladio component to the page
    public addComponent(type, cssSelector, options?) {
        return this._components.add(type, cssSelector, options);
    }

    // Prepares a CSV, returning a JSON can be loaded into Palladio
    public preparePalladioData(periods: EnhancedPeriod[]): any {
        const data = {...csvSaveTemplate} // Copy our template
        const header = CsvCreator.csvHeader.split(',');

        data.files[0].data = periods.map((period) => {
           // The data property of a file is an object mapping from column title to column value
            const obj: any = {};
            for(let i=0; i < period.csv.rowAsArray.length; i++) {
                obj[header[i]] = period.csv.rowAsArray[i];
            }

            return obj;
        });

        return data;
    }

    // Loads the data into Palladio
    public loadData(data: any) {
        this._components.loadJson(data);
    }

    public get components() {
        return this._components;
    }
}

const csvSaveTemplate = {
    "version": "1.2.9",
    "files": [
        {
            "loadFromURL": false,
            "label": "Untitled",
            "id": 0,
            "autoFields": [],
            "fields": [
                {
                    "key": "author",
                    "description": "author",
                    "cardinality": 2,
                    "type": "text",
                    "blanks": 0,
                    "uniques": [],
                    "uniqueKey": true,
                    "special": [
                        ","
                    ],
                    "unassignedSpecialChars": [
                        ","
                    ],
                    "countBy": true,
                    "errors": [],
                    "$$hashKey": "object:116"
                },
                {
                    "key": "publication year",
                    "description": "publication year",
                    "cardinality": 2,
                    "type": "date",
                    "blanks": 0,
                    "uniques": [],
                    "uniqueKey": true,
                    "special": [],
                    "unassignedSpecialChars": [],
                    "countBy": false,
                    "errors": [],
                    "descriptiveField": "author",
                    "$$hashKey": "object:117"
                },
                {
                    "key": "label",
                    "description": "label",
                    "cardinality": 1,
                    "type": "text",
                    "blanks": 0,
                    "uniques": [],
                    "uniqueKey": false,
                    "special": [],
                    "unassignedSpecialChars": [],
                    "countBy": false,
                    "errors": [],
                    "descriptiveField": "author",
                    "$$hashKey": "object:118"
                },
                {
                    "key": "spatial URIs",
                    "description": "spatial URIs",
                    "cardinality": 2,
                    "type": "url",
                    "blanks": 0,
                    "uniques": [],
                    "uniqueKey": true,
                    "special": [
                        ":",
                        "/",
                        "_"
                    ],
                    "unassignedSpecialChars": [],
                    "countBy": false,
                    "errors": [],
                    "descriptiveField": "author",
                    "$$hashKey": "object:119"
                },
                {
                    "key": "earliest start",
                    "description": "earliest start",
                    "cardinality": 1,
                    "type": "number",
                    "blanks": 0,
                    "uniques": [],
                    "uniqueKey": false,
                    "special": [
                        "-"
                    ],
                    "unassignedSpecialChars": [
                        "-"
                    ],
                    "countBy": false,
                    "errors": [],
                    "descriptiveField": "author",
                    "$$hashKey": "object:120"
                },
                {
                    "key": "latest stop",
                    "description": "latest stop",
                    "cardinality": 2,
                    "type": "number",
                    "blanks": 0,
                    "uniques": [],
                    "uniqueKey": true,
                    "special": [
                        "-"
                    ],
                    "unassignedSpecialChars": [
                        "-"
                    ],
                    "countBy": false,
                    "errors": [],
                    "descriptiveField": "author",
                    "$$hashKey": "object:121"
                },
                {
                    "key": "URI",
                    "description": "URI",
                    "cardinality": 2,
                    "type": "url",
                    "blanks": 0,
                    "uniques": [],
                    "uniqueKey": true,
                    "special": [
                        ":",
                        "/"
                    ],
                    "unassignedSpecialChars": [],
                    "countBy": false,
                    "errors": [],
                    "descriptiveField": "author",
                    "$$hashKey": "object:122"
                },
                {
                    "key": "derived URIs",
                    "description": "derived URIs",
                    "cardinality": 0,
                    "type": "null",
                    "blanks": 2,
                    "uniques": [],
                    "uniqueKey": false,
                    "special": [],
                    "unassignedSpecialChars": [],
                    "countBy": false,
                    "errors": [],
                    "descriptiveField": "author",
                    "$$hashKey": "object:123"
                }
            ],
            "data": [
                {
                    "author": "Ruiz, Arturo.",
                    "publication year": "1998",
                    "label": "Iron Age",
                    "spatial URIs": "http://dbpedia.org/resource/Spain",
                    "earliest start": "-799",
                    "latest stop": "-549",
                    "URI": "http://n2t.net/ark:/99152/p03377fkhrv"
                },
                {
                    "author": "Salway, Peter.",
                    "publication year": "1993",
                    "label": "Iron Age",
                    "spatial URIs": "http://dbpedia.org/resource/United_Kingdom",
                    "earliest start": "-799",
                    "latest stop": "43",
                    "URI": "http://n2t.net/ark:/99152/p0d39r7d5km"
                }
            ],
            "uniqueId": 0,
            "$$hashKey": "object:110"
        }
    ],
    "links": [],
    "layout": "geo",
    "metadata": {
        "title": null,
        "author": null,
        "date": null,
        "description": null
    },
    "vis": []
}