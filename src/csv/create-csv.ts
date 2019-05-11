import { stringify } from "querystring";

export interface PeriodProperties {
    collectionAuthor: string,
    collectionPublicationYear: number | undefined,
    label: string,
    spatialURIs: string[],
    earliestStartDate?: number,
    latestStopDate?: number,
    URI: string,
    derivedURIs: string[],
}

interface AuthorityProperties {
    id: string;
    yearPublished: number | undefined;
    authors: string;
}

interface CsvData {
    properties: PeriodProperties,
    row: string,
}

export class CsvCreator {
    // A map from a period id to its authority
    private periodToAuthorities: Map<string, AuthorityProperties>; 

    // A map from a period id to a list of ids of all periods derived from it
    private derivedPeriods: Map<string, string[]>;

    constructor(private fullData: any) { 
        // Preprocess the full data file, for speedier processing later.
        // We fill both period-to-author and period derived from maps in one scan, to save a bit of time
        this.scanPeriods();
    }

    private scanPeriods() {
        // Get the authority properties
        function getAuthorityProperties(authority) {
            const id: string = authority.id;
            let source = authority.source;
            if (source.partOf) { // Some authorities have a partOf object surrounding the relevant data
                source = source.partOf;
            }
            const yearPublished = source.yearPublished ? parseInt(source.yearPublished) : undefined;

            const authorsElement = source.creators || source.contributors;
            let authors = '';

            if (authorsElement) {
                const authorNames: string[] = authorsElement.map((c: any) => c.name);
                authors = authorNames.join(', ');    
            }

            return {
                id,
                yearPublished, 
                authors,
            } as AuthorityProperties;
        }

        // Mark 'derived' as derived from 'period'
        const markDerivedFrom = (period: string, derived: string) => {
            // We use a lambda expression syntax so that 'this' refers to the class instance.
            let list = this.derivedPeriods.get(period);
            if (!list) {
                list = [];
                this.derivedPeriods.set(period, list);
            }

            list.push(derived);
        }

        this.periodToAuthorities = new Map<string, AuthorityProperties>();
        this.derivedPeriods = new Map<string, string[]>();

        let periodCount = 0;
        for (const authorityId in this.fullData.authorities) {
            const authority = this.fullData.authorities[authorityId];
            let authorityProperties: AuthorityProperties;
            try {
                authorityProperties = getAuthorityProperties(authority);
            } catch(e) {
                console.error("Can't get properties of ", authorityId);
                throw(e);
            }
            if (authority.periods) {
                for (const periodId in authority.periods) {
                    this.periodToAuthorities.set(periodId, authorityProperties);

                    const period = authority.periods[periodId];
                    if (period.derivedFrom) {
                        markDerivedFrom(periodId, period.derivedFrom);
                    }
                    periodCount ++;
                }
            }
        }

        console.log(`Full data contains ${periodCount} periods`);
    }

    // Iterate over all periods in a data file
    public *iteratePeriods(data: any): IterableIterator<any> {
        // Data file can be a full file, containing periods under authorities
        if (data.authorities) {
            // Loop over authorities, and yield recursively
            for (const authorityId in data.authorities) {
                const authority = data.authorities[authorityId];
                yield *this.iteratePeriods(authority);
            }
        }

        // Data file can be a single authority file, containing just periods
        if (data.periods) {
            for(const periodId in data.periods) {
                yield data.periods[periodId];
            }
        }

        // In period bags, the periods are in data.items
        if (data.items) {
            for (const periodId in data.items) {
                yield data.items[periodId];
            }
        }
    }

    private getPeriodURI(periodId) {
        return `http://n2t.net/ark:/99152/${periodId}`;
    }

    private getPeriodProperties(period: any): PeriodProperties
    {
        function getLabel(): string {
            if (!period.label) {
                throw new Error(`No label in period ${period.id}`);
            }
            return period.label;
        }

        function getSpatialURIs(): string[] {
            if (!period.spatialCoverage) { // This happens
                return [];
            }

            return period.spatialCoverage.map((sc:any) => sc.id);
        }

        function getEarliestStartDate() {
            if (period.start && period.start.in) {
                return parseInt(period.start.in.year || period.start.in.earliestYear);
            }

            // There are cases where there is no start date, so we indicate this
            return undefined;
        } 

        function getLatestStopDate() {
            if (period.stop && period.stop.in) {
                return parseInt(period.stop.in.year || period.stop.in.latestYear);
            }

            // There are cases where there is no stop date, so we indicate this
            return undefined;
        }

        const getDerivedFrom = () => {  // Use a lambda expression because we need 'this' to be the instance
            const derivedFrom = this.derivedPeriods.get(period.id) || [];

            const derivedURIs = derivedFrom.map((id) => this.getPeriodURI(id));
            return derivedURIs;
        }

        const authority = this.periodToAuthorities.get(period.id);
        if (!authority) {
            console.warn(`Can't locate authority for period ${period.id}`);
        }

        const properties = {
            collectionAuthor: authority.authors,
            collectionPublicationYear: authority.yearPublished,
            label: getLabel(),
            spatialURIs: getSpatialURIs(),
            earliestStartDate: getEarliestStartDate(),
            latestStopDate: getLatestStopDate(),
            URI: this.getPeriodURI(period.id),
            derivedURIs: getDerivedFrom(),
        } as PeriodProperties;

        return properties;
    }

    public getCsvData(period: any): CsvData {
        function sanitizeField(field) {
            // We place quotes around fields
            // We also need to escape quotes inside the field, so we replace quotes with double quotes
            // See here: https://stackoverflow.com/a/46638833/871910
            const doubleQuotes = field.replace(/"/g,'""');
            return `"${doubleQuotes}"`;
        }

        const props = this.getPeriodProperties(period);
        const fields = [
            props.collectionAuthor,
            props.collectionPublicationYear ? props.collectionPublicationYear.toString() : '',
            props.label,
            props.spatialURIs.join(','),
            props.earliestStartDate ? props.earliestStartDate.toString() : '',
            props.latestStopDate ? props.latestStopDate.toString() : '',
            props.URI,
            props.derivedURIs.join(',')
        ];
        const sanitized = fields.map((field) => sanitizeField(field));
        const row = sanitized.join(',');

        return {
            properties: props,
            row
        } as CsvData;
    }

    public get csvHeader() {
        return "author,publication year, label, spatial URIs, earliest start, latest stop, URI, derived URIs";
    }

    // Enhance all the periods in data, by adding a 'csv' entry
    public enhancePeriods(data: any) {
        for(const period of this.iteratePeriods(data)) {
            const csvData = this.getCsvData(period);
            period.csv = csvData;
        }
    }

    public *generateCsvRows(data: any): IterableIterator<string> {
        for(const period of this.iteratePeriods(data)) {
            const csvData = this.getCsvData(period);
            yield csvData.row;
        }
    }
}