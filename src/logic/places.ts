import { stringify } from "querystring";
import { PeriodProperties, sanitizeCsvField } from "./periods";

class IgnorePlaceError { }
class PlaceInfo {
    public id: string;
    public coordinates: number[][];
    public middlePoint: number[];

    constructor(json: any) {
        this.id = json.id;
        if(!this.id) {
            console.error('No id in json ', json);
            throw Error("Can't find id for PlaceInfo");
        }

        const geometries = json.geometry.geometries;
        if (geometries.length != 1) {
            console.error(`Number of geometries of ${json.id}: ${geometries.length}`);
            throw Error('Expected 1 geometry in ' + json.id);
        }

        if(geometries[0].type !== 'Polygon') {
            console.warn(`Place ${json.id} has an unsupportd geometry type ${geometries[0].type}`);
            throw new IgnorePlaceError();
        }

        const coordinateArray = geometries[0].coordinates;
        this.coordinates = coordinateArray[0];  // In case of a multipolygon, take the center of the first polygon
        if (!this.coordinates) {
            console.error('No coordinates in ', json);
            throw Error("No coordinates in " + json.id);
        }

        // Find middle point

        const sum = [0, 0];
        for(let coord of this.coordinates) {
            if (coord.length!=2) {
                console.error('Badly formatted coordinates in ', json);
                throw Error("Badly formatted coordinates in " + json.id);
            }
            sum[0] += coord[0];
            sum[1] += coord[1];
        }

        sum[0] /= this.coordinates.length;
        sum[1] /= this.coordinates.length;
        this.middlePoint = [sum[1], sum[0]]; // PeriodO data in lon/lat, Palladio wants lat/lon
    }
}


export interface PeriodLocationProperties {
    period: PeriodProperties,
    spatialURI: string,
    name: string,
    middlePoint: number[],
    rowAsArray?: string[],
}


export class PlaceProcessor {
    private placeMap: Map<string, PlaceInfo>; // A mapping from place ID (the id field) to PlaceInfo

    constructor(places: any) {
        this.placeMap = new Map<string, PlaceInfo>();

        // All the locations are stored in /graphs of the JSON
        for(const graphKey in places.graphs) {
            const graph = places.graphs[graphKey];

            // Locations are stored in graph/features
            for(const feature of graph.features) {
                try {
                    const pi = new PlaceInfo(feature);
                    this.placeMap.set(pi.id, pi);
                } catch(e) {
                    continue;  // Swallow this bad place and move on
                }
            }
        }

        console.log(`Place map filled with ${this.placeMap.size} places`);
    }

    public createLocationProperties(period: PeriodProperties): PeriodLocationProperties[] {
        const result = [] as PeriodLocationProperties[];

        for(const spatialInfo of period.spatialCoverage) {
            const place = this.placeMap.get(spatialInfo.uri);
            if (!place) {
                console.warn(`Can't locate place for ${spatialInfo.uri}`);
            } else {
                result.push({
                    period,
                    spatialURI: spatialInfo.uri,
                    name: spatialInfo.label,
                    middlePoint: place.middlePoint,
                });
            }
        }

        return result;
    }

    public *generateLocationProperties(periods: IterableIterator<any> | any[]): IterableIterator<PeriodLocationProperties> {
        for(const period of periods) {
            if (!period.csv) {
                console.error('Unenhanced period ', period);
                throw new Error('generateLocationProperties called with unenhanced properties');
            }
            const locations = this.createLocationProperties(period.csv.properties);
            for(const location of locations) {
                location.rowAsArray = this.createLocationRowFields(location);
                yield location;
            }
        }
    }

    public static get csvHeader() {
        return "period URI,label,earliest start,latest stop,spatial URI,place name,coordinates";
    }

    private createLocationRowFields(location: PeriodLocationProperties): any[] {
        let fields = [location.period.URI, 
            location.period.label, 
            location.period.earliestStartDate, 
            location.period.latestStopDate, 
            location.spatialURI,
            location.name,
            `${location.middlePoint[0]},${location.middlePoint[1]}`];
        return fields;
    }

    public *generateCsvRows(periods: IterableIterator<any> | any[]): IterableIterator<string> {
        for(const location of this.generateLocationProperties(periods)) {
            const fields = this.createLocationRowFields(location);
            const sanitized = fields.map((field) => sanitizeCsvField(field));
            const row = sanitized.join(',');
    
            yield row;
        }
    }

    public getCsv(periods: IterableIterator<any> | any[]): string {
        const lines: string[] = [];

        lines.push(PlaceProcessor.csvHeader);
        for(const row of this.generateCsvRows(periods)) {
            lines.push(row);
        }

        const csv = lines.join('\n');
        return csv;
    }
}
