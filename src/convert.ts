// import * as fs from 'fs';
import { PeriodProcessor } from './logic/periods';
import { PlaceProcessor } from './logic/places';
require('bootstrap/dist/css/bootstrap.css')
require('./convert.scss');

 let periods: any, full: any, places: PlaceProcessor, creator: PeriodProcessor;

 async function loadEverything() {
    $('error').html('');
    $('#submit-periods').prop('disabled', true);
    $('#submit-map').prop('disabled', true);

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
        console.error(e);
        $('#error').html("Can't load full period data");
        return;
    }

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

    let placeData: any
    try {
        placeData = await $.ajax({
            type: 'GET',
            url: $('#places-url').val().toString(),
            dataType: "json",
        });
    } catch(e) {
        console.error(e);
        $('#error').html("Can't load places data");
        return;
    }

    creator = new PeriodProcessor(full);
    places = new PlaceProcessor(placeData);

    creator.enhancePeriods(periods);

    $('#error').html('');
    $('#submit-periods').prop('disabled', false);
    $('#submit-map').prop('disabled', false);
 }

 async function submitPeriods() {
     await loadEverything();

     const csv = creator.getCsv(periods);
     $('#csv').html(csv);
 }

 async function submitMap() {
     await loadEverything();
     
     creator.enhancePeriods(periods);
     const csv = places.getCsv(creator.iteratePeriods(periods));
     $('#csv').html(csv);
 }


 $(document).ready(function() {
    $("#period-url, #full-url, #places-url").bind('keyup', function () {
        const disabled  =!$('#period-url').val || !$('#full-url').val || !$('#places-url').val;
        $('#submit-periods').prop('disabled', disabled);
        $('#submit-map').prop('disabled', disabled);
    });

    // Disable submit button if URL and Peridos are not full
    // Show error if Periods is not a legal json (JSON.parse fails) or full is not a URL of legal JSON (download or parse fail)
    $('#submit-periods').on('click', submitPeriods);
    $('#submit-map').on('click', submitMap);
});