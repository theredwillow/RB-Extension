function addMenu() {

	var observeDOM = (function(){
	    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
	        eventListenerSupported = window.addEventListener;

	    return function(obj, callback){
            // define a new observer
            obs = new MutationObserver(function(mutations, observer){
            	// console.log("before mutations:", mutations, "observer:", observer);
            	mutations = mutations.filter(function(a){ return !(popup.box.contains(a.target)); });
            	// console.log("after mutations:", mutations, "observer:", observer);
            	if ( !mutations.length ) { return; }
            	if ( mutations[0].addedNodes.length || mutations[0].removedNodes.length ) { callback(); }
            });
            // have the observer observe foo for changes in children
            obs.observe( obj, { attributes:true, characterData:true, childList:true, subtree:true });
	    };
	})();

	// Observe user clicks
	$("*").on("mousedown", pageClick);

	// Add the menu to the dom
	popup = {};
	popup.box = document.createElement("div");
	popup.box.id = "popUpBox";
	popup.box.style.backgroundColor = "green";
	popup.box.style.position = "absolute";
	popup.box.style.top = "0px";
	popup.box.style.zIndex = "900";
	popup.box.style.boxShadow = "6px 6px 5px #888888";
	popup.box.style.borderRadius = "6px";
	popup.box.style.border = "1px solid #4f4f4f";
	popup.box.style.width = "300px";
	popup.box.style.height = "270px";
	popup.box.style.opacity = "0.8";
	popup.box.onmouseover = function () { this.style.opacity = "0.95"; };
	popup.box.onmouseout = function () { this.style.opacity = "0.7"; };
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
	popup.bar.style.padding = "5px 3px 5px 3px";
	popup.box.appendChild(popup.bar);

	// Add a div to hold content so menubar stays at top
	popup.contentBox = document.createElement("div");
	popup.contentBox.style.textAlign = "center";
	popup.contentBox.style.overflowY = "auto";
	popup.contentBox.style.width = "100%";
	popup.contentBox.style.height = "91%";
	popup.contentBox.style.padding = "12px 7px 12px 7px";
	popup.contentBox.style.zIndex = "1000";
	// Keep the window from moving while scrolling div
	$(popup.contentBox).hover(
		function() {
			var oldScrollPos = $(window).scrollTop();
	  		$(window).on(
  				'scroll.scrolldisabler',
  				function(e) {
    				$(window).scrollTop(oldScrollPos);
    				e.preventDefault();
	  			}
	  		);
		},
		function() {
	  		$(window).off('scroll.scrolldisabler');
		}
	);
	popup.box.appendChild(popup.contentBox);

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
	var swapOutEdit = function() {
        popup.title.innerHTML = popup.titleEdit.value.replace(/[^a-z0-9]/gi, '_');
        popup.bar.replaceChild(popup.title, popup.titleEdit);
        chrome.runtime.sendMessage({"msg": "change_title", "title": popup.title.innerHTML});
        popup.bar.addEventListener('mousedown', mouseDown, false);
        popup.bar.style.cursor = "move";
    }
	popup.titleEdit.onkeyup = function(e){ if (e.keyCode == 13) { swapOutEdit(); } };
	popup.titleEdit.addEventListener("focusout", swapOutEdit);

	// Observe the DOM element:
	observeDOM( document.querySelector('body'), function(){ 
	    chrome.runtime.sendMessage({ "msg": "pass_dom", "dom": $("*:not(#popUpBox,#popUpBox *)").html() });
	    // Solution for div mutated and overlapping? $("#popUpBox").detach().append($(this));
	});

}

function pageClick(e) {
	if ( !popup.box.contains(e.target) ) {
		var elementSelector = fullSelector($(e.target), true);
		console.log("An element on the page was clicked: " + elementSelector, e.target);
		// console.log("View contents of target:", e.target);
		// console.log("View contents of popup.box:", popup.box);
		chrome.runtime.sendMessage({ "msg": "pass_click", "element": elementSelector });
	}
	e.stopPropagation();
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

function findElementOver(e) {
    e.stopPropagation();
    prevColor = this.style.background;
    $(this).css('background', 'lightgrey');
}

function findElementOut(e) {
    e.stopPropagation();
    $(this).css('background', prevColor);
}

function findElementRightClick(e) {
    e.stopPropagation();
    e.preventDefault();
    $(this).css('background', prevColor);
	console.log(this);
}

function setPage(pageName, details) {
	pageName = pageName || "title";
	details = details || {};
	for (var prop in popup.content) {
    	if (!popup.content.hasOwnProperty(prop)) { continue; }
    	popup.contentBox.removeChild(popup.content[prop]);
	}
	popup.content = {};
	popup.content.a_text = document.createElement("span");

	switch(pageName) {

	    case "title":  // This page warns you that you haven't named your scraper yet
	        // Adding the content to the popup menu, don't use innerHTML bc it removes listeners
			popup.content.a_text.innerHTML = "<b>Welcome to the Scraper Maker app!</b><br>";
			popup.content.a_text.innerHTML += "<br>";
			popup.content.a_text.innerHTML += "If this is the main page (where you want the scraper to begin), please create a title (by clicking the title bar above).<br>";
			popup.content.a_text.innerHTML += "<br>";
			popup.content.a_text.innerHTML += "However, if this is not the first page the scraper should visit, please close this and re-open it when you are on the main page of the apartment complex.<br>";
			popup.content.a_text.innerHTML += "<br>";

	        popup.content.b_cancel = document.createElement("button");
	        popup.content.b_cancel.innerHTML = "Cancel";
	        popup.content.b_cancel.onclick = closeScraper;
	        break;

	    case "main":  // This page tells you what you have left to add
	    	popup.content.a_text.innerHTML += "Click the element below that you'd like to add to the scraper.<br>";
	    	popup.content.a_text.innerHTML += "<br>";

	    	// Add the links and info about information programatically
	    	for (var i = 0; i < infoNeeds.length; i++) {
		        popup.content[ "b_" + infoNeeds[i] ] = document.createElement("a");
		        popup.content[ "b_" + infoNeeds[i] ].innerHTML = infoNeeds[i];
		        popup.content[ "b_" + infoNeeds[i] ].onclick = function() { setPage("getData", {"type": this.innerHTML}); };
		        popup.content[ "b_" + infoNeeds[i] + "_br" ] = document.createElement("br");
	    	}

	    	break;

	    case "getData":
	    	popup.content.b_return = document.createElement("a");
	    	popup.content.b_return.innerHTML = " < Return to the Main Menu";
	    	popup.content.b_return.onclick = function() { setPage("main"); };
	    	popup.content.b_return_br = document.createElement("br");

			popup.content.c_br = document.createElement("br");

			popup.content.d_title = document.createElement("span");
			popup.content.d_title.innerHTML = "<b>" + details.type + "</b>";
			popup.content.d_title_br = document.createElement("br");

			popup.content.e_tabs = document.createElement("table");
			popup.content.e_tabs.cellPadding = 5;
			popup.content.e_tabs.align = "center";
			var e_tabs_tr = document.createElement("tr");
			popup.content.e_tabs.appendChild(e_tabs_tr);
			var e_tabs_elements = document.createElement("td");
			e_tabs_elements.innerHTML = "Elements";
			e_tabs_tr.appendChild(e_tabs_elements);
			var e_tabs_results = document.createElement("td");
			e_tabs_results.innerHTML = "Results";
			e_tabs_tr.appendChild(e_tabs_results);

			popup.content.f_display = document.createElement("div");
			popup.content.f_display.style.overflowY = "auto";
			popup.content.f_display.style.textAlign = "left";
			popup.content.f_display.style.width = "95%";
			popup.content.f_display.style.height = "60%";
			popup.content.f_display.align = "center";
			popup.content.f_display.style.padding = "3px 0px 3px 0px";
			popup.content.f_display.style.zIndex = "1000";

			var f_display_elements = document.createElement("table");
			f_display_elements.id = "elementsTable";
			f_display_elements.cellPadding = 3;
			f_display_elements.style.width = "100%";
			f_display_elements.style.marginLeft = "auto";
			f_display_elements.style.marginRight = "auto";
			popup.content.f_display.appendChild(f_display_elements);

			var style = document.createElement('style');
			style.type = 'text/css';
			var newStyle = `
				#elementsTable td {
					border: 1px solid #4f4f4f;
					width: 100%;
				}
				#elementsTable a {
					float: right;
					padding-left: 3;
				}
			`;
            var styleText = document.createTextNode(newStyle);
        	style.appendChild(styleText);
			document.head.appendChild(style);

			var temporaryThisPage = [
				{"from": "other", "text": "dog from pet policy"},
				{"from": "here", "text": "cat"}
			];  // Replace this
			for (var i = 0; i < temporaryThisPage.length; i++) {
				var thisPage_tr = document.createElement("tr");
				var thisPage_td = document.createElement("td");
				thisPage_td.innerHTML = temporaryThisPage[i].text;
				var thisPage_remove = document.createElement("a");
				thisPage_remove.innerHTML = "(Remove)";
				thisPage_tr.appendChild(thisPage_td);
				thisPage_td.appendChild(thisPage_remove);
				if ( temporaryThisPage[i].from == "here" ) {
					var thisPage_edit = document.createElement("a");
					thisPage_edit.innerHTML = "(Edit)";
					thisPage_td.appendChild(thisPage_edit);
				}
				f_display_elements.appendChild(thisPage_tr);
			}
			var new_tr = document.createElement("tr");
			var new_td = document.createElement("td");
			var new_add = document.createElement("a");
			new_add.style.float = "right";
	    	new_add.onclick = function() { setPage("edit", {"type": details.type}); };
			new_add.innerHTML = "(Add)";
			new_tr.appendChild(new_td);
			new_td.appendChild(new_add);
			f_display_elements.appendChild(new_tr);

	        break;

	    case "edit":
			$("body *:not(#popUpBox,#popUpBox *)")
				.on("mouseover", findElementOver)
				.on("mouseout", findElementOut)
				.on("contextmenu", findElementRightClick);

	    	popup.content.b_return = document.createElement("a");
	    	popup.content.b_return.innerHTML = " < Cancel, Return to " + details.type + " Menu";
	    	popup.content.b_return.onclick = function() {
				$("body *:not(#popUpBox,#popUpBox *)")
					.off("mouseover", findElementOver)
					.off("mouseout", findElementOut)
					.off("contextmenu", findElementRightClick);
	    		setPage("getData", {"type": details.type});
	    	};
	    	popup.content.b_return_br = document.createElement("br");
	    	break;

	    default:
			popup.content.a_text.innerHTML += "There was an error, please have someone check this extension's code.";

	}

	for (var prop in popup.content) {
    	if (!popup.content.hasOwnProperty(prop)) { continue; }
    	popup.contentBox.appendChild(popup.content[prop]);
	}

	chrome.runtime.sendMessage({"msg": "record_pageChange", "page": pageName, "details": details});

}

function closeScraper() {
	if ( confirm("Are you sure you want to cancel this scraper?") ) {
		// console.log("Closed menu.");
		obs.disconnect();
		$("*").off("mousedown", pageClick);
		document.querySelector("body").removeChild(popup.box);
		popup = null;
		window.removeEventListener('mouseup', mouseUp, false);
		chrome.runtime.sendMessage({"msg": "remove_scraper"});
	}
}

// Get the full CSS selector of a given jQuery element
function fullSelector(elementGiven, idBoolean, classBoolean) {
	idBoolean = idBoolean || false;
	classBoolean = classBoolean || true;
	return elementGiven.parents().map(function(){
		var selector = $(this).prop('nodeName');
		if ( selector != "HTML" ) {
			var attrId = $(this).attr("id");
			if ( idBoolean && attrId ) { selector += "#" + attrId; }
			var attrClass = $(this).attr("class");
			if ( classBoolean && attrClass ) { selector += "." + attrClass.replace(/\s/g, "."); }
			return selector;
		}
	}).get().reverse().join(" > ") + " > " + elementGiven.prop('nodeName');
}

// Catches the dom at the very beginning to watch for liveScrape-necessary changes
var dom = $("*").html();
var popup;
var offset = { x: 0, y: 0 };
var obs;  // Define the mutation observer at the highest scope so we can disconnect from closeScraper()
var infoNeeds = ["Description", "Office Hours", "Phone Number", "Fax Number", "Email Address", "Amenities", "Pet Policy", "Available Units"];
var prevColor;

// Askes background if menu needs to be displayed initially
chrome.runtime.sendMessage({"msg": "ask_edit"}, function(response) {
	if (response.tabInEdit) {
		addMenu();
		popup.box.style.top = response.tabInEdit.y;
		popup.box.style.left = response.tabInEdit.x;
		popup.title.innerHTML = response.tabInEdit.title;
		setPage(response.tabInEdit.page, response.tabInEdit.details);
		chrome.runtime.sendMessage({"msg": "add_url", "dom": dom});
	}
});

// Listens for messages from background script
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

	    // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
	    // console.log("request", request);

	    switch (request.msg) {

	    	case "browserAction_clicked":
	    		// If the background script requests the starting dom, send it
		    	// console.log("browserAction_clicked, popup:", popup);
		    	if (popup == null) {
			    	chrome.runtime.sendMessage({"msg": "start", "dom": dom}, function(response) {
						console.log("Sent dom.");
						addMenu();
					});
		    	}
		    	else{
		    		closeScraper();
		    	}
	    		break;

	    	case "change_page":
	    		setPage(request.page, request.details);
	    		break;

	    }

});
