// JavaScript Document
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/light-v10', // you can change the style of the map by the last part //of the url (i.e light-v10)
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 10 // starting zoom
});

 map.addControl(new mapboxgl.NavigationControl());

//how to understand the following statement: l11 creates the marker, l12 sets the latitute and //longitude, l13 sets popup on that marker whuch is what should happen when a user click on it, l14 //and 15 is the construction of that popup that is paased in to l13 as an argument, and l15 adds //the marker to the map
new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
	new mapboxgl.Popup({offset: 25})
	.setHTML(
			`<h3>${campground.title}</h3><p>${campground.location}</p>`
	)
)
.addTo(map);