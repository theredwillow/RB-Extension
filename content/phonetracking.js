// phone-tracking.js

// Help improve phone tracking usability,
// with this simple content script that injects some javascript into your browser.

try {
    // Hide original inputs
    document.getElementById('phone1').type = 'hidden';
    document.getElementById('phone2').type = 'hidden';
    document.getElementById('phone3').type = 'hidden';
    console.log("This script seems to be able to access the DOM.");
    }
catch(err) {
    throw "This script can't seem to access the DOM.";
}

// Create new input
$("td:has(>#phone1)").append( $('<input>').attr({ 'id': 'QQQ', 'type': 'text', 'title': 'QQQ!', 'placeholder': '###-###-####' }) );

// Create a location for autosuggestions
$('#comments_box').parent().append("<br>").append( $('<span>').attr('id', "autoOptions") );

var hidWarning = $('<td>').attr('id', 'hiddenWarning').css("display", "none");
var warnWord = $('<span>').text("WARNING!");
warnWord.css({ "color": "red", "font-weight": "bold", "font-size": "12px" });
hidWarning.append(warnWord).append('<br>');
hidWarning.append( $('<span>').attr({'id': 'warning'}).css("font-size", "11px") ).append('<br>');
hidWarning.append( $('<span>').attr({'id': 'clipboard'}).css("font-size", "9px") );
$("tr:has(#phone1)").eq(1).append(hidWarning);

function displayWarning(errorCode, situationalData, time) {
    $("#warning").eq(0).text(errorCode);
    if(situationalData) { $("#clipboard").eq(0).text( '\"' + situationalData + '\"' ); }
    else { $("#clipboard").eq(0).text(""); }
    $("#hiddenWarning").css("display", "inline");
    if(!time) { var time = 0.75; }
    time = time * 1000;
    fadeTime = time * 0.2;
    showTime = time * 0.8;
    setTimeout( function() { $("#hiddenWarning").fadeOut( fadeTime ); }, showTime);
}

function sendPhone(providedString) {
    document.getElementById("QQQ").value = providedString
        .replace(/zero/gi, '0')
        .replace(/one|juan|won/gi, '1')
        .replace(/two|to|too/gi, '2')
        .replace(/three/gi, '3')
        .replace(/four|for/gi, '4')
        .replace(/five/gi, '5')
        .replace(/six/gi, '6')
        .replace(/seven/gi, '7')
        .replace(/eight|ate/gi, '8')
        .replace(/nine/gi, '9')
        .match(/\d*/g).join('')
    ;
    if( document.getElementById("QQQ").value.length > 10 ){
        displayWarning('You entered too many digits.');
    }
    document.getElementById("QQQ").value = document.getElementById("QQQ").value
        .match(/(\d{0,3})(\d{0,3})(\d{0,4})/).slice(1).join('-')
        .replace(/-*$/g, '')
    ;
    var phone = document.getElementById("QQQ").value.split('-');
    document.getElementById('phone1').value = phone[0] || "";
    document.getElementById('phone2').value = phone[1] || "";
    document.getElementById('phone3').value = phone[2] || "";
}

function getTheDate(tense='present') {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if ( tense == 'future' ) { yyyy += 1000; }
    if( dd < 10 ) { dd = '0' + dd; } 
    if( mm < 10 ) { mm = '0' + mm; } 
    var today = mm + '/' + dd + '/' + yyyy;
    $("#options_container input").eq(0).val( today.toString() );
}

function addNote(textAdded) {
    $('#autoOptions').html("");
    var commentsBox = $("#comments_box").get(0);
    var strLength = commentsBox.value.length;
    var i = 0;
    var testStr = commentsBox.value.substring(i, strLength);
    while(i <= strLength) {
        if( textAdded.indexOf( testStr.toUpperCase() ) > -1 ) {
            commentsBox.value = commentsBox.value.replace(new RegExp(testStr + '$'), "");
            break;
        }
        testStr = commentsBox.value.substring(i++, strLength);
    }
    commentsBox.value += textAdded + ". ";
    if( textAdded.indexOf("PERMISSION") > -1 ) {
        displayWarning('Date and status were changed.', null, 1.5);
        $('#dd_Options').val(4);
        getTheDate('future');
    }
    else if( textAdded == "NO ANSWER" || textAdded == "VOICEMAIL BOX WAS FULL") {
        displayWarning('Status was changed.', null, 1.5);
        $('#dd_Options').val(1);
    }
    else if( textAdded == "LEFT MESSAGE") {
        displayWarning('Status was changed.', null, 1.5);
        $('#dd_Options').val(2);
    }
    else if( textAdded != "RENTED" && textAdded != "UPDATED" ) {
        displayWarning('Status was changed.', null, 1.5);
        $('#dd_Options').val(4);
    }
}

// Look for get variables
function getQueryVariable(variable) {
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for ( var i=0; i < vars.length; i++ ) {
            var pair = vars[i].split("=");
            if( pair[0] == variable ){ return unescape(pair[1]); }
       }
       return(false);
}

if( getQueryVariable("phone") ) {
    sendPhone( getQueryVariable("phone") );
    $("button:contains('Search')").click();
}

$("#QQQ").on('keyup paste input', function(e){
    switch( e.type ) {
        case 'keyup':
            if( e.keyCode == 13 )
                $("button:contains('Search')").click();
        break;

        case 'paste':
            var pasteData = e.originalEvent.clipboardData.getData('text');
            var digitsAdded = pasteData.match(/\d/g);
            if( digitsAdded ) { digitsAdded = digitsAdded.length; }
            else { digitsAdded = 0; }  
            if ( digitsAdded!=10 ) {
                displayWarning('What you pasted doesn\'t look like a phone number', pasteData, 5);
            }
        break;

        default:
            var start = this.selectionStart,
                end = this.selectionEnd;
            sendPhone( this.value );
            this.setSelectionRange(start, end);
    }
});

// Add today and future buttons
$("#options_container input").on('focus', function(e){
    $('.a_popupAnchor').append( $('<button>')
        .text('Today').attr('onclick', 'getTheDate();')
        .css({ 'background-color': '#b3b3ff', 'padding': '3px 3px', 'font-size': '10px' } ) )
     .append( $('<button>')
        .text('Future').attr('onclick', 'getTheDate(\"future\");')
        .css({ 'background-color': '#b3b3ff', 'padding': '3px 3px', 'font-size': '10px' } )
    );
} );

$("button:contains('Reset')").on('click', function() {
    document.getElementById("QQQ").value = "";
    document.getElementById("comments_box").value = "";
    document.getElementById("emailInput").value = "";
    $('#dd_Options').val(0);
    getTheDate();
});

$("button:contains('Search')").on('click', function() {
    waitForNotes = setInterval( function() { checkPhoneNotes() }, 500);
});

$("#comments_box").on('input', function(e){
    var strLength = this.value.length;
    $('#autoOptions').html("");
    var predictions = tabShortcuts.concat( URLsInNotes );
    console.log(predictions);
    for (var key in predictions) {
        var i = strLength - 3;
        var testStr = this.value.substring(i, strLength).toUpperCase();
        while(i > -2) {
            if( predictions[key].indexOf(testStr) < 0 ) { break; } // No chance of matching
            if( predictions[key].startsWith(testStr) && testStr != predictions[key] ) {
                $('#autoOptions').append( $("<button>").text( predictions[key].replace(/s\:\/\/hotpads.com\//gi, "<img src=\'/images/hotpads.png\'>") )
                    .attr('onclick', "addNote(\'" + predictions[key] + "\');")
                    .css({ "background-color": "#b3b3ff", "padding": "3px 3px", "font-size": "10px" })
                );
                break;
            }
            testStr = this.value.substring(i--, strLength).toUpperCase();
        }
    }
});

tabShortcuts = [
    "NO ANSWER",
    "DO NOT CALL",
    "PERMISSION TO POST W/O CALLING",
    "PERMISSION TO POST W/O CALLING, but not necessarily opposed to being called",
    "LEFT MESSAGE",
    "GOT IT",
    "FOLLOW UP",
    "VOICEMAIL BOX WAS FULL",
    "NOT INTERESTED",
    "UPDATED",
    "RENTED"
];

var waitForNotes = setInterval( function () { checkPhoneNotes() }, 500);
var previousNotes = $("#viewnotes_holder").text();
var checkCount = 0;
var URLsInNotes = [];

function checkPhoneNotes() {
    if ( $("#viewnotes_holder").text() != previousNotes ) {
        clearInterval( waitForNotes );
        previousNotes = $("#viewnotes_holder").text();
        checkCount = 0;
        URLsInNotes = $("#viewnotes_holder").text().match(/http.*?(?=[\s\n])/gi).filter(
            function( item, index, inputArray ) {
                return inputArray.indexOf(item) == index;
            }
        );
        URLsInNotes = URLsInNotes.map(function(x){ return x.toUpperCase() });
        // .replace("s://hotpads.com/", "<img src=\'/images/hotpads.png\'>")
    }
    else if ( checkCount==10 ) {
        clearInterval( waitForNotes );
        checkCount = 0;
    }
    else { checkCount++; }
}
