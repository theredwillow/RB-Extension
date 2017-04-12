function injectJs(link) {
    var scr = document.createElement("script");
    scr.type="text/javascript";
    scr.src=link;
    (document.head || document.body || document.documentElement).appendChild(scr);
}

function injectWhat(){
	switch( window.location.pathname ) {
	    case "/phone-tracking":
	        injectJs( chrome.extension.getURL("/content/phonetracking.js") );
	        break;
	    default:
	    	console.log("No injection code was specified for this url.");
	}
}

//jQuery.noConflict()(function ($) {
    $(document).ready( function () { console.log("Document is ready! - Injector"); setTimeout(injectWhat, 500); } );
//});
