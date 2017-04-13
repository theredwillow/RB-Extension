//starlord.js

// Helps get entries in faster

$(window).arrive('div.right', function(){
    if( $('#addButton').length < 1 ){
        $('button.smallTxt.left').before( $('<button>').text('Add').attr('id', 'addButton').on('click', addTextarea) );
    }
});

var oldListings;
function collectRecords() {
    // This collects the jQuery items, not the text()
    var cIndex = {};
    oldListings = [];
    var recordRows = $('.normalTxt>tbody>tr');
    for (i = 0; i < recordRows.length; i++) {
        var cells = recordRows.eq(i).find('td');
        if ( i == 0 ){
            cIndex.checkbox = 0;
            for (var j = 1; j < cells.length; j++) {
                switch( cells.eq(j).text() ) {
                    case "Apt #": cIndex.unit = j; break;
                    case "#Bdrm": cIndex.bed = j; break;
                    case "Rent": cIndex.rent = j; break;
                    case "Sq. Footage": cIndex.sqft = j; break;
                    case "#Bthrms": cIndex.bath = j; break;
                    case "Date Available": cIndex.date = j; break;
                    case "Status": cIndex.status = j; break;
                    case "Origin Source": cIndex.origin = j; break;
                }
            }
        }
        else {
            oldListings.push({
                unit: cells.get(cIndex.unit),
                bed: cells.get(cIndex.bed),
                rent: cells.get(cIndex.rent),
                sqft: cells.get(cIndex.sqft),
                bath: cells.get(cIndex.bath),
                date: cells.get(cIndex.date),
                checkbox: cells.get(cIndex.checkbox),
                status: cells.get(cIndex.status),
                origin: cells.get(cIndex.origin)
            });
        }
    }
}

function addTextarea() {
    if ( $('#enterInput').length < 1 ) {
        $('.mediumTxt').before(
            $('<div>').attr('id', "enterInput").css("text-align", "center")
            .text("Paste the sheet for Star Lord contents here:").append('<br>')
            .append( $('<textarea>').attr({ 'id': "sslInfo", 'rows': 10, 'cols': 100 }) )
            .append('<br>').append( $('<button>').text('Add to Star Lord').on('click', getNewListingInfo) )
        );
        $('#addButton').toggle();
    }
}

function toRBDate(stringProvided) {
    var date = new Date( stringProvided.replace(/st|nd|rd|th|\s?-.*?$/gi, "") );
    var now = new Date();
    if( date=="Invalid Date" ){ date = now; }
    if( now.getFullYear() - date.getFullYear() > 1 ) { date.setFullYear( now.getFullYear() ); }
    var dateOfMonth = date.getMonth() + 1;
    if (dateOfMonth < 10) { dateOfMonth = "0" + dateOfMonth; }
    var numOfDate = date.getDate();
    if (numOfDate < 10) { numOfDate = "0" + numOfDate; }
    return dateOfMonth + "/" + numOfDate + "/" + date.getFullYear();
}

var newListings;
function getNewListingInfo() {
    collectRecords();
    console.log('Getting new listings');
    var cIndex = {};
    newListings = [];
    var rows = $('#sslInfo').val().split("\n");
    for ( var i = 0; i < rows.length; i++ ) {
        var cells = rows[i].split(/\t/g);
        if ( i == 0 ) {
            for (var j = 0; j < cells.length; j++) {
                if ( /unit|apt|num/i.test(cells[j]) ) { cIndex.unit = j; }
                else if ( /be?d/i.test(cells[j]) ) { cIndex.bed = j; }
                else if ( /rent|cost/i.test(cells[j]) ) { cIndex.rent = j; }
                else if ( /sq.*?f.*?t/i.test(cells[j]) ) { cIndex.sqft = j; }
                else if ( /ba/i.test(cells[j]) ) { cIndex.bath = j; }
                else if ( /date|avail/i.test(cells[j]) ) { cIndex.date = j; }
            }
            if( !('unit' in cIndex) ) {
                alert("It looks like you didn't provide column headers. I can't tell what's what, please recopy it from your spreadsheet or table.");
                return;
            }
            else{ $('#enterInput').remove(); }
        }
        else {
            newListings.push( {
                unit: cells[ cIndex.unit ].replace(/^[^\d]*?[\#\s]+/gm,""),
                bed: cells[ cIndex.bed ].match(/[\d.]+/)[0],
                rent: Number( cells[ cIndex.rent ].match(/[\d.,]+/)[0].replace(",", "") ).toFixed(0),
                sqft: cells[ cIndex.sqft ].match(/[\d.,]+/)[0],
                bath: Number( cells[ cIndex.bath ].match(/[\d.]+/)[0] ).toFixed(1),
                date: toRBDate( cells[ cIndex.date ] )
            } );
        }
    }
    console.log("This is fresh newListings:", newListings);
    if ( !oldListings[0].unit.querySelector('input') ) { unmarkUpdates(); }
    else { updateRecords(); }
}

function unmarkUpdates() {
    // This is where the box checking script will go
    // Make sure to return a count of new listings that need to be made so user can add that to star lord
}

function updateRecords() {
    // UPDATE
    for ( i = 0; i < oldListings.length; i++ ) {
        for (var j = newListings.length - 1; j >= 0; j--) {
            var AptNumSL = $( oldListings[i].unit ).find('input');
            if ( AptNumSL.val() == newListings[j].unit ) {
                AptNumSL.val( newListings[j].unit );
                oldListings[i].bed.querySelector('select').selectedIndex = bedIndex( newListings[j].bed );
                $( oldListings[i].rent ).find('input').val( newListings[j].rent );
                $( oldListings[i].sqft ).find('input').val( newListings[j].sqft );
                $( oldListings[i].bath ).find('input').val( newListings[j].bath );
                $( oldListings[i].date ).find('input').val( newListings[j].date );
                newListings.splice(j, 1);
                break;
            }
        }
        if ( newListings.length == 0 ) { break; }
    }

    // ADD NEW
    for ( i = 0; i < oldListings.length; i++ ) {
        for (var j = newListings.length - 1; j >= 0; j--) {
            var AptNumSL = $( oldListings[i].unit ).find('input');
            if ( $(oldListings[i].status).text() == "SL Pending" && AptNumSL.val() == "aptnumber" && /Office|Star Lord/i.test( $(oldListings[i].origin).text() ) ) {
                AptNumSL.val( newListings[j].unit );
                oldListings[i].bed.querySelector('select').selectedIndex = bedIndex( newListings[j].bed );
                $( oldListings[i].rent ).find('input').val( newListings[j].rent );
                $( oldListings[i].sqft ).find('input').val( newListings[j].sqft );
                $( oldListings[i].bath ).find('input').val( newListings[j].bath );
                $( oldListings[i].date ).find('input').val( newListings[j].date );
                newListings.splice(j, 1);
                break;
            }
        }
        if ( newListings.length == 0 ) { break; }
    }
    if ( newListings.length > 0 ) { alert("I couldn't find spaces for all the units."); }
        // Need to add a way to display the leftovers
    // alert("Your records have been updated.");
        // Need to find a way to make notification without interferring with work flow, probably a fadeOut div
}

/*
function displayLeftOvers() {
    var table = $('<table>').css('text-align': "center").insertBefore( $('button.smallTxt.left') );
    for (var i = 0; i < newListings.length; i++){
        var tr = $('<tr>').appendTo( $(table) );
        var cells = rows[i].split(/\t/);
        for(var j = 0; j < cells.length; j++){
            if(i==0){ var td = document.createElement('th'); }
            else{ var td = document.createElement('td'); }
            tr.appendChild(td);
            td.innerHTML = cells[j];
        }
    }
}
*/

function bedIndex(testString) {
    if ( /1 split/gi.test(testString) ) { return 2; }
    else if ( /2 split/gi.test(testString) ) { return 4; }
    else if ( /3 split/gi.test(testString) ) { return 6; }
    else if ( /3 split/gi.test(testString) ) { return 6; }
    else if ( /1/gi.test(testString) ) { return 1; }
    else if ( /2/gi.test(testString) ) { return 3; }
    else if ( /3/gi.test(testString) ) { return 5; }
    else if ( /4/gi.test(testString) ) { return 7; }
    else if ( /5/gi.test(testString) ) { return 8; }
    else if ( /6/gi.test(testString) ) { return 9; }
    else if ( /7/gi.test(testString) ) { return 10; }
    else if ( /studio/gi.test(testString) ) { return 11; }
    else { return 12; }
}

