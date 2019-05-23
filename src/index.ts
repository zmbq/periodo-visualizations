// import * as fs from 'fs';
import { CsvCreator, EnhancedPeriod } from './logic/create-csv';
import { PalladioWrapper } from './logic/palladio-wrapper';

require('bootstrap/dist/css/bootstrap.css')
require('./index.scss');

let periods: EnhancedPeriod[] = undefined;

const wrapper = new PalladioWrapper();

$(document).ready(function() {
    $("#period-url, #full-url").bind('keyup', function () {
        $('#submit-button').prop('disabled', !$('#period-url').val || !$('#full-url').val);
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
        $('#error').html("Can't load full period data");
        return;
    }

    const creator = new CsvCreator(full);
    creator.enhancePeriods(periodData);
    periods = Array.from(creator.iteratePeriods(periodData));
    
    $('#submit-button').prop('disabled', false);
    visualize();
});

function visualize() {
    // Build the JSON required by palladio
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
        const dim = wrapper.components.dimensions();
        const options = timespan.getOptions();

        options.startDimension(dim.filter((d) => d.key == 'earliest start')[0]);
        options.endDimension(dim.filter((d) => d.key == 'latest stop')[0]);
        options.groupDimension(dim.filter((d) => d.key == 'label')[0]);
    }
    setTimeout(setTimespan, 200);
}
