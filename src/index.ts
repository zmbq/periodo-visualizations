require('bootstrap/dist/css/bootstrap.css')
require('./style.scss');

 $('#submit-button').click(function() {
   
    var content = $('#content').val();
    processData(content,"#leftCol")
    var url = $('#url').val();
    loadJson(url, "#rightCol",  processData);

 });


function  loadJson(url ,contenair,callBack){

    $.ajax({
        type: 'GET',
        url: url,
        dataType: "text",
        success: (data) => callBack(data, contenair)
    });
}
function processData(jsonText,contenair){
    const jsonObject = JSON.parse(jsonText);
    const div = $(contenair);
    writeObject(jsonObject, div);
}

function writeObject(obj, parentElement){
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const element = obj[key];
            var txt = document.createElement("p");
            var p = document.createElement("label")
            //p.classList.add('');

            if(typeof element === 'object' && element !== null)
            {
                txt.innerHTML = `${key}:`;
                parentElement.append(txt);
                //txt.classList.add('coucou');
                writeObject(element, txt)
            }
            else{
                txt.innerHTML = `${key}:`;
                p.innerHTML = `${element}`;
                parentElement.append(txt);
                //txt.classList.add('coucou');
                txt.append(p);
                //p.classList.add('david');
            }
        }
    }

}

// function component() {
//     const div = $("#div")
//     return div;
// }

// $(document).ready(() => {
//     const div = component();
//     div.html("Welcome to webpack, Typescript and jQuery");
// });
