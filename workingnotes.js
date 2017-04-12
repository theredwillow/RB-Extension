
tabShortcuts = {
	NA: "NO ANSWER",
	DNC: "DO NOT CALL",
	PDC: "PERMISSION TO POST W/O CALLING",
	P2P: "PERMISSION TO POST W/O CALLING, but not necessarily opposed to being called",
	ML: "LEFT MESSAGE",
	ACQ: "GOT IT",
	REJ: "NOT INTERESTED",
	UP: "UPDATED",
	RNT: "RENTED"
}




// Options page
function load_options() {
   chrome.storage.local.get('repl_adurl', function(items) {
       alert(items.repl_adurl);
   });
}
function save_options() {
   chrome.storage.local.set({
       repl_adurl: "hello world"
   });
}


    var changeInValue = this.value.replace(previousValue, "");
    if( changeInValue.match(/\d/g).length != 1 && changeInValue.match(/\d/g).length != 10 ) {
        var warningPlace = $("tr:has(#phone1)").get(1);
        warningPlace.innerHTML += '<td id=\"warning\" style=\"font-size: 12px\">';
        warningPlace.innerHTML += '<span style=\"color: red; font-weight: bold;\">WARNING!</span>';
        warningPlace.innerHTML += '<br>What you posted doesn\'t seem to be a phone number.<br>'
        warningPlace.innerHTML += '\"' + changeInValue + '\"</td>';
    }



$("#QQQ").on({
    "input": function(e) {
        console.log( previousValue + " -> " + this.value );
        if( this.value.length > previousValue.length ) {
            var valueAdded = this.value.replace(previousValue, "");
            var digitsAdded = valueAdded.match(/\d/g);
            if ( digitsAdded ) {
                digitsAdded = digitsAdded.length;

                console.log("Here is your logic: ");
                console.log("You pressed a control key: " + Boolean(e.ctrlKey||e.metaKey) + " which was negated: " + !(e.ctrlKey||e.metaKey));
                console.log("You pressed a regular key: " + Boolean(e.keyCode));
                console.log("These two were combined to equal: " + (!(e.ctrlKey||e.metaKey) && e.keyCode) + " which was then negated: " + !(!(e.ctrlKey||e.metaKey) && e.keyCode) )
                console.log("The other half is digitsadded not 10, it equals " + digitsAdded + ", so it's " + (digitsAdded!=10) );
                console.log("Finally the result of adding the two sides is " + ( !(!(e.ctrlKey||e.metaKey) && e.keyCode) && digitsAdded!=10 ) );

                if ( !(!(e.ctrlKey||e.metaKey) && e.keyCode) && digitsAdded!=10 ) {
                    console.log('This is how many digits were added: ' + digitsAdded);
                    $("#hiddenWarning").css("display", "inline");
                    $("#warning").get(0).innerHTML = 'What you pasted doesn\'t seem to be a phone number.<br>'
                    $("#warning").get(0).innerHTML += '\"' + valueAdded + '\"';
                    $("#hiddenWarning").fadeOut( 2000, function() {
                        $("#warning").get(0).innerHTML = "";
                    } );
                }
            }
        }
        sendPhone( this.value );
        previousValue = this.value;
    },
    "keyup": function(e) {
        if( e.keyCode == 13 ) { $("button:contains('Search')").click(); }
    }
});