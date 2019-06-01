
var indexViewModel = {

    ///
    /// Data properties
    ///

    mainHeader: jst.observable("ED Downtime app"),
    description: jst.observable("Welcome to the ED Downtime app, blah blah, yada yada..."),

    patients: [
        { "PASId": "HEY123456765", "arrived": "2019-05-28 08:34" },
        { "PASId": "HEY123456765", "arrived": "2019-05-28 08:34" },
        { "PASId": "HEY123456765", "arrived": "2019-05-28 08:34" }
    ],

    //
    // Events
    //

    updateHeader: function () {
        var newData = document.getElementById("headerTextBox").value;
        this.mainHeader(newData);
    },

    updateDescription: function () {
        var newData = document.getElementById("descriptionTextBox").value;
        this.description(newData);
    }
};

///
/// Bind view model to UI
///

jst.applyBinds(indexViewModel, document);