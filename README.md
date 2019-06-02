# Documentation for the Palladio Visualizations for PeriodO

## Scope
This work is a Proof of Concept - proving that Palladio Bricks and be used for PeriodO visualizations.

Two visualizations - Timespan and Maps - have been successfully demonstrated. This document explains the concepts behind the visualizations. It also includes tips on how to modify and improve on the work we have done.

## Data Flow in the POC
Before it can be visualized, the period data needs to be processed and shaped the way Palladio prefers. We need three data files - the periods you want to visualize (in the PeriodO JSON-LD format), [the entire PeriodO dataset](https://data.perio.do/d/"), and the [PeriodO place geometries and metadata dataset](https://data.perio.do/graphs/places.json) .

We take these three datasets and turn them into two CSV files - one for the periods (with one row per period) and another for locations (with one row per location).

We then turn each of these two files into Palladio Save Files, which can be fed into Palladio Broks (the Palladio term for embeddable components)


## The Palladio Save File
Palladio Bricks expect the data not in CSV, but rather in an undocumented format that is stored in "Palladio Save Files". This are JSON files that contain all the data from the CSV, as well as additional metadata used by Palladio.

You can create such a file by opening the [Palladio Application](http://hdlab.stanford.edu/palladio-app), pasting CSV data, setting up your visualization and clicking on the "Download" button on the top right corner of the page.

We used this technique to create two Palladio Save Files - one for the periods CSV and another for the places CSV. We then edited these files and removed the data (located in `files[0].data`), leaving us only with the metadata.

Converting a our generated CSV into the data portion of the Palladio Save File is pretty straightforward, so we did that.

### *IMPORTANT*! You need to do recreate the CSV templates every time you change the CSV structure!

## Code Components
We have three files that implement all the data processing for Palladio. They are all in the `src/logic` folder. These are:

* `periods.ts` - Processes the Periods data file and generates the periods CSV
* `places.ts` - Uses the processed Periods data and generates the places CSV
* `palladio-wrapper.ts` - A thin wrapper around Palladio Bricks. This file also takes care of the Palladio Save File generation

### `periods.ts`
The processing of the period data is pretty straight forward. You can find documents throughout the code. 

The main class is `PeriodProcessor`, which is initialized with the full PeriodO dataset. It scans the full database and indexes all the periods and authors appearing there. We do this because the PeriodO period bags, for instance, do not include author data.

We have many generator methods that iterate over periods in the period collection and yield their result - either the period itself, or a CSV data row. We use this throughout the code.

The function `getCsv` returns a string containing the CSV file of the periods. We did not use simple string concatenation as it was awfully slow. Instead of `join` arrays of strings.

### `places.ts`
This file was pretty much an adaption of `periods.ts`, to support the second type of CSV - the places CSV. Since we ran out of time, we did not spend too much time refactoring the shared logic. You may see some repetition (but not much)

### `palladio-wrapper.ts`
This file has the `PalladioWrapper` class which is the thing wrapper around Palladio. It also has two converter classes - `TimespanConverted` and `MapConverter`. These two classes convert the CSV data (actually the interim row objects created when generating the CSV) and turns them into Palladio Save Files.

### `index.ts`
This is the main UI file. It is pretty straightforward. The code that interacts with Palladio was mostly adapted from [The Palladio Bricks Standalone Demo](https://github.com/humanitiesplusdesign/palladio-standalone).

Notice that various Palladio properties are set using a `setTimeout` call. This is because Palladio updates some of its state in the AngularJS digest loop, which takes place asynchronously. `setTimeout` callbacks are called after the loop is done. This is common AngularJS practice.

There are only three interesting functions in this file:

* `loadEverything` - fetches the data and processes it using the two processors - `PlaceProcessor` and `PeriodProcessor`
* `submitTimespan` - Starts the timespan visualization
* `submitMap` - Starts the map visualization

## Enhancements

### Two visualizations side-by-side
We did not get around to doing this. [The Palladio Bricks demo](https://github.com/humanitiesplusdesign/palladio-standalone) has an example of this. It seems that creating two `PalladioWrapper` instances - one per visualization, should suffice.

### Changing the Palladio inputs
Currently we have two unrelated CSVs - one with a row per period and another with a row per location. The location CSV contains a `PeriodURI` field that can be used to join the two CSVs.

Palladio is supposed to know how to handle this sort of relation between two CSVs. It should be possible to load both of them into Palladio at once, and create the two visualizations on the same dataset. I did not see a Palladio Bricks example that works with two CSVs, but I did not search thoroughly.

Do note that if you load both CSVs into Palladio, you will need to create another CSV template, and write another `Converter` class. This new class can take the conversion logic from the two existing classes.

### Timespan Sorting
We wanted to sort timespans based on collection publication date. The Palladio programmer has added such a feature. Unfortunately, he does not have a lot of time, so the sorting does not work very well. Once he fixes this, we can update the Palladio Timespan Component, and it should just work. The current code already calls the right function to apply the sorting.

## The Conversion webpage
We have another webpage, available at /convert.html . This page just runs the CSV conversion code and outputs the CSV. This can be very useful for getting the CSV into Palladio.

Sometimes the CSV is cut in the middle. This is a browser issue we did not investigate. In the `tools` folder there is a utility that can create the CSVs from the command line. It's in `tools/try.ts`

## The Technical Details
We wrote this POC with Typescript, and tried to use Webpack for packing everything.

### Settings up on your own computer
Clone the repository, then `yarn install` (you can use npm if you want) to install everything. You then have the following npm scripts:

* `build` - Builds the POC
* `build-tools` - Builds the command line conversion tool
* `start` - Starts the Webpack webserver so you can try the POC yourself
* `watch-tools` - Watches the tool folder and recompiles when a file changes.

### Things we had to do for Palladio
There are things we had to do that aren't normally done anymore.

1. We had to use `bower`. Palladio is not uploaded to `npm`, you need to `bower install` it. We added a `postinstall` npm script, so that `yarn install` also installs the bower packages.

2. We added explicit `<script>` tags for Palladio. Palladio does not play nicely with Webpack, and can't be imported as a module. We had no choice to but reference its scripts and CSS files directly from `index.html`

3. Place the Palladio scripts in the `/assets` directory. Since Palladio can't be imported with Webpack, Webpack had no idea it has to package the Palladio files. We told Webpack to simply copy the Palladio files from `bower_components` into `/assets`, so they can be referenced by `index.html`

### Continuous Integration
We set up Travis CI to automatically build the website and upload it to an AWS S3 bucket. We've also set up AWS Cloudfront to serve the bucket's content. You can reach the POC at [https://periodo-visualization.researchsoftwarehosting.org](https://periodo-visualization.researchsoftwarehosting.org).
