// Configuración inicial
const width = window.innerWidth;
const height = window.innerHeight;
let isDarkTheme = false;
const sensitivity = 75;

const svg = d3
  .select("#globe")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const projection = d3
  .geoOrthographic()
  .scale(250)
  .center([0, 0])
  .rotate([0, -30])
  .translate([width / 2, height / 2]);

// Función para cambiar el tema
function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle("dark-theme");
  updateGlobeColors();
}

function updateGlobeColors() {
  // Actualizar color del océano
  g.select("circle").attr("fill", isDarkTheme ? "#1a4b77" : "#4B93C3");

  // Actualizar bordes de países
  g.selectAll("path").attr("stroke", isDarkTheme ? "#444" : "#fff");
}

const path = d3.geoPath().projection(projection);
const g = svg.append("g");

// Círculo base para el océano
g.append("circle")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", projection.scale())
  .attr("fill", "#4B93C3")
  .attr("stroke", "#888");

// Escala de color para temperaturas
// Rango aproximado de -50°C a 50°C
const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([50, -50]); // Invertimos el dominio para que rojo sea calor y azul frío

// Función para obtener datos de temperatura de OpenMeteo
async function getTemperatureData(lat, lon) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await response.json();
    return data.current_weather.temperature;
  } catch (error) {
    console.error("Error fetching temperature:", error);
    return null;
  }
}

// Función para obtener temperaturas para una grilla de puntos
async function getGlobalTemperatures(features) {
  const promises = features.map(async (feature) => {
    // Obtener el centro del país
    const centroid = d3.geoCentroid(feature);
    const temp = await getTemperatureData(centroid[1], centroid[0]);

    return {
      ...feature,
      properties: {
        ...feature.properties,
        temperature: temp,
      },
    };
  });

  return Promise.all(promises);
}

// Cargar datos y inicializar el globo
Promise.all([
  d3.json("https://unpkg.com/world-atlas@2.0.2/countries-110m.json"),
]).then(async ([worldData]) => {
  const countries = topojson.feature(worldData, worldData.objects.countries);

  // Obtener temperaturas reales
  const countriesWithTemp = await getGlobalTemperatures(countries.features);

  // Ocultar loading
  d3.select("#loading").style("display", "none");

  // Dibujar países
  g.selectAll("path")
    .data(countriesWithTemp)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d) =>
      d.properties.temperature ? colorScale(d.properties.temperature) : "#ccc"
    )
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.3)
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke-width", 1);

      tooltip.transition().duration(200).style("opacity", 0.9);

      tooltip
        .html(
          `
                        País: ${d.properties.name || "N/A"}<br/>
                        Temperatura: ${
                          d.properties.temperature
                            ? d.properties.temperature.toFixed(1) + "°C"
                            : "No disponible"
                        }
                    `
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke-width", 0.3);

      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Funcionalidad de arrastre
  svg.call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  );

  let v0, r0, q0;

  function dragstarted(event) {
    v0 = versor.cartesian(projection.invert([event.x, event.y]));
    r0 = projection.rotate();
    q0 = versor(r0);
  }

  function dragged(event) {
    const v1 = versor.cartesian(
      projection.rotate(r0).invert([event.x, event.y])
    );
    const q1 = versor.multiply(q0, versor.delta(v0, v1));
    const r1 = versor.rotation(q1);
    projection.rotate(r1);

    g.selectAll("path").attr("d", path);
  }

  function dragended() {}

  // Actualizar datos cada 5 minutos
  setInterval(async () => {
    const updatedData = await getGlobalTemperatures(countries.features);
    g.selectAll("path")
      .data(updatedData)
      .attr("fill", (d) =>
        d.properties.temperature ? colorScale(d.properties.temperature) : "#ccc"
      );
  }, 300000); // 5 minutos
});

// Implementación del versor (igual que antes)
const versor = (() => {
  function versor(e) {
    const t = e[0] * 0.5,
      n = e[1] * 0.5,
      r = e[2] * 0.5,
      a = Math.cos(t),
      o = Math.cos(n),
      c = Math.cos(r),
      l = Math.sin(t),
      s = Math.sin(n),
      i = Math.sin(r);
    return [
      a * o * c + l * s * i,
      l * o * c - a * s * i,
      a * s * c + l * o * i,
      a * o * i - l * s * c,
    ];
  }

  versor.rotation = (q) => {
    return [
      (Math.atan2(
        2 * (q[0] * q[1] + q[2] * q[3]),
        1 - 2 * (q[1] * q[1] + q[2] * q[2])
      ) *
        180) /
        Math.PI,
      (Math.asin(Math.max(-1, Math.min(1, 2 * (q[0] * q[2] - q[3] * q[1])))) *
        180) /
        Math.PI,
      (Math.atan2(
        2 * (q[0] * q[3] + q[1] * q[2]),
        1 - 2 * (q[2] * q[2] + q[3] * q[3])
      ) *
        180) /
        Math.PI,
    ];
  };

  versor.multiply = (a, b) => [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ];

  versor.delta = (a, b) => {
    const k = Math.sqrt(
      (a[0] - b[0]) * (a[0] - b[0]) +
        (a[1] - b[1]) * (a[1] - b[1]) +
        (a[2] - b[2]) * (a[2] - b[2])
    );
    return k > 1e-6
      ? Math.acos(
          Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
        )
      : 0;
  };

  versor.cartesian = (ll) => {
    const l = (ll[0] * Math.PI) / 180,
      p = (ll[1] * Math.PI) / 180,
      cp = Math.cos(p);
    return [cp * Math.cos(l), cp * Math.sin(l), Math.sin(p)];
  };

  return versor;
})();

// Animación de rotación automática
function autoRotate() {
  const rotation = projection.rotate();
  rotation[0] += 0.5;
  projection.rotate(rotation);

  g.selectAll("path").attr("d", path);

  requestAnimationFrame(autoRotate);
}

// Iniciar rotación automática
autoRotate();
