//zillow.js
//This file is used to store functions that zillow needs to scrape.

// This is where you'll add a displayError function to display an error message
// NLF.admin: nextListing called when there were no LISTINGS
// NLF.user: No listings found
// ###.url
//All errors end with "If you think this is an error in this script, please press here."

//This is where you'll add a sendError function to send errors to the server

// TEST ACCOUNT INFORMATION
// ACCOUNT: o779819@mvrht.com
// PASSWORD: password

var LISTINGS = "div.zsg-photo-card-content";
var LISTING_POPUP = "#search-detail-lightbox";
var AGENT_BADGE = ".agent-badge";
var HIDE_BUTTON = ".hide-button";
var OWNER_INFO = ".property-info:not(.prominent-contact-phone):gt(4):lt(6)";
var PHONE_NUMBER = ".posting-info .prominent-contact-phone";
var CLOSE_BUTTON = ".hc-back-to-list";
var LOGIN_BOX = "#register_content";
var HIDDEN_PROPERTY = "#hidden-property-hdp-label";

//Used to capture keyboard presses
document.onkeypress = function(evt) {
	evt = evt || window.event;
	switch (evt.keyCode) {
		case 45: // Minus sign on numpad
			nextListing();
			break;
		case 42: // Asterisk sign on numpad
			saveListing();
	}
};

function waitFor(information) {

    if(!('element' in information)) {
        console.log("There was an error because no element was provided.");
        return;
    }
    if(!('action' in information)) { information.action = function () {}; }
    if(!('time' in information)) { information.time = 3; }
    if(!('statement' in information)) { information.statement = true; }
    if(!('error' in information)) {
        information.error = "There was a timeout error while waiting for something to ";
        if(information.statement) { information.error += "load."; }
        else { information.error += "disappear."; }
    }

    var i = 0;
    information.time = (information.time * 2) - 1;
    var myVar = setInterval(myTimer, 500);

    function myTimer() {
		console.log("I\'m on loop number " + i + " and I\'m looking for this to be " + information.statement);
		console.log(information.element);

        if ( information.element.length == information.statement ) {
            clearInterval(myVar);
            information.action();
        }
        else if ( i == information.time ) {
            clearInterval(myVar);
            console.log(information.error);
        }
        else {
            i++;
        }
    }
}

var nextListing = function () {
	$('#search-detail-lightbox_content').unbindLeave();
	if ( $(CLOSE_BUTTON).length ) {
		$('#search-detail-lightbox_content').leave( CLOSE_BUTTON, { onceOnly: true }, nextListing );
		console.log('Next listing has been activated and there is a close button.');
		hideListing();
	}
	else if ( !$(LISTINGS).length ) {
		console.log('I found no listings.');
		//displayError("NLF");
	}
	else {
		console.log("I'm clicking into the next listing, #" + currentListing);
	    $(LISTINGS).eq(currentListing).click();
	}
}

function checkInfo() {
	if ( $(AGENT_BADGE) ) {
	    // reject
	    hideListing();
	}
	var ownerInfo = $(OWNER_INFO).text().trim();
	var phone = $(PHONE_NUMBER).eq(0).text();
}

function hideListing() {
	if ( $(HIDE_BUTTON).length ) {
		console.log('I\'m waiting on the hidden box now');
		setTimeout(function(){ $(HIDE_BUTTON).eq(0).click(); }, 1000);
		$('#search-detail-lightbox_content').arrive( HIDDEN_PROPERTY, { onceOnly: true }, function () {
			console.log('The hidden box came.');
			$(CLOSE_BUTTON).eq(0).click();
		});
	}
	else {
		currentListing++;
		console.log('I couldn\'t find a hide button so I moved the count up to ' + currentListing);
		$(CLOSE_BUTTON).eq(0).click();
	}
}

var currentListing = 0;
// Display dialog "RB Extension works on this website, press - to go to the next listing"
