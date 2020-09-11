import 'ol/ol.css';
import './app.css';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import Proj from 'ol/Proj';
import { Fill, Stroke, Style, Text } from 'ol/style';

import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';

const DATA = require('./data/stats.json');

var style = function(f) {
	return new Style({
		fill: new Fill({
			color: 'rgba(215, 0, 0, 0.6)',
		}),
		stroke: new Stroke({
			color: '#319FD3',
			width: 1,
		}),
		text: new Text({
			font: '12px Calibri,sans-serif',
			fill: new Fill({
				color: '#fff',
			}),
			text: f.get('name')
		}),
	});
};

var vectorLayer = new VectorLayer({
	source: new VectorSource({
		url: '../data/war-countries.geojson',
		format: new GeoJSON(),
	}),
	style: function(f) {
		return style(f);
	}

});


var map = new Map({
	layers: [
		new TileLayer({
			source: new OSM(),
		}),
		vectorLayer
	],
	target: 'map',
	view: new View({
		center: [8170821.941698594, 2771471.7552188425],
		zoom: 4,
	}),
});


var highlightStyle = function (f) {
	var styles = [new Style({
		fill: new Fill({
			color: 'rgba(215, 0, 0, 0.6)',
		}),
		text: new Text({
			font: '12px Calibri,sans-serif',
			fill: new Fill({
				color: '#fff',
			}),
			stroke: new Stroke({
				color: '#f00',
				width: 3,
			}),
			text: f.get('name')
		}),
	})];
	
	var steps = 4;
	for (var i = 0; i < steps; i++) {
		styles.push(
			new Style({
				stroke: new Stroke({
					color: [215, 0, 0, 1/(steps - i)],
					width: (steps-i)*2 - 1
				})
			})
		);
	}

	return styles;
};


var displayFeatureInfo = function (pixel) {
	var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
		return feature;
	});

	var info = document.getElementById('info');

	var html = '';
	var country;

	vectorLayer.getSource().getFeatures().forEach(f=> {
		f.setStyle(style(f));
	});
	
	if (feature) {
		country = feature.get('name');
		var wars = DATA.Country[country];
		wars.forEach((war)=>{
			html += '<h5>'+war+'</h5>';
			var stats = DATA.War[war].info;
		
			html += '<ul>';
			stats.forEach(rec=>{
				html += '<li>'+rec+'</li>';
			});
			html += '</ul>';

			vectorLayer.getSource().getFeatures().forEach(f=> {
				if (DATA.War[war].countries[f.get('name')]) {
					f.setStyle(highlightStyle);
				}
			});
		});
		info.innerHTML = html;//feature.getId() + ': ' + feature.get('name');
		info.style.display = 'block';
		info.style.top = (pixel[1] - info.offsetHeight - 10) + 'px';
		info.style.left = (pixel[0] - 13)+'px';

		
	} else {
		info.innerHTML = '';
		info.style.display = 'none';
	}
};

map.on('pointermove', function (evt) {
	if (evt.dragging) {
		return;
	}
	var pixel = map.getEventPixel(evt.originalEvent);
	displayFeatureInfo(pixel);
});
