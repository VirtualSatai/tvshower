$(document).ready(function () {
    $.ajax({
        contentType: "application/json",
        success: function (data) {
            let parsed = JSON.parse(data);
            $('#my-select').empty();
            $.each(parsed, function (key) {
                $('#my-select').append($("<option></option>").attr("value", parsed[key]).text(parsed[key]))
            });
            let selected = localStorage.shows.split(",");
            $.each(selected, function (val) {
                $('#my-select option[value="' + selected[val] + '"]').attr('selected','selected');
            });
            $('#my-select').multiSelect({
                selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='try \"Game of Thrones\"'>",
                selectionHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='try \"Suits\"'>",
                afterInit: function (ms) {
                    var that = this,
                        $selectableSearch = that.$selectableUl.prev(),
                        $selectionSearch = that.$selectionUl.prev(),
                        selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)',
                        selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';

                    that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                        .on('keydown', function (e) {
                            if (e.which === 40) {
                                that.$selectableUl.focus();
                                return false;
                            }
                        });

                    that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                        .on('keydown', function (e) {
                            if (e.which === 40) {
                                that.$selectionUl.focus();
                                return false;
                            }
                        });
                },
                afterSelect: function (values) {
                    this.qs1.cache();
                    this.qs2.cache();
                    save();
                },
                afterDeselect: function (values) {
                    this.qs1.cache();
                    this.qs2.cache();
                    save();
                }
            });
        },
        error: function (e) {
            console.log("epic fail: " + e)
        },
        processData: false,
        type: 'POST',
        url: '/get_shows'
    });
});


function save() {
    localStorage.shows = $('#my-select').val();
}