function component() {
    const div = $($.parseHTML('<div></div>'));
    div.html('Hello, webpack and jQuery');
    return div;
}

$(document).ready(() => {
    const div = component();
    $('body').append(div);
});
