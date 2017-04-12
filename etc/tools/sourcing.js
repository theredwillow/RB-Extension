//sourcing.js
//This file is used to store functions that all the sourcing scripts need to run.

//Used to capture keyboard presses
document.onkeypress = function(evt) {
	evt = evt || window.event;
	switch (evt.keyCode) {
		case 45: // Minus sign on numpad
			nextListing();
			break;
		case 42: // Asterisk sign on numpad
			saveListing();
			break;
		case 13: // Enter
			collectListings();
	}
};

//Used to fake mouse clicks
var dispatchMouseEvent = function(target, var_args) {
	var e = document.createEvent("MouseEvents");
	e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
	target.dispatchEvent(e);
};

//Used as a makeshift way to get javascript to pause
function wait(ms) {
	var d = new Date();
	var d2 = null;
	do { d2 = new Date(); }
	while(d2-d < ms);
}

function collectListings() {
	var list = document.querySelectorAll('ul.photo-cards div.zsg-photo-card-content.zsg-aspect-ratio-content');
	
}

function infoWindow(text) {
	var newwindow = document.createElement('div');
	document.body.appendChild(newwindow);

	var titlebar = document.createElement('div');
	newwindow.appendChild(titlebar);
	var title = document.createTextNode("Rental Beast Extension");
	titlebar.appendChild(title);

	var closebutton = document.createElement('span');
	titlebar.appendChild(closebutton);
	var thebutton = document.createTextNode("X");
	closebutton.appendChild(thebutton);

	var textInside = document.createTextNode(text);
	newwindow.appendChild(textInside);

	newwindow.style.position = "fixed";
    newwindow.style.bottom = "25px";
    newwindow.style.left = "10px";
    newwindow.style.width = "200px";
    newwindow.style.height = "100px";
    newwindow.style.backgroundColor ="white";
    newwindow.style.border = "1px solid black";

    titlebar.style.backgroundColor = "grey";
    titlebar.style.fontWeight = "bold";
    titlebar.style.width = "100%";
    titlebar.style.height = "20px";
    titlebar.style.padding = "1px";

    closebutton.style.position = "relative";
    closebutton.style.fontFamily = "Arial, Times, sans-serif";
    closebutton.style.height = "15px";
    closebutton.style.width = "15px";
    closebutton.style.borderRadius = "7px";
    closebutton.style.fontSize = "13px";
    closebutton.style.backgroundColor = "red";
    closebutton.style.border = "1px solid black";
    closebutton.style.float = "right";
    closebutton.style.textAlign = "center";
    closebutton.style.verticalAlign = "middle";
    closebutton.style.lineHeight = "15px";
    //closebutton.onClick = document.body.remove(newwindow);
}

function establishConnection(contentSite) {
	//console.log("The " + contentSite + " content script started up and is asking the background script for its unhideable URL's.");
	var port = chrome.runtime.connect({name: "unhideableURLs"});
	port.postMessage({need: "ask for urls", site: contentSite});

	port.onMessage.addListener(function(msg) {
		if (msg.need == "give the urls") {
			//console.log("The content script has received the list of unhideable URL's: " + msg.URLs);
			var listings = document.querySelectorAll(window.LISTING);
			window.listings = [];
			for (var i = 0; i <= listings.length; i++) {
				if (msg.URLs.indexOf(listings[i].href) == -1) {
					window.listings.push(listings[i]);
				}
			}
  		}
	});
}
