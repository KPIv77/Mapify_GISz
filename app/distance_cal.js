const distance_map = L.layerGroup().addTo(map);
let points = [];
let line;

function distance () {
    const dis_btn = document.querySelector("#dis_btn");

    if (!dis_btn) return;

    dis_btn.addEventListener("click", (n) =>{

        n.stopPropagation();

        console.log("Distance mode ON");

        points = []

        map.on("click", onMapClick);

    });
};

function onMapClick(n) {

    const latlng = n.latlng;

    points.push(latlng);

    L.marker(latlng).addTo(distance_map);

    if (points.length === 2) {

        line = L.polyline(points, {color: "red"}).addTo(distance_map);

        const dist = map.distance(points[0], points[1]);

        const km = (dist / 1000).toFixed(2);


        // midpoint
        const midLat = (points[0].lat + points[1].lat) / 2;
        const midLng = (points[0].lng + points[1].lng) / 2;

        // label
        L.marker([midLat, midLng], {
            icon: L.divIcon({
                className: "distance-label",
                html: `<b>${km} km</b>`
            })
        }).addTo(distance_map);


        map.off("click", onMapClick);

    };
};

document.addEventListener("DOMContentLoaded", distance);