function clearMap () {
  const clear_btn = document.querySelector("#clear_btn");
  
  if (!clear_btn) return;

  clear_btn.addEventListener("click", () =>{
    console.log("Clear");

    file_Site.clearLayers();
    distance_map.clearLayers();
    searchSite.clearLayers();

  });

};


document.addEventListener("DOMContentLoaded", clearMap);