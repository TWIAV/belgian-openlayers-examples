import './style.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

import {Map, View} from 'ol';
import {Attribution, defaults as defaultControls} from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import LayerGroup from 'ol/layer/Group';

import WMTSSource from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { getTopLeft } from 'ol/extent';

import FullScreen from 'ol/control/FullScreen';
import ZoomToExtent from 'ol/control/ZoomToExtent';

import proj4 from 'proj4';
import {register as ol_proj_proj4_register} from 'ol/proj/proj4';
import {get as ol_proj_get} from 'ol/proj';

// OpenLayers LayerSwitcher by Matt Walker - https://github.com/walkermatt/ol-layerswitcher
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';

// ol-ext is a set of extensions, controls, interactions, popup to use with Openlayers, by Jean-Marc Viglino, Software Engineer at IGN-France
// https://github.com/Viglino/ol-ext
import Bar from 'ol-ext/control/Bar';
import 'ol-ext/control/Bar.css';

const proj3857 = ol_proj_get('EPSG:3857');

const proj3857WMTSTileGrid = new WMTSTileGrid({
  origin: getTopLeft(proj3857.getExtent()),
  resolutions:[2445.98490512564,1222.99245256282,611.49622628141,305.748113140705,152.8740565703525,76.43702828517625,38.21851414258813,19.109257071294063,9.554628535647032,4.777314267823516,2.388657133911758,1.194328566955879],
  matrixIds:[6,7,8,9,10,11,12,13,14,15,16,17]
});

const be_cartoweb_topo = new TileLayer({
  title: 'Cartoweb-topo',
  type: 'base',
  visible: false,
  source: new WMTSSource({
    url:"http://www.ngi.be/tiles/wmts/cartoweb/1.0.0/topo/default/3857/latest/{TileMatrix}/{TileRow}/{TileCol}.png",
    layer: "topo", matrixSet: "EPSG:3857", crossOrigin: 'Anonymous', format: "image/png", projection: proj3857, tileGrid: proj3857WMTSTileGrid, style: "default", wrapX: !0, 	requestEncoding: "REST",
    attributions: 'NGI - België: <a href="https://www.ngi.be/website/aanbod/digitale-geodata/cartoweb-be/" target="_blank" title="Nationaal Geografisch Instituut">Cartoweb-topo</a>'
  }),
});

const be_cartoweb_topo_grey = new TileLayer({
  title: 'Cartoweb-topo grey',
  type: 'base',
  visible: false,
  source: new WMTSSource({
    url:"http://www.ngi.be/tiles/wmts/cartoweb/1.0.0/topo/default_bw/3857/latest/{TileMatrix}/{TileRow}/{TileCol}.png",
    layer: "topo", matrixSet: "EPSG:3857", crossOrigin: 'Anonymous', format: "image/png", projection: proj3857, tileGrid: proj3857WMTSTileGrid, style: "default", wrapX: !0, 	requestEncoding: "REST",
    attributions: 'NGI - België: <a href="https://www.ngi.be/website/aanbod/digitale-geodata/cartoweb-be/" target="_blank" title="Nationaal Geografisch Instituut">Cartoweb-topo grey</a>'
  }),
});

const be_orthofoto = new TileLayer({
  title: 'Orthofoto',
  type: 'base',
  visible: false,
  source: new WMTSSource({
    url:"https://www.ngi.be/tiles/wmts/orthos/1.0.0/ortho/default/3857/latest/{TileMatrix}/{TileRow}/{TileCol}.jpg",
    layer: "topo", matrixSet: "EPSG:3857", crossOrigin: 'Anonymous', format: "image/jpg", projection: proj3857, tileGrid: proj3857WMTSTileGrid, style: "default", wrapX: !0, 	requestEncoding: "REST",
    attributions: 'NGI - België: <a href="https://www.geo.be/catalog/details/29238f19-ac79-4a4a-a797-5490226381ec?l=nl" target="_blank" title="Nationaal Geografisch Instituut">Orthofoto</a>'
  }),
});

const baseMapLayerGroup = new LayerGroup({
  title: 'Basiskaarten',
  fold: 'open',
  layers: [be_orthofoto, be_cartoweb_topo_grey, be_cartoweb_topo]
});

const baseMapLayers = baseMapLayerGroup.getLayers();

// Map View Projection (SRS)
const proj3812 = 'EPSG:3812'; // Display projection

// Use Proj4js to define EPSG:3812 Projection (ETRS89 / Belgian Lambert 2008)
// (parameters from https://epsg.io/3812)
proj4.defs("EPSG:3812","+proj=lcc +lat_1=49.83333333333334 +lat_2=51.16666666666666 +lat_0=50.797815 +lon_0=4.359215833333333 +x_0=649328 +y_0=665262 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// Make non-built-in projections defined in proj4 available in OpenLayers.
ol_proj_proj4_register(proj4);

const minZoom = 1;
const maxZoom = 28;

let center = [675000, 625000];
let zoom = 9;
let baseMapSetting = 2;

if (window.location.hash !== '') {
  const hash = window.location.hash.replace('#map=', '');
  const parts = hash.split('/');
  if (parts.length === 4) {
    zoom = parseFloat(parts[0]);
    center = [parseFloat(parts[1]), parseFloat(parts[2])];
    baseMapSetting = parseFloat(parts[3]);
  }
}

switchBaseMapSetting(baseMapSetting);

const attribution = new Attribution({
  collapsible: false,
});

// Create Map canvas and View
var map = new Map({
  layers: [
    baseMapLayerGroup
  ],
  controls: defaultControls({attribution: false}).extend([attribution]),	
  target: 'map',
  view: new View({minZoom: minZoom, maxZoom: maxZoom, projection: proj3812, center: center, zoom: zoom})
});

console.log(map.getView().calculateExtent());

const layerSwitcher = new LayerSwitcher({
  activationMode: 'click',
  startActive: true,
  tipLabel: 'Lijst met lagen',
  collapseTipLabel: 'Verberg lijst met lagen',
  groupSelectStyle: 'group'
});

map.addControl(layerSwitcher);

map.on ('moveend', manageControls);

function manageControls(evt) {
  const zoomOutBtn = document.querySelector(".ol-zoom-out");
  zoomOutBtn.title = 'Zoom uit';
  const rotateBtn = document.querySelector(".ol-rotate-reset");
  rotateBtn.title = 'Draai de kaart weer naar het noorden';
  const zoomToExtentBtn = document.querySelector(".ol-zoom-extent");
  zoomToExtentBtn.firstChild.title = 'Zoom uit naar heel België';
  zoomToExtentBtn.firstChild.innerHTML = '&#8962';
  const fullScreenOpenBtn = document.querySelector(".ol-full-screen-false");
  if (fullScreenOpenBtn !== null) fullScreenOpenBtn.title = 'Volledig scherm openen';
  const fullScreenCloseBtn = document.querySelector(".ol-full-screen-true");
  if (fullScreenCloseBtn !== null) fullScreenCloseBtn.title = 'Volledig scherm sluiten';
}

baseMapLayerGroup.on('change', function(){ updateURLHash() }); // User selects other basemap

// Toolbar
const toolBar = new Bar();
map.addControl(toolBar);
toolBar.setPosition('top-left');

toolBar.addControl(new ZoomToExtent({ extent: [466560, 487720, 883439, 762279]}));
toolBar.addControl(new FullScreen());

let shouldUpdate = true;
const view = map.getView();

function updateURLHash() {
  if (!shouldUpdate) {
    // do not update the URL when the view was changed in the 'popstate' handler
    shouldUpdate = true;
    return;
  }
  
  for (let i = 0; i < baseMapLayers.get('length'); ++i) {
    if (baseMapLayers.item(i).get('visible')) {
      baseMapSetting = i;
    }
  }

  const center = view.getCenter();
  const hash =
    '#map=' +
    Math.round(view.getZoom()) +
    '/' +
    Math.round(center[0]) +
    '/' +
    Math.round(center[1]) +
    '/' +
    baseMapSetting
  const state = {
    zoom: view.getZoom(),
    center: view.getCenter()
  };
  window.history.pushState(state, 'map', hash);
};

map.on('moveend', updateURLHash);

// restore the view state when navigating through the history, see
// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
window.addEventListener('popstate', function (event) {
  if (event.state === null) {
    return;
  }
  map.getView().setCenter(event.state.center);
  map.getView().setZoom(event.state.zoom);
  shouldUpdate = false;
});

function switchBaseMapSetting(bm) {
  baseMapLayers.item(bm).set('visible', true);
}