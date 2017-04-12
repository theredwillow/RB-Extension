//zillow.js
//This file is used to store functions that zillow needs to scrape.

// Variable bin
// This is used to hold constant variables. If the website changes, edit them here so the script will now what to do.
window.LISTING = "a.zsg-photo-card-overlay-link.routable.hdp-link";
var HIDE = "span.hpm-hide-event.hide-button.zsg-toolbar-button.zsg-button";
var CLOSE = "button.zsg-toolbar-button.zsg-button.hc-back-to-list";

function closeListing() {
	var hidebutton = document.querySelector(HIDE);
	if (hidebutton == null) {
		console.log("No hide button found.");
	}
	else {
		dispatchMouseEvent(hidebutton, 'click', true, true);
		console.log("Hide button clicked.");
	}
	dispatchMouseEvent(document.querySelector(CLOSE), 'click', true, true);
}

function nextListing() {
	//console.log("The Zillow script has the list of URLs: " + window.unhideableURLs);
	if ( document.querySelector(CLOSE) != null ) {
		console.log("Close button found, closing before next listing opens.");
		closeListing();
		//wait(5000);
	}
	console.log('I\'m trying to press the ' + cc + 'th element right now.');
	dispatchMouseEvent(window.listings[cc++], 'click', true, true);
	console.log("Next listing should be opened by now.");
}

function saveListing() {
}

establishConnection("zillow");
var cc = 0; //Click counter

if ( document.querySelector('div#list-results') ){ //If this is a search page
	infoWindow('hello');
}
else { //If this is a listing page

}
