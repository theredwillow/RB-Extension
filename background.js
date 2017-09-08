var websitesInEdit = {};

// Action to be performed when the extension button is pressed
chrome.browserAction.onClicked.addListener(function(tab) {

	// Tell content.js about browserAction
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {"msg": "browserAction_clicked"}, function(response) {
			// console.log("Told content script about browserAction");
		});
	});

});

// Receives messages
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

	    // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request);

	    // If content.js is asking if menu is already open
	    if (request.msg == "ask_edit") {
	    	// console.log("Checking to see if there is an edit for tab id", sender.tab.id);
	    	var respondWith = false;
			for (var index in websitesInEdit) {
				if (index == sender.tab.id) {
				    respondWith = {};
				    respondWith.x = websitesInEdit[sender.tab.id].x;
				    respondWith.y = websitesInEdit[sender.tab.id].y;
				    respondWith.title = websitesInEdit[sender.tab.id].title || "Untitled Scraper";
				    respondWith.page = websitesInEdit[sender.tab.id].page;
				    break;
				}
			}
	    	sendResponse({"msg": "respond_edit", "tabInEdit": respondWith});
	    }

	    // If the message has the starting dom, add it to websitesInEdit
	    else if (request.msg == "start") {
			websitesInEdit[sender.tab.id] = {
				[sender.tab.url] : {
					"dom" : {
						[Date.now()] : request.dom
					},
					"click" : { },
					"origin" : true
				},
				"page": "title",
				"x" : "0px",
				"y" : "0px"
			};
			console.log("websitesInEdit is now:", websitesInEdit);
	    }

	    else if (request.msg == "move_popup") {
	    	console.log("Window in tab", sender.tab.id, "moved to x:", request.x, "y", request.y);
	    	websitesInEdit[sender.tab.id].x = request.x;
	    	websitesInEdit[sender.tab.id].y = request.y;
	    }

	    else if (request.msg == "add_url" && !(sender.tab.url in websitesInEdit[sender.tab.id]) ) {
			websitesInEdit[sender.tab.id][sender.tab.url] = {
				"dom" : { [Date.now()] : request.dom },
				"click" : { },
				"origin" : false
			};
	    }

	    else if (request.msg == "pass_click") {
	    	websitesInEdit[sender.tab.id][sender.tab.url]["click"][Date.now()] = request.element; 
	    }

	    else if (request.msg == "pass_dom") {
	    	websitesInEdit[sender.tab.id][sender.tab.url]["dom"][Date.now()] = request.dom; 
	    }

	    else if (request.msg == "change_title") {
	    	websitesInEdit[sender.tab.id].title = request.title; 
	    }

	    else if (request.msg == "remove_scraper") {
	    	delete websitesInEdit[sender.tab.id]; 
	    }

	}
);
