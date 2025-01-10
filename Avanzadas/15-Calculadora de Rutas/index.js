let map;
let directionsService;
let directionsRenderer;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: { lat: 40.416775, lng: -3.70379 },
    styles: [
      {
        featureType: "all",
        elementType: "geometry.fill",
        stylers: [{ weight: "2.00" }],
      },
      {
        featureType: "all",
        elementType: "geometry.stroke",
        stylers: [{ color: "#9c9c9c" }],
      },
      {
        featureType: "all",
        elementType: "labels.text",
        stylers: [{ visibility: "on" }],
      },
      {
        featureType: "landscape",
        elementType: "all",
        stylers: [{ color: "#f2f2f2" }],
      },
      {
        featureType: "landscape",
        elementType: "geometry.fill",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "landscape.man_made",
        elementType: "geometry.fill",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "poi",
        elementType: "all",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road",
        elementType: "all",
        stylers: [{ saturation: -100 }, { lightness: 45 }],
      },
      {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{ color: "#eeeeee" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#7b7b7b" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "road.highway",
        elementType: "all",
        stylers: [{ visibility: "simplified" }],
      },
      {
        featureType: "water",
        elementType: "all",
        stylers: [{ color: "#46bcec" }, { visibility: "on" }],
      },
    ],
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: "#6366f1",
      strokeWeight: 5,
    },
  });

  const originInput = document.getElementById("origin");
  const destinationInput = document.getElementById("destination");
  new google.maps.places.Autocomplete(originInput);
  new google.maps.places.Autocomplete(destinationInput);
}

function calculateRoute() {
  const origin = document.getElementById("origin").value;
  const destination = document.getElementById("destination").value;
  const travelMode = document.getElementById("travelMode").value;

  if (!origin || !destination) {
    alert("Por favor, introduce origen y destino");
    return;
  }

  const request = {
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode[travelMode],
  };

  directionsService.route(request, function (response, status) {
    if (status === "OK") {
      directionsRenderer.setDirections(response);
      displayRouteDetails(response);
    } else {
      alert("No se pudo calcular la ruta: " + status);
    }
  });
}

function displayRouteDetails(response) {
  const route = response.routes[0];
  const resultsDiv = document.getElementById("results");

  let duration = route.legs[0].duration.text;
  let distance = route.legs[0].distance.text;

  resultsDiv.innerHTML = `
                <h3>Detalles de la ruta</h3>
                <div class="route-info">
                    <div class="info-card">
                        <i class="fas fa-road"></i>
                        <div>
                            <strong>Distancia</strong>
                            <p>${distance}</p>
                        </div>
                    </div>
                    <div class="info-card">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Tiempo estimado</strong>
                            <p>${duration}</p>
                        </div>
                    </div>
                </div>
                <h3>Indicaciones paso a paso</h3>
                <ul class="instructions-list">
                    ${route.legs[0].steps
                      .map(
                        (step) => `
                        <li>
                            <i class="fas fa-arrow-right"></i>
                            <span>${step.instructions}</span>
                        </li>
                    `
                      )
                      .join("")}
                </ul>
            `;
}
