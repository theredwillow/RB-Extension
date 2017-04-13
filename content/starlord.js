//starlord.js

// Helps get entries in faster

$(window).arrive('button.smallTxt.left', function(){
    $('button.smallTxt.left').on('click', addTextarea );
});

function addTextarea() {
    if ( $('#enterInput').length < 1 ) {
        $('.mediumTxt').before(
            $('<div>').attr('id', "enterInput").css("text-align", "center")
            .text("Paste the sheet for Star Lord contents here:").append('<br>')
            .append( $('<textarea>').attr({ 'id': "sslInfo", 'rows': 10, 'cols': 100 }) )
            .append('<br>').append( $('<button>').text('Add to Star Lord').on('click', getNewListingInfo) )
        );
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
    return stringProvided.replace(/st|nd|rd|th/gi, "") + "->>" + dateOfMonth + "/" + numOfDate + "/" + date.getFullYear();
}

var newListings = [];
function getNewListingInfo() {
    var cIndex = {};
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
        }
        else {
            newListings.push( {
                unit: cells[ cIndex.unit ].replace(/^[^\d]*?[\#\s]+/gm,""),
                bed: cells[ cIndex.bed ].match(/[\d.]+/)[0],
                rent: Number( cells[ cIndex.rent ].match(/[\d.,]+/)[0].replace(",", "") ).toFixed(0),
                sqft: cells[ cIndex.sqft ].match(/[\d.,]+/)[0],
                bath: cells[ cIndex.bath ].match(/[\d.]+/)[0],
                date: toRBDate( cells[ cIndex.date ] )
            } );
        }
    }
    $('#enterInput').remove();
    console.log(newListings);
}

function myFunction() {
	$("#enterInput").toggle();
	var text = document.getElementById("myText").value;

    var newTable = document.createElement('table');
    newTable.id = "newTable";
    newTable.style.textAlign = "center";
    newTable.style.border = '2px solid black';
    document.body.appendChild(newTable);
    var rows = text.split("\n");
    for (var i = 0; i < rows.length; i++){
        var tr = document.createElement('tr');
        newTable.appendChild(tr);
        var cells = rows[i].split(/\t/);
        for(var j = 0; j < cells.length; j++){
            if(i==0){ var td = document.createElement('th'); }
            else{ var td = document.createElement('td'); }
            tr.appendChild(td);
            td.innerHTML = cells[j];
        }
    }
}
