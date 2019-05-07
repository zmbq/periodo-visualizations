require('bootstrap/dist/css/bootstrap.css')
require('./style.scss');

function component() {
    const div = $("#div")
    return div;
}

$(document).ready(() => {
    const div = component();
    div.html("Welcome to webpack, Typescript and jQuery");
});
