var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var myMap = L.map("map", {
  center: [30, -30],
  zoom: 2,
  layers: satellite
});

var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

var earthquakesLayer = new L.layerGroup();

function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.mag) {
      var formattedDate = "";
      if (feature.properties.time) {
        var d = new Date(feature.properties.time);
        formattedDate = + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        var hours = (d.getHours() < 10) ? "0" + d.getHours() : d.getHours();
        var minutes = (d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes();
        var formattedTime = hours + ":" + minutes;

        formattedDate = formattedDate + " " + formattedTime;
      }

      layer.bindPopup('<h3>' + feature.properties.place + '</h3><hr>' +
        formattedDate + '<br>' +
        'Magnitude ' + feature.properties.mag + '<br>' +
        '<a href = "' + feature.properties.url + '" target="_blank" >More info</a>'
        );
  }
}

d3.json(url, function(response) {

  console.log(response);

  L.geoJson(response, {

    pointToLayer: function (feature, latlng) {

      var mag = feature.properties.mag;

      if (typeof mag == "number") {
        if (mag < 1)  { circle_color = "greenyellow"; }
        else if (mag < 2) { circle_color = "yellow"; }
        else if (mag < 3) { circle_color = "orange"; }
        else if (mag < 4) { circle_color = "darkorange"; }
        else if (mag < 5) { circle_color = "coral"; }
        else if (mag >= 5)  { circle_color = "red"; }
        else { circle_color: "green"; }
      }

      var geojsonMarkerOptions = {
        radius: mag*2,
        fillColor: circle_color,
        color: circle_color,
        weight: 1,
        opacity: 0.5,
        fillOpacity: 0.5
      };

      return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: onEachFeature
  }).addTo(earthquakesLayer);

  earthquakesLayer.addTo(myMap);

});

var legendBox = L.control();

legendBox.onAdd = function (map) {
    return L.DomUtil.create('div', 'info');
};

legendBox.addTo(myMap);

var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'legendBox legend'),
      mags = [0, 1, 2, 3, 4, 5]

  for (var i = 0; i < mags.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(mags[i]) + '"></i> ' + 
          mags[i] + 
          (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
  }
  return div;
};

legend.addTo(myMap);
