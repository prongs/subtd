function reloadTVShows()
{
  updateLocalStorage(function(){
    document.getElementById("status").innerHTML="done!";
  });
}
var rb = document.getElementById("reload_btn");
rb.addEventListener('click', reloadTVShows);
