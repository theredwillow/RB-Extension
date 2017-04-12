//background.js

window.unhideableURLs = ["hello", "world", "zillow toys", "https://www.zillow.com/homes/for_rent/Dallas-TX/house,condo,mobile,townhouse_type/32.780136,-96.801342_ll/38128_rid/featured_sort/33.082912,-96.338425,32.554337,-97.217331_rect/9_zm/"];

//URLs can be collected, disqualified, saved, called, acquired, rejected, pending

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "unhideableURLs");
  port.onMessage.addListener(function(msg) {
    if (msg.need == "ask for urls") {
    	//console.log("The " + msg.site + " content script asked for the list of unhideable URL's, so the background script is sending it.");
     	port.postMessage( {need: "give the urls", URLs: window.unhideableURLs.filter(function (u) { return u.indexOf(msg.site) !== -1; })} );
    }
  });
});
