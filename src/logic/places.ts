import { stringify } from "querystring";
import { PeriodProperties, sanitizeCsvField } from "./create-csv";

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

        this.coordinates = json.geometry.geometries.coordinates;

        if (!this.coordinates) {
            debugger;
            console.error('No coordinates in ', json);
            throw Error("No coordinates in " + json.id);
        }

        // Find middle point

        const sum = [0, 0];
        for(let coord in this.coordinates) {
            if (coord.length!=2) {
                console.error('Badly formatted coordinates in ', json);
                throw Error("Badly formatted coordinates in " + json.id);
            }
            sum[0] += parseInt(coord[0]);
            sum[1] += parseInt(coord[1]);
        }

        sum[0] /= this.coordinates.length;
        sum[1] /= this.coordinates.length;
        this.middlePoint = sum;
    }
}


export interface PeriodLocationProperties {
    period: PeriodProperties,
    spatialURI: string,
    middlePoint: number[],
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
                const pi = new PlaceInfo(feature);
                this.placeMap.set(pi.id, pi);
            }
        }

        console.log(`Place map filled with ${this.placeMap.size} places`);
    }

    public createLocationProperties(period: PeriodProperties): PeriodLocationProperties[] {
        const result = [] as PeriodLocationProperties[];

        for(const uri of period.spatialURIs) {
            const place = this.placeMap.get(uri);
            if (!place) {
                console.warn(`Can't locate place for ${uri}`);
            } else {
                result.push({
                    period,
                    spatialURI: uri,
                    middlePoint: place.middlePoint,
                });
            }
        }

        return result;
    }

    public *generateLocationProperties(periods: IterableIterator<PeriodProperties>): IterableIterator<PeriodLocationProperties> {
        for(const period of periods) {
            const locations = this.createLocationProperties(period);
            for(const location of locations) {
                yield location;
            }
        }
    }

    public static get csvHeader() {
        return "URI,label,earliest start,latest stop,spatialURI,coordinates";
    }

    public *generateCsvRows(periods: IterableIterator<PeriodProperties>): IterableIterator<string> {
        for(const location of this.generateLocationProperties(periods)) {
            const fields = [location.period.URI, 
                location.period.label, 
                location.period.earliestStartDate, 
                location.period.latestStopDate, 
                location.spatialURI, 
                location.middlePoint];
            const sanitized = fields.map((field) => sanitizeCsvField(field));
            const row = sanitized.join(',');
            yield row;
        }
    }

    public getCsv(periods: IterableIterator<PeriodProperties>): string {
        const lines: string[] = [];

        lines.push(PlaceProcessor.csvHeader);
        for(const row of this.generateCsvRows(periods)) {
            lines.push(row);
        }

        const csv = lines.join('\n');
        return csv;
    }
}
