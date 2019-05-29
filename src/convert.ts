// import * as fs from 'fs';
import { CsvCreator } from './logic/create-csv';
import { PlaceProcessor } from './logic/places';
require('bootstrap/dist/css/bootstrap.css')
require('./convert.scss');

console.log('convert.ts is here');
$(document).ready(function() {
    $("#period-url, #full-url, #places-url").bind('keyup', function () {
        $('#submit-button').prop('disabled', !$('#period-url').val || !$('#full-url').val || !$("#places-url").val);
    });
});

// Disable submit button if URL and Peridos are not full
// Show error if Periods is not a legal json (JSON.parse fails) or full is not a URL of legal JSON (download or parse fail)
 $('#submit-periods').click(submitPeriods());
 $('#submit-map').click(submitMap());
 
 let periodData: any, full: any, places: PlaceProcessor, createor: CsvCreator;

 async function loadEverything() {
    $('error').html('');
    $('#submit-periods').prop('disabled', true);
    $('#submit-map').prop('disabled', true);

     // Read full data from URL
    // process data (both full and content)
    // Put CSV (returned from process data) in the CSV block
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

    creator = new CsvCreator(full);
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
     const csv = places.getCsv(creator.iteratePeriods(periods));
     $('#csv').html(csv);
 }

