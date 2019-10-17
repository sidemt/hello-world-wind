////////// Display the globe //////////
// create a WorldWindow object
var wwd = new WorldWind.WorldWindow("canvasOne");

// Add imagery layers
// a locally sourced, low resolution version of NASA’s Blue Marble as a fallback
wwd.addLayer(new WorldWind.BMNGOneImageLayer());
// online imagery layer of higher resolution
wwd.addLayer(new WorldWind.BMNGLandsatLayer());

// compass
wwd.addLayer(new WorldWind.CompassLayer());
// coordinates display
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
// view controls
wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

////////// Drawing placemarks //////////

// a layer to store it
var placemarkLayer = new WorldWind.RenderableLayer("Placemark");
// add it to the WorldWindow
wwd.addLayer(placemarkLayer);

// create a PlacemarkAttributes object
var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

// use an image file to draw the placemark
placemarkAttributes.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.3,
    WorldWind.OFFSET_FRACTION, 0.0);
// which image to use for the placemark
placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/pushpins/plain-red.png";

// a text label
placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 1.0);

// define the placemark location
var position = new WorldWind.Position(55.0, -106.0, 100.0);
// Create a placemark object
var placemark = new WorldWind.Placemark(position, false, placemarkAttributes);

// define the text contents of the placemark
placemark.label = "Placemark\n" +
    "Lat " + placemark.position.latitude.toPrecision(4).toString() + "\n" +
    "Lon " + placemark.position.longitude.toPrecision(5).toString();
// Draw the placemark always on top of other shapes
placemark.alwaysOnTop = true;

// add the placemark to our placemarkLayer
placemarkLayer.addRenderable(placemark);
// We could add more placemarks to placemarkLayer if we desire

////////// Display a triangle 3D shape //////////

// a layer to store our Polygon shape
var polygonLayer = new WorldWind.RenderableLayer();
wwd.addLayer(polygonLayer);

// the attributes for the polygon
var polygonAttributes = new WorldWind.ShapeAttributes(null);
polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.75);
polygonAttributes.outlineColor = WorldWind.Color.BLUE;
polygonAttributes.drawOutline = true;
polygonAttributes.applyLighting = true;

// a triangle 70 km high from the Earth’s surface
var boundaries = [];
boundaries.push(new WorldWind.Position(20.0, -75.0, 700000.0));
boundaries.push(new WorldWind.Position(25.0, -85.0, 700000.0));
boundaries.push(new WorldWind.Position(20.0, -95.0, 700000.0));

// Add the polygon to the polygonLayer
var polygon = new WorldWind.Polygon(boundaries, polygonAttributes);
polygon.extrude = true;
polygonLayer.addRenderable(polygon);


////////// Display a duck using COLLADA 3D model //////////

// a Layer to store the 3D model
var modelLayer = new WorldWind.RenderableLayer();
wwd.addLayer(modelLayer);

// a WorldWind.ColladaLoader object to load a COLLADA .dae file
var position = new WorldWind.Position(10.0, -125.0, 800000.0);
var config = {dirPath: WorldWind.configuration.baseUrl + 'examples/collada_models/duck/'};
var colladaLoader = new WorldWind.ColladaLoader(position, config);

// retrieve the model file
colladaLoader.load("duck.dae", function (colladaModel) {
  colladaModel.scale = 9000;
  modelLayer.addRenderable(colladaModel);
});

////////// Accessing a map imagery service //////////
// Load jQuery library for this feature in index.html

// retrieve an imagery layer from NASA Earth Observations WMS

// the WMS address with its WMS’s GetCapabilities request
var serviceAddress = "https://neo.sci.gsfc.nasa.gov/wms/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0";

// the layer that displays the average temperature data
// Refer to https://neo.sci.gsfc.nasa.gov/view.php?datasetId=MOD_LSTD_CLIM_M
var layerName = "MOD_LSTD_CLIM_M";

// a function to create our layer from the XML document from the WMS
var createLayer = function (xmlDom) {
  // Creates a WmsCapabilities object from the XML document.
  var wms = new WorldWind.WmsCapabilities(xmlDom);
  // Retrieves a WmsLayerCapabilities object by the desired layer name.
  var wmsLayerCapabilities = wms.getNamedLayer(layerName);
  // Constructs a configuration object from the WmsLayerCapabilities object
  var wmsConfig = WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapabilities);
  // Creates the WMS Layer from the configuration object
  var wmsLayer = new WorldWind.WmsLayer(wmsConfig);
  // Adds the layer to the WorldWindow
  wwd.addLayer(wmsLayer);
};

// handle errors during the WMS request
var logError = function (jqXhr, text, exception) {
  console.log("There was a failure retrieving the capabilities document: " +
      text +
  " exception: " + exception);
};

// Load data from the server using a HTTP GET request
$.get(serviceAddress)
  // if it succeeds
  .done(createLayer)
  // if it fails
  .fail(logError);
