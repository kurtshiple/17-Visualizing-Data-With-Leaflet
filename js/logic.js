// satellite tile.
var satellite_tile = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1Ijoia3VydHNoaXBsZSIsImEiOiJjancxOG5icDAwajl0M3ptbXE3ejdpM3pnIn0.U3N0yMuut8fwV4A3zvLLWA");

// dark tile.
var dark_tile = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1Ijoia3VydHNoaXBsZSIsImEiOiJjancxOG5icDAwajl0M3ptbXE3ejdpM3pnIn0.U3N0yMuut8fwV4A3zvLLWA");

// making the map object that will hold our two map layers.
var map = L.map("mapid", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [satellite_tile, dark_tile]
});

// adding one 'graymap' tile layer to the map.
dark_tile.addTo(map);

// layers for two different sets of data, earthquakes and tectonicplates.
var plates = new L.LayerGroup();
var quakes = new L.LayerGroup();

// base layers
var baseMaps = {
  Satellite: satellite_tile,
  Dark: dark_tile
};

// tile overlays 
var overlayMaps = {
  "Tectonic Plates": plates,
  "Earthquakes": quakes
};

// determines which layers are visible.
L
  .control
  .layers(baseMaps, overlayMaps)
  .addTo(map);

// grabbing earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {


  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: false,
      weight: 0.9
    };
  }

  // Marker color
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#DA2B1B";
      case magnitude > 4:
        return "#F4A734";
      case magnitude > 3:
        return "#FCE972";
      case magnitude > 2:
        return "#95EC9C";
      case magnitude > 1:
        return "#00CCBC";
      default:
        return "#2A7DB7";
    }
  }

  // Marker size

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // add GeoJSON layer to the map with url links for further info
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Earthquake Magnitude: " + feature.properties.mag + "<br>Earthquake Location: " + feature.properties.place + "<br>Further Earthquake Information: " + "<a href=" + feature.properties.url + ">Click Here</a>");
    }

  }).addTo(quakes);

  quakes.addTo(map);


  var legend = L.control({
    position: "bottomleft"
  });


  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0];
    var colors = [
      "#2A7DB7",
      "#00CCBC",
      "#95EC9C",
      "#FCE972",
      "#F4A734",
      "#DA2B1B"
    ];


    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend.addTo(map);

  // grabbing Tectonic Plate and Fault Line geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
 
      L.geoJson(platedata, {
        color: "white",
        weight: 3
      })
      .addTo(plates);

      // add the tectonicplates layer to the map.
      plates.addTo(map);
    });
});