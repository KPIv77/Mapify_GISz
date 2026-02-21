// search location site
function add_location () {
    const search = document.querySelector(".search_location");

    search.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            if (event.key === "Enter") {
                event.preventDefault(); 

                map.eachLayer((layer) => {
                    if (layer instanceof L.Marker) map.removeLayer(layer);
                 });
            };
            
            event.preventDefault(); 

            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) map.removeLayer(layer);
            });

            const value = search.value.trim();
            const [latitude, longitude]  = value.split(/\s+/).map(Number);

            if (isNaN(latitude) || isNaN(longitude)) {
                alert("Please enter valid coordinates, e.g. '13.736717 100.523186");
                return;
            }

            console.log("Lattitude: ",latitude);
            console.log("Longitude: ", longitude);
            

            const point = {lat: latitude, lng: longitude, name: "Target"};

            L.marker([point.lat, point.lng]).addTo(map);
            L.marker([point.lat, point.lng], {
                icon:L.divIcon({
                    className: "text-marker",
                    html: `<b>${point.name}</b>`
                }),
            }).addTo(map);

            map.setView([point.lat, point.lng], 10);

        }

    });
};

add_location()
