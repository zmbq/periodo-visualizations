// import * as fs from 'fs';
import { CsvCreator, EnhancedPeriod } from './logic/create-csv';
import { PalladioWrapper } from './logic/palladio-wrapper';

require('bootstrap/dist/css/bootstrap.css')
require('./index.scss');

let periods: EnhancedPeriod[] = undefined;

const wrapper = new PalladioWrapper();

$(document).ready(function() {
    $("#period-url, #full-url, #places-url").bind('keyup', function () {
        $('#submit-button').prop('disabled', !$('#period-url').val || !$('#full-url').val || !$("places-url").val);
    });
});

// Disable submit button if URL and Peridos are not full
// Show error if Periods is not a legal json (JSON.parse fails) or full is not a URL of legal JSON (download or parse fail)
 $('#submit-button').click(async () => {
    $('error').html('');
    $('#submit-button').prop('disabled', true);

    // Read full data from URL
    // process data (both full and content)
    // Put CSV (returned from process data) in the CSV block
    let periodData;
    try {
        periodData = await $.ajax({
            type: 'GET',
            url: $('#period-url').val().toString(),
            dataType: "json",
        });
    } catch(e) {
        console.error(e);
        $('#error').html("Can't load full period data");
        return;
    }

    let full: any;
    try {
        full = await $.ajax({
            type: 'GET',
            url: $('#full-url').val().toString(),
            dataType: "json",
        });
    } catch(e) {
        console.error(e);
        $('#error').html("Can't load full period data");
        return;
    }

    let places: any;
    try {
        places = await $.ajax({
            type: 'GET',
            url: $('#places-url').val().toString(),
            dataType: "json",
        });
    } catch(e) {
        console.error(e);
        $('#error').html("Can't load places data");
        return;
    }

    const creator = new CsvCreator(full);
    creator.enhancePeriods(periodData);
    periods = Array.from(creator.iteratePeriods(periodData));
    
    // $('#submit-button').prop('disabled', false);
    visualize();
});

function visualize() {
    // Build the JSON required by palladio
    periods.reverse();
    const palladioData = wrapper.preparePalladioData(periods);
    wrapper.loadData(palladioData);
    const timespan = wrapper.addComponent('timespan', '#timespan', {
        showControls: false,
        showSettings: false,
        showAccordion: false
    });

    // dimensions will only be ready after Angular (which is used by Palladio) completes its own
    // cycle. So we need to wait a little bit with setTimeout before accessing it.
    const setTimespan = () => {
        const comps = wrapper.components;
        const options = timespan.getOptions();

        options.startDimension(comps.dimensionFromKey('earliest start'));
        options.endDimension(comps.dimensionFromKey('latest stop'));
        options.tooltipDimension(comps.dimensionFromKey('label'));
        options.groupDimension(comps.dimensionFromKey('publication year'));
        // options.labelDimension(comps.dimensionFromKey('label'));
    }
    setTimeout(setTimespan, 200);
}
