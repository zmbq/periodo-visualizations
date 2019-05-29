/*
 * This file contains the implementation of the PeriodO JSON-LD to CSV translation.
 *
 * The CSV has one row per period, with the following properties:
 *     Collection Author (in case of multiple authors, they are all listed)
 *     Collection publication year
 *     Period Label
 *     Spatial URLs (separated by commas)
 *     Start date (earliest in case there are several)
 *     End date (lastest in case there are several)
 *     Period URI
 *     URIs of derived periods (separated by commas)
 * 
 */

 /* The PeriodPeroperties interface contains all the data we need to generate the CSV line.
    We have kept some properties as arrays. We combine them when generating the actual CSV row */
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

/* To speed up processing, we map the full period data before once. AuthorityProperties are properties
   of an authority (which another name for a collection) */
export interface AuthorityProperties {
    id: string;
    yearPublished: number | undefined;
    authors: string;
}

/* Instead of just moving rows around, we return CsvData objects. This allows callers to access the inividual properties */
export interface CsvData {
    properties: PeriodProperties,
    rowAsArray: string[],
    row: string,
}

export interface EnhancedPeriod {
    csv: CsvData
};

/*
 * This is the main class in this module.
 *
 * Upon construction it scans the full period data and:
 *     Collects authority data
 *     Maps periods to authorities
 *     Maps all derived property relationships
 * 
 * Once initialized, the class instance can be used to iterate over periods in a period JSON-LD, or generate the final CSV rows.
 */
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

            // Some authorities have a 'creators' element, while others only have a contributors element.
            // We give percedence to creators, and fall back to using contributors if we can't find any
            const authorsElement = source.creators || source.contributors;
            let authors = '';

            if (authorsElement) { // Some authuroties don't have any author information
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

        // To save time, we scan the full JSON-LD once, and update both maps at once
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

    /* Iterate over all periods in a data file and yield the period objects
     *
     * You can loop over all periods like so:
     *     for(const period in creator.ietratePeriods(data)) { ... }
     * 
     * This function handles the three types of period JSON-LD objects we've seen:
     * 1. The full data object, which contains periods inside authorities
     * 2. A single authority object, which contains periods at the top level
     * 3. a period bag object, which contains periods in the items top level property.
     * 
     * The code is actually pretty lenient, allowing objects that are a combination of
     * the three mentiond above.
     */
    public *iteratePeriods(data: any): IterableIterator<any> {
        // Data object can contain multiple authorities, with periods under each one
        if (data.authorities) {
            // Loop over authorities, and yield recursively
            for (const authorityId in data.authorities) {
                const authority = data.authorities[authorityId];
                yield *this.iteratePeriods(authority);  // yield everything iteratePeriods(authority) yields
            }
        }

        // Object can contain just a single authority
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

    // Each period has a URI which is determined by the periodId
    private getPeriodURI(periodId) {
        return `http://n2t.net/ark:/99152/${periodId}`;
    }

    // Get the PeriodProperties of a single period object
    private getPeriodProperties(period: any): PeriodProperties
    {
        // We've added an inner funtion for each property we need to extract.
        // All these functions are written very defensively, throwing an exception whenever something
        // we do not expect is encountered.

        function getLabel(): string {
            if (!period.label) {  // All periods have labels
                throw new Error(`No label in period ${period.id}`);
            }
            return period.label;
        }

        function getSpatialURIs(): string[] {
            if (!period.spatialCoverage) { // Some periods do not have spatial information
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

        // Note the use of a lambda expression here. This is because getDerviedFrom needs to use `this.derivedPeriods`
        // function () declarations get a different this.
        const getDerivedFrom = () => {
            const derivedFrom = this.derivedPeriods.get(period.id) || []; // Not all periods have derived periods

            const derivedURIs = derivedFrom.map((id) => this.getPeriodURI(id));
            return derivedURIs;
        }

        // From here on we build the properties
        const authority = this.periodToAuthorities.get(period.id);
        if (!authority) {
            // This is the only bit of this function that's less defensive.
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

    // Get the CsvData of a period object 
    public getCsvData(period: any): CsvData {
        const props = this.getPeriodProperties(period);

        // Convert properties to a list of fields
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

        // Sanitize each field
        const sanitized = fields.map((field) => sanitizeCsvField(field));

        // Join them all into one row
        const row = sanitized.join(',');

        return {
            properties: props,
            rowAsArray: fields,
            row
        } as CsvData;
    }

    // Returns the headers for the CSV.
    // Note: the order has to be identical to the order of the fields[] array in getCsvData
    public static get csvHeader() {
        return "author,publication year,label,spatial URIs,earliest start,latest stop,URI,derived URIs";
    }

    // Yields CSV rows for the JSON-LD periods data object
    public *generateCsvRows(data: any): IterableIterator<string> {
        for(const period of this.iteratePeriods(data)) {
            const csvData = this.getCsvData(period);
            yield csvData.row;
        }
    }

    // There are cases where the caller may want to reuse the CSV rows (for example, when doing Palladio visualizations 
    // several times). For this we've added this convenience method that adds the CsvData to each period.
    public enhancePeriods(data: any) {
        for(const period of this.iteratePeriods(data)) {
            const csvData = this.getCsvData(period);
            period.csv = csvData;
        }
    }

    // Returns a string containing the full CSV for the JSON-LD periods data object.
    public getCsv(data: any): string {

        // We need to build a large CSV string. Building an array of strings and then using join is
        // the fastest way according to this: https://stackoverflow.com/a/2087538/871910
        const lines: string[] = [];
        
        lines.push(CsvCreator.csvHeader);
        for(const row of this.generateCsvRows(data)) {
            lines.push(row);
        }

        const csv = lines.join('\n');
        return csv;
    }
}

export function sanitizeCsvField(field) {
    // We place quotes around fields
    // We also need to escape quotes inside the field, so we replace quotes with double quotes
    // See here: https://stackoverflow.com/a/46638833/871910
    const doubleQuotes = field.replace(/"/g,'""');
    return `"${doubleQuotes}"`;
}
