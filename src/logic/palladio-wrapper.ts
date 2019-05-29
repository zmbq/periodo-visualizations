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
import { PeriodLocationProperties, PlaceProcessor } from './places';

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

    // Loads the data into Palladio
    public loadData(data: any) {
        this._components.loadJson(data);
    }

    public get components() {
        return this._components;
    }
}

export class TimespanConverter {
	public static convertToPalladio(periods: EnhancedPeriod[]) : any {
        const data = {...TimespanConverter.csvSaveTemplate} // Copy our template
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
	
	private static readonly csvSaveTemplate: any = {
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
						"cardinality": 47,
						"type": "text",
						"blanks": 21,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							",",
							"-",
							":"
						],
						"unassignedSpecialChars": [
							",",
							"-",
							":"
						],
						"countBy": false,
						"errors": [],
						"descriptiveField": "URI",
						"$$hashKey": "object:116"
					},
					{
						"key": "publication year",
						"description": "publication year",
						"cardinality": 29,
						"type": "date",
						"blanks": 40,
						"uniques": [],
						"uniqueKey": false,
						"special": [],
						"unassignedSpecialChars": [],
						"countBy": false,
						"errors": [],
						"descriptiveField": "URI",
						"$$hashKey": "object:117"
					},
					{
						"key": "label",
						"description": "label",
						"cardinality": 1554,
						"type": "text",
						"blanks": 0,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							"-",
							"/",
							":",
							",",
							"?",
							";"
						],
						"unassignedSpecialChars": [
							"-",
							"/",
							":",
							",",
							"?",
							";"
						],
						"countBy": false,
						"errors": [],
						"descriptiveField": "URI",
						"$$hashKey": "object:118"
					},
					{
						"key": "spatial URIs",
						"description": "spatial URIs",
						"cardinality": 97,
						"type": "url",
						"blanks": 284,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							":",
							",",
							"/",
							"_"
						],
						"unassignedSpecialChars": [
							","
						],
						"countBy": false,
						"errors": [],
						"descriptiveField": "URI",
						"$$hashKey": "object:119"
					},
					{
						"key": "earliest start",
						"description": "earliest start",
						"cardinality": 634,
						"type": "date",
						"blanks": 9,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							"-"
						],
						"unassignedSpecialChars": [],
						"countBy": false,
						"errors": [],
						"descriptiveField": "URI",
						"$$hashKey": "object:120"
					},
					{
						"key": "latest stop",
						"description": "latest stop",
						"cardinality": 726,
						"type": "date",
						"blanks": 4,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							"-"
						],
						"unassignedSpecialChars": [],
						"countBy": false,
						"errors": [],
						"descriptiveField": "URI",
						"$$hashKey": "object:121"
					},
					{
						"key": "URI",
						"description": "URI",
						"cardinality": 2126,
						"type": "url",
						"blanks": 0,
						"uniques": [],
						"uniqueKey": true,
						"special": [
							":",
							"/"
						],
						"unassignedSpecialChars": [],
						"countBy": true,
						"errors": [],
						"$$hashKey": "object:122",
						"countable": true,
						"countDescription": "Untitled"
					},
					{
						"key": "derived URIs",
						"description": "derived URIs",
						"cardinality": 319,
						"type": "url",
						"blanks": 1786,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							":",
							"/"
						],
						"unassignedSpecialChars": [],
						"countBy": false,
						"errors": [],
						"descriptiveField": "URI",
						"$$hashKey": "object:123"
					}
				],
				data: [],
				"uniqueId": 0,
				"$$hashKey": "object:110"
			}
		],
		"links": [],
		"layout": "graph",
		"metadata": {
			"title": null,
			"author": null,
			"date": null,
			"description": null
		},
		"vis": [
			{
				"type": "palladioFilters",
				"importJson": {
					"facets": [],
					"timelines": [],
					"partimes": [
						{
							"title": "Time Span Filter",
							"dateStartDim": "earliest start",
							"dateEndDim": "latest stop",
							"tooltipLabelDim": "label",
							"topExtent": [
								"-9999-01-01",
								"-9999-01-01"
							],
							"midExtent": [
								"-9999-01-01",
								"-9999-01-01"
							],
							"bottomExtent": [
								"-9999-01-01",
								"-9999-01-01"
							],
							"mode": "Bars"
						}
					],
					"timesteps": []
				}
			},
			{
				"type": "graphView",
				"importJson": {
					"showLinks": true,
					"showLabels": true,
					"aggregateKey": null,
					"aggregationType": "COUNT",
					"nodeSize": false,
					"highlightSource": false,
					"highlightTarget": false,
					"aggDimKey": "URI",
					"sourceDimension": null,
					"targetDimension": null,
					"fixedNodes": false
				}
			},
			{
				"type": "mapView",
				"importJson": {
					"tileSets": [
						{
							"url": null,
							"mbId": "cesta.hd9ak6ie",
							"enabled": true,
							"description": "Land"
						}
					],
					"layers": []
				}
			},
			{
				"type": "tableView",
				"importJson": {
					"tableDimensions": [],
					"countDim": null,
					"maxDisplay": 1000
				}
			},
			{
				"type": "listView",
				"importJson": {
					"titleDim": "URI"
				}
			}
		]
	}
}

export class MapConverter {
	public static convertToPalladio(places: PeriodLocationProperties[]): any {
		const data = {...MapConverter.csvSaveTemplate} // Copy our template
        const header = PlaceProcessor.csvHeader.split(',');

        data.files[0].data = places.map((place) => {
           // The data property of a file is an object mapping from column title to column value
			const obj: any = {};
			if (!place.rowAsArray) {
				console.error('No rowAsArray in place ', place);
			}
            for(let i=0; i < place.rowAsArray.length; i++) {
                obj[header[i]] = place.rowAsArray[i];
            }

            return obj;
        });

        return data;
	}

	private static readonly csvSaveTemplate: any = {
		"version": "1.2.9",
		"files": [
			{
				"loadFromURL": false,
				"label": "Untitled",
				"id": 0,
				"autoFields": [],
				"fields": [
					{
						"key": "period URI",
						"description": "period URI",
						"cardinality": 4957,
						"type": "url",
						"blanks": 0,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							":",
							"/"
						],
						"unassignedSpecialChars": [],
						"countBy": false,
						"errors": [],
						"descriptiveField": "generated",
						"$$hashKey": "object:116"
					},
					{
						"key": "label",
						"description": "label",
						"cardinality": 4006,
						"type": "text",
						"blanks": 0,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							"-",
							"/",
							":",
							",",
							"?",
							";"
						],
						"unassignedSpecialChars": [
							"-",
							"/",
							":",
							",",
							"?",
							";"
						],
						"countBy": false,
						"errors": [],
						"descriptiveField": "generated",
						"$$hashKey": "object:117"
					},
					{
						"key": "earliest start",
						"description": "earliest start",
						"cardinality": 1547,
						"type": "date",
						"blanks": 1,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							"-"
						],
						"unassignedSpecialChars": [],
						"countBy": false,
						"errors": [],
						"descriptiveField": "generated",
						"$$hashKey": "object:118"
					},
					{
						"key": "latest stop",
						"description": "latest stop",
						"cardinality": 1617,
						"type": "date",
						"blanks": 6,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							"-"
						],
						"unassignedSpecialChars": [],
						"countBy": false,
						"errors": [],
						"descriptiveField": "generated",
						"$$hashKey": "object:119"
					},
					{
						"key": "spatial URI",
						"description": "spatial URI",
						"cardinality": 180,
						"type": "url",
						"blanks": 0,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							":",
							"/"
						],
						"unassignedSpecialChars": [],
						"countBy": false,
						"errors": [],
						"descriptiveField": "generated",
						"$$hashKey": "object:120"
					},
					{
						"key": "place name",
						"description": "place name",
						"cardinality": 183,
						"type": "text",
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
						"descriptiveField": "generated",
						"$$hashKey": "object:121"
					},
					{
						"key": "coordinates",
						"description": "coordinates",
						"cardinality": 180,
						"type": "latlong",
						"blanks": 0,
						"uniques": [],
						"uniqueKey": false,
						"special": [
							",",
							"-"
						],
						"unassignedSpecialChars": [],
						"countBy": false,
						"errors": [],
						"descriptiveField": "generated",
						"$$hashKey": "object:122",
						"existenceDimension": "0.dsjbf1mjwpk"
					},
					{
						"key": "generated",
						"description": "generated",
						"cardinality": 8758,
						"type": "text",
						"blanks": 0,
						"uniques": [],
						"uniqueKey": true,
						"special": [],
						"unassignedSpecialChars": [],
						"countBy": true,
						"errors": [],
						"$$hashKey": "object:123",
						"countable": true,
						"countDescription": "Untitled"
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
		"vis": [
			{
				"type": "palladioFilters",
				"importJson": {
					"facets": [],
					"timelines": [],
					"partimes": [],
					"timesteps": []
				}
			},
			{
				"type": "graphView",
				"importJson": {
					"showLinks": true,
					"showLabels": true,
					"aggregateKey": null,
					"aggregationType": "COUNT",
					"nodeSize": false,
					"highlightSource": false,
					"highlightTarget": false,
					"aggDimKey": "generated",
					"sourceDimension": null,
					"targetDimension": null,
					"fixedNodes": false
				}
			},
			{
				"type": "mapView",
				"importJson": {
					"tileSets": [
						{
							"url": null,
							"mbId": "cesta.hd9ak6ie",
							"enabled": true,
							"description": "Land"
						}
					],
					"layers": [
						{
							"aggDescription": "Number of Untitled",
							"aggregateKey": null,
							"aggregationType": "COUNT",
							"color": "#666",
							"countBy": "generated",
							"description": "Periods",
							"enabled": true,
							"layerType": "data",
							"descriptiveDimKey": "label",
							"mapping": {
								"sourceCoordinatesKey": "coordinates",
								"sourceCoordinatesType": null,
								"sourceCoordinatesDescription": "coordinates",
								"destinationCoordinatesKey": null,
								"destinationCoordinatesType": null,
								"destinationCoordinatesDescription": null
							},
							"showLinks": false,
							"type": "points"
						}
					]
				}
			},
			{
				"type": "tableView",
				"importJson": {
					"tableDimensions": [],
					"countDim": null,
					"maxDisplay": 1000
				}
			},
			{
				"type": "listView",
				"importJson": {
					"titleDim": "generated"
				}
			}
		]
	}
}