function toTableRow(d) {
    return "<tr>" +
        "<td><a href=\"" + d['url'] + "\">"+ d['name'] + "</a></td>" +
        "<td>" + d['date'] + "</td>" +
        "<td>" + d['size'] + "</td>";

}

$(document).ready(function() {
    $.ajax({
        contentType: "application/json",
        data: JSON.stringify({
            'shows': localStorage.shows
        }),
        success: function (data) {
            console.log("success");
            console.log(data);
            let parsed = JSON.parse(data);
            $('#myTable tr:last').remove();
            for (let d in parsed) {
                console.log(parsed[d]);
                $('#myTable tr:last').after(toTableRow(parsed[d]));
            }
        },
        error: function (e) {
            console.log("epic fail: " + e)
        },
        processData: false,
        type: 'POST',
        url: '/get_content'
    });
});
