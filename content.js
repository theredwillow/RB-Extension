function addMenu() {

	var observeDOM = (function(){
	    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
	        eventListenerSupported = window.addEventListener;

	    return function(obj, callback){
	        if( MutationObserver ){
	            // define a new observer
	            var obs = new MutationObserver(function(mutations, observer){
	            	// console.log("before mutations:", mutations, "observer:", observer);
	            	mutations = mutations.filter(function(a){ return !(popup["box"].contains(a.target)); });
	            	// console.log("after mutations:", mutations, "observer:", observer);
	            	if ( !mutations.length ) { return; }
                	if ( mutations[0].addedNodes.length || mutations[0].removedNodes.length ) { callback(); }
	            });
	            // have the observer observe foo for changes in children
	            obs.observe( obj, { childList:true, subtree:true });
	        }
	        else if( eventListenerSupported ){
	            obj.addEventListener('DOMNodeInserted', callback, false);
	            obj.addEventListener('DOMNodeRemoved', callback, false);
	        }
	    };
	})();

	// Observe the DOM element:
	observeDOM( document.querySelector('body'), function(){ 
	    chrome.runtime.sendMessage({ "msg": "pass_dom", "dom": $("body").html() });
	});

	// Observe user clicks
	document.querySelectorAll("*").forEach( function(a){
		a.addEventListener('click', function(e){
			if ( e.target !== this || popup["box"].contains(e.target) ) { return; }
			chrome.runtime.sendMessage({ "msg": "pass_click", "element": fullSelector($(a), true) });
	}, false); });

	// Add the menu to the dom
	popup = {};
	popup.box = document.createElement("div");
	popup.box.style.opacity = "0.8";
	popup.box.style.backgroundColor = "green";
	popup.box.style.position = "fixed";
	popup.box.style.top = "0px";
	popup.box.style.zIndex = "9999";
	popup.box.style.boxShadow = "6px 6px 5px #888888";
	popup.box.style.borderRadius = "6px";
	popup.box.style.border = "1px solid #4f4f4f";
	popup.box.style.width = "300px";
	popup.box.style.height = "250px";
	document.querySelector("body").appendChild(popup.box);

	// Add the menu's menubar to the dom
	popup.bar = document.createElement("div");
	popup.bar.style.width = "100%";
	popup.bar.style.backgroundColor = "#aaff66";
	popup.bar.style.position = "relative";
	popup.bar.style.top = "0px";
	popup.bar.style.borderRadius = "6px 6px 0 0";
	popup.bar.style.textAlign = "center";
	popup.bar.style.height = "24px";
	popup.bar.style.cursor = "move";
	popup.box.appendChild(popup.bar);

	popup.bar.addEventListener('mousedown', mouseDown, false);
	window.addEventListener('mouseup', mouseUp, false);

	popup.title = document.createElement("b");
	popup.title.innerHTML = "Untitled Scraper";
	popup.title.style.cursor = "text";
	popup.bar.appendChild(popup.title);
	popup.title.addEventListener("click", function(e) {
		popup.bar.removeEventListener('mousedown', mouseDown, false);
        popup.bar.replaceChild(popup.titleEdit, popup.title);
        popup.bar.style.cursor = "no-drop";
    }, true);

	popup.titleEdit = document.createElement("input");
	popup.titleEdit.value = popup.title.innerHTML;
	popup.titleEdit.addEventListener("focusout", function(e) {
        popup.title.innerHTML = popup.titleEdit.value.replace(/[^a-z0-9]/gi, '_');
        popup.bar.replaceChild(popup.title, popup.titleEdit);
        chrome.runtime.sendMessage({"msg": "change_title", "title": popup.title.innerHTML});
        popup.bar.addEventListener('mousedown', mouseDown, false);
        popup.bar.style.cursor = "move";
    }, true);

}

function mouseUp() {
	window.removeEventListener('mousemove', popupMove, true);
	chrome.runtime.sendMessage({"msg": "move_popup", "x": popup.box.style.left, "y": popup.box.style.top});
}

function mouseDown(e) {
	offset.x = e.clientX - popup.box.offsetLeft;
	offset.y = e.clientY - popup.box.offsetTop;
	window.addEventListener('mousemove', popupMove, true);
}

function popupMove(e) {
	var top = e.clientY - offset.y;
	var left = e.clientX - offset.x;
	popup.box.style.top = top + 'px';
	popup.box.style.left = left + 'px';
}

function setPage(pageName) {
	pageName = pageName || "title";
	switch(pageName) {
	    case "title":
	        // Adding the content to the popup menu, don't use innerHTML bc it removes listeners
			popup.content = document.createTextNode("If this is the page you want the scraper to start on, please create a title. If it's not, please close this extension and open it when you are on the main page of the apartment complex.");
	        break;
	    case "description":
	        code block
	        break;
	    case "pets":
	        code block
	        break;
	    case "contact":
	        code block
	        break;
	    case "amenities":
	        code block
	        break;
	    case "units":
	        code block
	        break;
	    default:
			popup.content = document.createTextNode("There was an error, please have someone check this extension's code.");
	}
	popup.box.appendChild(popup.content);
}

// Get the full CSS selector of a given jQuery element
function fullSelector(elementGiven, idBoolean, classBoolean) {
	idBoolean = idBoolean || false;
	classBoolean = classBoolean || true;
	return elementGiven.parents().map(function(){
		var selector = $(this).prop('nodeName');
		var attrId = $(this).attr("id");
		if ( idBoolean && attrId ) { selector += "#" + attrId; }
		var attrClass = $(this).attr("class");
		if ( classBoolean && attrClass ) { selector += "." + attrClass.replace(/\s/g, "."); }
		return selector;
	}).get().reverse().join(" > ") + " > " + elementGiven.prop('nodeName');
}

// Catches the dom at the very beginning to watch for liveScrape-necessary changes
var dom = $("body").html();
var popup;
var offset = { x: 0, y: 0 };

// Askes background if menu needs to be displayed initially
chrome.runtime.sendMessage({"msg": "ask_edit"}, function(response) {
	if (response.tabInEdit) {
		addMenu();
		popup.box.style.top = response.tabInEdit.y;
		popup.box.style.left = response.tabInEdit.x;
		popup.title.innerHTML = response.tabInEdit.title;
		// response.tabInEdit.page
		chrome.runtime.sendMessage({"msg": "add_url", "dom": dom});
	}
});

// Listens for messages from background script
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

	    // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
	    // console.log("request", request);

	    // If the background script requests the starting dom, send it
	    if (request.msg == "browserAction_clicked") {
	    	// console.log("browserAction_clicked, popup:", popup);
	    	if (popup == null) {
		    	chrome.runtime.sendMessage({"msg": "start", "dom": dom}, function(response) {
					console.log("Sent dom.");
					addMenu();
				});
	    	}
	    	else if ( confirm("Are you sure you want to cancel this scraper?") ) {
	    		// console.log("Closed menu.");
	    		document.querySelector("body").removeChild(popup.box);
	    		popup = null;
				window.removeEventListener('mouseup', mouseUp, false);
	    		chrome.runtime.sendMessage({"msg": "remove_scraper"});
	    	}
	    }

});
