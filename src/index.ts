// import * as fs from 'fs';
import { CsvCreator } from './csv/create-csv';
require('bootstrap/dist/css/bootstrap.css')
require('./style.scss');

$(document).ready(function() {
    $("#content, #url").bind('keyup', function () {
   
           ($('#content').val() && $('#url').val()) ? $('#submit-button').prop('disabled', false) : $('#submit-button').prop('disabled', true);
   
    });
});

// Disable submit button if URL and Peridos are not full
// Show error if Periods is not a legal json (JSON.parse fails) or full is not a URL of legal JSON (download or parse fail)
 $('#submit-button').click(() => {
   
    // Read full data from URL
    // process data (both full and content)
    // Put CSV (returned from process data) in the CSV block
    const content = $('#content').val();
    const  csv = processData(content,"#leftCol");
    const url = $('#url').val();

    loadJson(url, "#rightCol",  processData);
 });



function  loadJson(url ,contenair,callBack){

    $.ajax({
        type: 'GET',
        url: url,
        dataType: "text",
        success: (data) => callBack(data, contenair),
        // error: function () {
        //     alert();
        //     alert();
        //   }
        });
   
}
function processData(full, data){
    const creator = new CsvCreator(full);
    let csv = creator.csvHeader + '\n';
    for(const row of creator.generateCsvRows(data)) {
        csv += row + '\n';
    }

    return csv;
}

// function writeObject(obj, parentElement){
    
//     for (const key in obj) {
//         if (obj.hasOwnProperty(key)) {
//             const element = obj[key];
//             var txt = document.createElement("p");
//             var p = document.createElement("label")
//             //p.classList.add('');

//             if(typeof element === 'object' && element !== null)
//             {
//                 txt.innerHTML = `${key}:`;
//                 parentElement.append(txt);
//                 //txt.classList.add('coucou');
//                 writeObject(element, txt)
//             }
//             else{
//                 txt.innerHTML = `${key}:`;
//                 p.innerHTML = `${element}`;
//                 parentElement.append(txt);
//                 //txt.classList.add('coucou');
//                 txt.append(p);
//                 //p.classList.add('david');
//             }
//         }
//     }

// }

// function component() {
//     const div = $("#div")
//     return div;
// }

// $(document).ready(() => {
//     const div = component();
//     div.html("Welcome to webpack, Typescript and jQuery");
// });
