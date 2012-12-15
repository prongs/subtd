var oldkey = null;
document.getElementById("status").innerHTML = "Please wait while we load the list of TV shows...";


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.url && changeInfo.url.substr(changeInfo.url.length - 3) == "zip") {
    setTimeout(function() {
      chrome.tabs.remove(tab.id);
    }, 1000);
  }
});




var toUpdate = (!localStorage.getItem("tvshows"))||(JSON.parse(localStorage.getItem("tvshows")[0]+30*8640000<new Date().getTime()));

if(toUpdate) {
  updateLocalStorage(begin);
} else {
  var tvshows = JSON.parse(localStorage.getItem("tvshows"));
  begin();
}