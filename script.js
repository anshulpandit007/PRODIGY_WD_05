const API_KEY ="1dc31c4a4632f69e9de35195d9bf9e04";
let units = "metric";

const $ = (s) => document.querySelector(s);

function formatTemp(t) {
  return `${Math.round(t)}°${units === "metric" ? "C" : "F"}`;
}
function iconUrl(code) {
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching data");
  return res.json();
}

async function getWeatherByCity(city) {
  const q = new URLSearchParams({ q: city, appid: API_KEY, units });
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?${q}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${q}`;
  const [current, forecast] = await Promise.all([fetchJSON(currentUrl), fetchJSON(forecastUrl)]);
  return { current, forecast };
}

function renderCurrent(data) {
  $("#place").textContent = `${data.name}, ${data.sys.country}`;
  $("#temp").textContent = formatTemp(data.main.temp);
  $("#desc").textContent = `${data.weather[0].main} • feels like ${formatTemp(data.main.feels_like)}`;
  $("#chips").innerHTML = `
    <span class="chip">Humidity ${data.main.humidity}%</span>
    <span class="chip">Pressure ${data.main.pressure} hPa</span>
    <span class="chip">Wind ${data.wind.speed} ${units === "metric" ? "m/s" : "mph"}</span>
  `;
  $("#iconWrap").innerHTML = `<img src="${iconUrl(data.weather[0].icon)}" width="100"/>`;
}

function renderForecast(forecast) {
  let html = "";
  for (let i = 0; i < forecast.list.length; i += 8) {
    const item = forecast.list[i];
    html += `
      <div class="day">
        <div>${new Date(item.dt * 1000).toLocaleDateString("en-US",{weekday:"short"})}</div>
        <img src="${iconUrl(item.weather[0].icon)}" width="50"/>
        <div>${formatTemp(item.main.temp_min)} / ${formatTemp(item.main.temp_max)}</div>
      </div>`;
  }
  $("#forecast").innerHTML = html;
}

async function search(city) {
  try {
    const { current, forecast } = await getWeatherByCity(city);
    renderCurrent(current);
    renderForecast(forecast);
  } catch (err) {
    alert("City not found!");
  }
}

$("#searchBtn").addEventListener("click", () => {
  const city = $("#cityInput").value.trim();
  if (city) search(city);
});
$("#unitBtn").addEventListener("click", () => {
  units = units === "metric" ? "imperial" : "metric";
  $("#unitBtn").textContent = units === "metric" ? "°C" : "°F";
  const city = $("#place").textContent.split(",")[0];
  if (city !== "—") search(city);
});

// Default city
search("Meerut");
