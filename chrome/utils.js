function linkClicked(evt) {
  var a = evt.target;
  a.nextElementSibling.nextElementSibling.style.display = (a.nextElementSibling.nextElementSibling.style.display == 'none') ? 'block' : 'none';
}

function downloadClicked(evt) {
  var target = evt.target;
  var a = target.parentElement.parentElement.firstChild;
  var show_id = a.attributes.show_id.value;
  var lang = target.previousElementSibling.value;
  var seasons = target.previousElementSibling.previousElementSibling.value.split(",");
  for(var i = 0; i < seasons.length; i++) {
    var download_url = "http://tvsubtitles.net/download-" + show_id + "-" + seasons[i] + "-" + lang + ".html";
    //chrome.downloads.download({url: download_url});
    chrome.tabs.create({
      url: download_url,
      active: false
    });
  }
}

function loadSearchResults() {
  var key = document.getElementById("search_key").value;
  if(key != oldkey)
  // alert(key);
  {
    var tvshows = JSON.parse(localStorage.getItem("tvshows"));
    var rs = key.split(" ").map(function(x) {
      return x.trim();
    }).filter(function(x) {
      return x.length > 0;
    }).map(function(x) {
      return new RegExp(x, 'i');
    });
    var ul = document.getElementById("search_result");
    ul.innerHTML = "";
    for(var i = 1; i < tvshows.length; i++) {
      var matches = true;
      for(var j = 0; j < rs.length; j++) {
        if(tvshows[i].name.match(rs[j])) continue;
        matches = false;
        break;
      }
      if(matches) {
        var ele = document.createElement("li");
        ele.innerHTML = "<a href='javascript:void(0);' class='show_name' show_id='" + tvshows[i].show_id + "'>" + tvshows[i].name + "</a><br />" + "<div style='display:none'>hello</div>";
        var d = ele.firstChild.nextElementSibling.nextElementSibling;
        var select1 = "<select>";
        var x = "";
        var y = "";
        var sep = "";
        for(var k = 1; k <= tvshows[i].seasons; k++) {
          x += sep + k;
          sep = ",";
          y += "<option value='" + k + "'>" + k + "</option>";
        }
        select1 += "<option value='" + x + "'>all</option>" + y + "</select>";

        var select2 = "<select>";
        var languages = ['English', 'Spanish', 'French', 'Russian', 'Greek', 'Polish', 'Bulgarian'];
        var short_languages = ['en', 'en', 'fr', 'ru', 'gr', 'pl', 'bg'];
        for(var l = 0; l < languages.length; l++) {
          select2 += "<option value='" + short_languages[l] + "'>" + languages[l] + "</option>";
        }
        select2 += "</select>";
        var btn = "<button>Download</button>";
        d.innerHTML = select1 + select2 + btn;
        var b = d.lastChild;
        ul.appendChild(ele);
        ele.firstChild.addEventListener('click', linkClicked);
        b.addEventListener('click', downloadClicked);
      }
    }
  }
  oldkey = key;
  setTimeout(loadSearchResults, 1000);
}

function begin() {
  document.getElementById("status").innerHTML = "TV Show list loaded!\n" + "Search TV Show: <input id='search_key' type = 'text'>\n" + "<ul id = 'search_result'></ul>";
  setTimeout(loadSearchResults, 100);
}

function updateLocalStorage(cb //Callback
  ) {
  var req = new XMLHttpRequest();
  req.open("GET", "http://www.tvsubtitles.net/tvshows.html", true);
  req.onload = function() {
    document.getElementById("status").innerHTML = "TV Show list Downloaded, processing...";
    var tvshows = [];
    var ele = document.createElement("div");
    ele.innerHTML = req.responseText;
    var tables = ele.getElementsByTagName("table");
    var table5 = tables[2];
    var trs = table5.getElementsByTagName("tr");
    tvshows[0] = new Date().getTime();
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
    if(cb)
      cb();
  };
  req.onerror = function() {
    document.body.innerHTML = "Failed. Check your internet connection";
  };
  req.send();
}
