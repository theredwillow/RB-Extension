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

	    switch (request.msg) {

		    case "ask_edit": // If content.js is asking if menu is already open
		    	// console.log("Checking to see if there is an edit for tab id", sender.tab.id);
		    	var respondWith = false;
				for (var index in websitesInEdit) {
					if (index == sender.tab.id) {
					    respondWith = {};
					    respondWith.x = websitesInEdit[sender.tab.id].x;
					    respondWith.y = websitesInEdit[sender.tab.id].y;
					    respondWith.title = websitesInEdit[sender.tab.id].title || "Untitled Scraper";
					    respondWith.page = websitesInEdit[sender.tab.id].page;
					    respondWith.details = websitesInEdit[sender.tab.id].details;
					    break;
					}
				}
		    	sendResponse({"msg": "respond_edit", "tabInEdit": respondWith});
		        break;

		    case "start":  // If the message has the starting dom, add it to websitesInEdit
				websitesInEdit[sender.tab.id] = {
					[sender.tab.url]: {
						"dom" : {
							[Date.now()] : request.dom
						},
						"click": {},
						"selectors": {},
						"origin": true
					},
					"page": "title",
					"details": {},
					"x": "0px",
					"y": "0px"
				};
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {"msg": "change_page", "page": "title"});
				});
				console.log("websitesInEdit is now:", websitesInEdit);
		        break;

		    case "move_popup":
		    	console.log("Window in tab", sender.tab.id, "moved to x:", request.x, "y", request.y);
		    	websitesInEdit[sender.tab.id].x = request.x;
		    	websitesInEdit[sender.tab.id].y = request.y;
		    	break;

		    case "add_url":
			    if ( !(sender.tab.url in websitesInEdit[sender.tab.id]) ) {
					websitesInEdit[sender.tab.id][sender.tab.url] = {
						"dom": { [Date.now()] : request.dom },
						"click": {},
						"selectors": {},
						"origin": false
					};
			    }
		    	break;

		    case "pass_click":
		    	websitesInEdit[sender.tab.id][sender.tab.url]["click"][Date.now()] = request.element;
		    	break;

		    case "pass_dom":
		    	websitesInEdit[sender.tab.id][sender.tab.url]["dom"][Date.now()] = request.dom;
		    	break;

		    case "change_title":
		    	websitesInEdit[sender.tab.id].title = request.title;
		    	if ( websitesInEdit[sender.tab.id].page == "title" ) {
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						chrome.tabs.sendMessage(tabs[0].id, {"msg": "change_page", "page": "main"});
					});
				}
		    	break;

		    case "record_pageChange":
		    	websitesInEdit[sender.tab.id].page = request.page;
		    	websitesInEdit[sender.tab.id].details = request.details;
		    	break;

		    case "remove_scraper":
		    	delete websitesInEdit[sender.tab.id];
		    	break;

		}

	}
);
