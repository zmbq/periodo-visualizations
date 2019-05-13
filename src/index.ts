// import * as fs from 'fs';
import { CsvCreator } from './csv/create-csv';
require('bootstrap/dist/css/bootstrap.css')
require('./style.scss');

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
    let periods: any;
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

    // We need to build a large CSV string. Building an array of strings and then using join is
    // the fastest way according to this: https://stackoverflow.com/a/2087538/871910
    const lines: string[] = [];
    lines.push(creator.csvHeader);
    for(const row of creator.generateCsvRows(periods)) {
        lines.push(row);
    }

    const csv = lines.join('\n');
    $('#csv').html(csv);
    $('#error').html('');
    $('#submit-button').prop('disabled', false);
 });
