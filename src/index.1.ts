// import * as fs from 'fs';
import { CsvCreator } from './logic/create-csv';
import { PalladioWrapper } from './logic/palladio-wrapper';

require('bootstrap/dist/css/bootstrap.css')
require('./index.scss');

let periods = undefined;

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
    try {
        periods = await $.ajax({
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
    creator.enhancePeriods(periods);
    
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

    const setTimespan = () => {
        const dim = wrapper.components.dimensions();
        console.log(dim);
        const options = wrapper.components.getOptions();
        console.log(options);

        options.startDimension(dim.filter((d) => d.earliestStartDate));
        options.endDimension(dim.filter((d) => d.lastestStopDate));
    }
    setTimeout(setTimespan, 200);
}
