// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
var req = new XMLHttpRequest();
req.open(
    "GET",
    "http://api.flickr.com/services/rest/?" +
        "method=flickr.photos.search&" +
        "api_key=90485e931f687a9b9c2a66bf58a3861a&" +
        "text=hello%20world&" +
        "safe_search=1&" +  // 1 is "safe"
        "content_type=1&" +  // 1 is "photos only"
        "sort=relevance&" +  // another good one is "interestingness-desc"
        "per_page=20",
    true);
req.onload = showPhotos;
req.send(null);

function showPhotos() {
  var photos = req.responseXML.getElementsByTagName("photo");

  for (var i = 0, photo; photo = photos[i]; i++) {
    var img = document.createElement("image");
    img.src = constructImageURL(photo);
    document.body.appendChild(img);
  }
}

// See: http://www.flickr.com/services/api/misc.urls.html
function constructImageURL(photo) {
  return "http://farm" + photo.getAttribute("farm") +
      ".static.flickr.com/" + photo.getAttribute("server") +
      "/" + photo.getAttribute("id") +
      "_" + photo.getAttribute("secret") +
      "_s.jpg";
}

*/

var oldkey = null;
document.body.innerHTML = "Please wait while we load the list of TV shows...";

function linkClicked(evt)
{
  var a = evt.target;
  a.nextElementSibling.nextElementSibling.style.display=(a.nextElementSibling.nextElementSibling.style.display=='none')?'block':'none';
}

function downloadClicked(evt)
{
  var target = evt.target;
  var a = target.parentElement.parentElement.firstChild;
  var show_id = a.attributes.show_id.value;
  var lang = target.previousElementSibling.value;
  var seasons = target.previousElementSibling.previousElementSibling.value.split(",");
  for (var i = 0; i < seasons.length; i++) {
    var download_url = "http://tvsubtitles.net/download-"+show_id+"-"+seasons[i]+"-"+lang+".html";
    chrome.downloads.download({url: download_url});
  }
}

function loadSearchResults() {
  var key = document.getElementById("search_key").value;
  if(key != oldkey)
  // alert(key);
  {
    var tvshows = JSON.parse(localStorage.getItem("tvshows"));
    var rs = key.split(" ").map(function(x){return x.trim();}).filter(function(x){return x.length>0;}).map(function(x){return new RegExp(x,'i');});
    var ul = document.getElementById("search_result");
    ul.innerHTML = "";
    for(var i = 1; i < tvshows.length; i++) {
      var matches = true;
      for (var j = 0; j < rs.length; j++) {
        if(tvshows[i].name.match(rs[j]))
          continue;
        matches = false;
        break;
      }
      if(matches) {
        var ele = document.createElement("li");
        ele.innerHTML = "<a href='javascript:void(0);' class='show_name' show_id='"+tvshows[i].show_id+"'>"+tvshows[i].name+"</a><br />"+
          "<div style='display:none'>hello</div>";
        var d = ele.firstChild.nextElementSibling.nextElementSibling;
        var select1 = "<select>";
        var x = "";
        var y = "";
        var sep = "";
        for (var k = 1; k <= tvshows[i].seasons; k++) {
          x+=sep+k;
          sep=",";
          y+="<option value='"+k+"'>"+k+"</option>";
        }
        select1+="<option value='"+x+"'>all</option>"+y+"</select>";

        var select2 = "<select>";
        var languages = ['English', 'Spanish', 'French', 'Russian', 'Greek', 'Polish', 'Bulgarian'];
        var short_languages = ['en', 'en', 'fr', 'ru', 'gr', 'pl', 'bg'];
        for (var l = 0; l < languages.length; l++) {
          select2+="<option value='"+short_languages[l]+"'>"+languages[l]+"</option>";
        }
        select2+="</select>";
        var btn = "<button>Download</button>";
        d.innerHTML = select1+select2+btn;
        var b = d.lastChild;
        ul.appendChild(ele);
        ele.firstChild.addEventListener('click', linkClicked);
        b.addEventListener('click', downloadClicked);
      }
    }
  }
  oldkey=key;
  setTimeout(loadSearchResults, 1000);
}

function begin() {
  document.body.innerHTML = "TV Show list loaded!\n" + "Search TV Show: <input id='search_key' type = 'text'>\n" + "<ul id = 'search_result'></ul>";
  setTimeout(loadSearchResults, 100);
}



if(!localStorage.getItem("tvshows")) {
  var req = new XMLHttpRequest();
  req.open("GET", "http://www.tvsubtitles.net/tvshows.html", true);
  req.onload = function() {
    document.body.innerHTML = "TV Show list Downloaded, processing...";
    var tvshows = [];
    var ele = document.createElement("div");
    ele.innerHTML = req.responseText;
    var tables = ele.getElementsByTagName("table");
    var table5 = tables[2];
    var trs = table5.getElementsByTagName("tr");
    for(var i = 1; i < trs.length; i++) {
      var tr = trs[i];
      var tds = tr.getElementsByTagName("td");
      var a = tds[1].getElementsByTagName("a")[0];
      var b = a.getElementsByTagName("b")[0];
      var link = a.href;
      var show_id = link.match(/tvshow-(.+?)-.*?.html/)[1];
      tvshows[i] = {
        name: b.innerHTML,
        show_id: show_id,
        seasons: tds[2].innerHTML,
        episodes: tds[3].innerHTML,
        year: tds[5].innerHTML
      };
      // alert(JSON.stringify(tvshows[i]));
    }
    localStorage.setItem("tvshows", JSON.stringify(tvshows));
    begin(); //Move it to end of function
  };
  req.onerror = function() {
    document.body.innerHTML = "Failed. Check your internet connection";
  };
  req.send();
} else {
  var tvshows = JSON.parse(localStorage.getItem("tvshows"));
  begin();
}