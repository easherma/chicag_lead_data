/////////////////////////////////////////////////////////////////////////////////////////////
//setting up the map//
/////////////////////////////////////////////////////////////////////////////////////////////

// set center coordinates
var centerlat = 34.05;
var centerlon = -118.25;

// set default zoom level
var zoomLevel = 10;

// initialize map
var map = L.map('map').setView([centerlat,centerlon], zoomLevel);

// set source for map tiles
ATTR = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | ' +
'&copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

CDB_URL = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

// add tiles to map
L.tileLayer(CDB_URL, {attribution: ATTR}).addTo(map);

/////////////////////////////////////////////////////////////////////////////////////////////
//creating some synthetic GeoJSON data//
/////////////////////////////////////////////////////////////////////////////////////////////

//initialize
var dotlayer;
var dots;
var dotcount = 500;
make_dots();

/////////////////////////////////////////////////////////////////////////////////////////////
//styling and displaying the data as circle markers//
/////////////////////////////////////////////////////////////////////////////////////////////

//highlight style
var dotStyleHighlight = {
    radius: 8,
    fillColor: "#102040",
    color: "#116",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.9
};

//create marker layer and display it on the map
dotlayer = L.geoJson(dots, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, style(feature));
        },
    onEachFeature: onEachDot
}).addTo(map);

/////////////////////////////////////////////////////////////////////////////////////////////
//legend//
/////////////////////////////////////////////////////////////////////////////////////////////

//create circle color legend
var yearlegend = L.control({
    position: 'bottomright'
});
//generate legend contents
yearlegend.onAdd = function (map) {
	//set up legend grades and labels
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [1900, 1920, 1940, 1960, 1980, 2000],
        labels = ['<strong>Year</strong>'],
        from, to;

    labels.push('<i class="colorcircle" style="background: #888"></i> ' + 'undefined');
	//iterate through grades and create a color field and label for each
    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];
        labels.push(
            '<i class="colorcircle" style="background:' + getColor(from + 1) + '"></i> ' + from + (to ? '&ndash;' + to : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
};
yearlegend.addTo(map);

/////////////////////////////////////////////////////////////////////////////////////////////
//styling functions//
/////////////////////////////////////////////////////////////////////////////////////////////

//create color ramp
function getColor(y) {
    return y == undefined ? '#888' :
           y > 2000 ? '#6068F0' :
           y > 1990 ? '#6B64DC' :
           y > 1980 ? '#7660C9' :
           y > 1970 ? '#815CB6' :
           y > 1960 ? '#8C58A3' :
           y > 1950 ? '#985490' :
           y > 1940 ? '#A3507C' :
           y > 1930 ? '#AE4C69' :
           y > 1920 ? '#B94856' :
           y > 1910 ? '#C44443' :
                      '#D04030';
}

//create style, with fillColor picked from color ramp
function style(feature) {
	return {
        radius: 6,
		fillColor: getColor(feature.properties.year),
    	color: "#000",
    	weight: 0,
    	opacity: 1,
    	fillOpacity: 0.9
	};
}

//attach styles and popups to the marker layer
function highlightDot(e) {
    var layer = e.target;
    layer.setStyle(dotStyleHighlight);
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

function resetDotHighlight(e) {
    var layer = e.target;
    dotStyleDefault=style(layer.feature);
    layer.setStyle(dotStyleDefault);
}

function onEachDot(feature, layer) {
    layer.on({
        mouseover: highlightDot,
        mouseout: resetDotHighlight
    });
    layer.bindPopup('<table style="width:150px"><tbody><tr><td><div><b>Name:</b></div></td><td><div>'+feature.properties.popup+'</div></td></tr><tr class><td><div><b>Year:</b></div></td><td><div>'+feature.properties.year+'</div></td></tr></tbody></table>');
}

/////////////////////////////////////////////////////////////////////////////////////////////
//synthetic GeoJSON functions//
/////////////////////////////////////////////////////////////////////////////////////////////

//cheapo normrand function
function normish(mean, range) {
    var num_out = ((Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2) * range + mean;
    return num_out;
}

//create geojson data with random ~normal distribution
function make_dots() {

    dots = {
        type: "FeatureCollection",
        features: []
    };

    for(var i=0;i<dotcount;++i) {

        //set up random variables
        x = normish(0, 2);
        y = normish(0, 2);

        //create points randomly distributed about center coordinates
        var g = {
            "type": "Point",
            "coordinates": [ ((x*0.1) + centerlon), ((y*0.1) + centerlat)]
        };

        var yearval = parseInt( (Math.sqrt(x*x + y*y))*120*(1 - Math.random()/1.5) + 1900 );

        if (yearval > 2020) {
            yearval = undefined
        }
        //create feature properties, with year roughly proportional to distance from center coordinates
        var p = {
            "id" : i,
            "popup": "Dot_" + i,
            "year": yearval
        };

        //create features with proper geojson structure
        dots.features.push({
            "geometry" : g,
            "type": "Feature",
            "properties": p
        });
    }
}
