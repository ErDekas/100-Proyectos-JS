const map = L.map("map").setView([0, 0], 2); // Vista predeterminada

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap",
}).addTo(map);

// Inicializar las variables para almacenar la ruta y las marcas de usuario
let userMarker;
let userRoute = [];
let routingControl;

// Geolocalización
function onLocationFound(e) {
  const userLocation = e.latlng;

  // Si el usuario no existe se crea
  if (!userMarker) {
    userMarker = L.marker(userLocation, {
      icon: L.icon({
        iconUrl: "beam-geolocation-icon.png",
        iconSize: [25, 41],
      }),
    })
      .addTo(map)
      .bindPopup("Tu ubicación")
      .openPopup();
    map.setView(userLocation, 13);

    // Define el destino
    const destination = L.latLng(51.515, -0.09); // Cambia el destino fijado
    L.marker(destination).addTo(map).bindPopup("Destino").openPopup();

    // Inicia la ruta
    routingControl = L.Routing.control({
      waypoints: [userLocation, destination],
      language: "es",
      routeWhileDragging: true,
    }).addTo(map);
  } else {
    // Actualizar la posición del usuario
    userMarker.setLatLng(userLocation);

    // Guardar la posición actual del usuario para dibujar la ruta
    userRoute.push(userLocation);

    // Actualizar los waypoints para controlar la ruta del usuario
    routingControl.spliceWaypoints(
      routingControl.getWaypoints().length - 1,
      1,
      userLocation
    );
  }

  // Opcional para por si quieres mantener la ruta visible
  L.polyline(userRoute, { color: "blue" }).addTo(map);
}

function onLocationError(e) {
  alert(e.message);
}

// Empezar el tracking de la geolocalización
map.locate({ setView: true, maxZoom: 16 });
map.on("locationfound", onLocationFound);
map.on("locationerror", onLocationError);

// Continuamente actualizar la localización del usuario
map.on("locationfound", (e) => {
  const userLocation = e.latlng;
  userMarker.setLatLng(userLocation);
});
