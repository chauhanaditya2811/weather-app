const cityEl = document.getElementById('city');
const temperatureEl = document.getElementById('temperature');
const conditionEl = document.getElementById('condition');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const countryEl = document.getElementById('country');
const updatedAtEl = document.getElementById('updatedAt');
const forecastEl = document.getElementById('forecast');
const refreshBtn = document.getElementById('refreshBtn');
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const suggestionsEl = document.getElementById('suggestions');
const weatherIconEl = document.getElementById('weatherIcon');

const DEFAULT_CITY = 'Puducherry';

function mapWeatherCode(code) {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Freezing drizzle',
    57: 'Heavy freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Heavy showers',
    82: 'Violent showers',
    85: 'Light snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm',
  };

  return conditions[code] || 'Changing weather';
}

function getWeatherIcon(code) {
  if ([0, 1].includes(code)) return '☀️';
  if ([2, 3].includes(code)) return '⛅';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌤️';
}

function getWeatherBackground(code) {
  const backgrounds = {
    clear: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
    cloudy: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1600&q=80',
    rain: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80',
    snow: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1600&q=80',
    storm: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=80',
    mist: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80',
  };

  if ([0, 1].includes(code)) return backgrounds.clear;
  if ([2, 3].includes(code)) return backgrounds.cloudy;
  if ([45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return backgrounds.rain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return backgrounds.snow;
  if ([95, 96, 99].includes(code)) return backgrounds.storm;
  return backgrounds.mist;
}

function getThemeForWeatherCode(code) {
  if ([0, 1].includes(code)) return 'clear';
  if ([2, 3].includes(code)) return 'cloudy';
  if ([45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  return 'mist';
}

function formatForecastDay(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
  });
}

function renderForecast(items) {
  forecastEl.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'forecast-item';

    card.innerHTML = `
      <p>${formatForecastDay(item.date)}</p>
      <strong>${Math.round(item.maxTemp)}°C</strong>
      <p>${getWeatherIcon(item.code)}</p>
    `;

    forecastEl.appendChild(card);
  });
}

function setLoadingState() {
  cityEl.textContent = 'Loading weather...';
  temperatureEl.textContent = '--';
  conditionEl.textContent = 'Fetching data';
  humidityEl.textContent = '--';
  windSpeedEl.textContent = '--';
  countryEl.textContent = '--';
  updatedAtEl.textContent = '--';
  weatherIconEl.textContent = '⏳';
  forecastEl.innerHTML = '<p class="loading-text">Loading forecast...</p>';
  suggestionsEl.innerHTML = '';
}

function updateWeather(data) {
  cityEl.textContent = data.city;
  temperatureEl.textContent = Math.round(data.temperature);
  conditionEl.textContent = data.condition;
  humidityEl.textContent = `${data.humidity}%`;
  windSpeedEl.textContent = `${Math.round(data.windSpeed)} km/h`;
  countryEl.textContent = data.country;
  updatedAtEl.textContent = data.updatedAt;
  weatherIconEl.textContent = getWeatherIcon(data.weatherCode);

  document.body.style.backgroundImage = `linear-gradient(rgba(12, 17, 27, 0.25), rgba(12, 17, 27, 0.3)), url('${getWeatherBackground(data.weatherCode)}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';

  renderForecast(data.forecast);
}

async function fetchSuggestions(query) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    suggestionsEl.innerHTML = '';
    return;
  }

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedQuery)}&count=5&language=en&format=json`
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const suggestions = data.results || [];

    suggestionsEl.innerHTML = '';

    suggestions.forEach((place) => {
      const item = document.createElement('li');
      item.className = 'suggestion-item';
      item.textContent = `${place.name}${place.country ? ', ' + place.country : ''}`;
      item.addEventListener('click', () => {
        cityInput.value = place.name;
        suggestionsEl.innerHTML = '';
        fetchWeatherForCity(place.name);
      });
      suggestionsEl.appendChild(item);
    });
  } catch (error) {
    suggestionsEl.innerHTML = '';
  }
}

async function fetchWeatherForCity(cityName) {
  const trimmedCity = cityName.trim();

  if (!trimmedCity) {
    cityInput.focus();
    return;
  }

  setLoadingState();

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedCity)}&count=1&language=en&format=json`
    );

    if (!geoResponse.ok) {
      throw new Error('City lookup failed');
    }

    const geoData = await geoResponse.json();
    const place = geoData.results?.[0];

    if (!place) {
      throw new Error('City not found');
    }

    const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
    weatherUrl.search = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
      daily: 'weather_code,temperature_2m_max',
      timezone: 'auto',
      forecast_days: '3',
    }).toString();

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error('Weather data request failed');
    }

    const weatherData = await weatherResponse.json();
    const forecast = (weatherData.daily?.time || []).map((date, index) => ({
      date,
      maxTemp: weatherData.daily.temperature_2m_max[index],
      code: weatherData.daily.weather_code[index],
    }));

    const current = weatherData.current;

    updateWeather({
      city: place.name,
      country: place.country || place.country_code || 'N/A',
      temperature: current.temperature_2m,
      condition: mapWeatherCode(current.weather_code),
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      updatedAt: new Date(current.time).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      forecast,
    });
  } catch (error) {
    cityEl.textContent = 'Weather unavailable';
    conditionEl.textContent = error.message || 'Please try another city';
    temperatureEl.textContent = '--';
    humidityEl.textContent = '--';
    windSpeedEl.textContent = '--';
    countryEl.textContent = '--';
    updatedAtEl.textContent = '--';
    weatherIconEl.textContent = '⚠️';
    forecastEl.innerHTML = '<p class="error-text">Unable to fetch forecast for this location.</p>';
  }
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  suggestionsEl.innerHTML = '';
  fetchWeatherForCity(cityInput.value);
});

cityInput.addEventListener('input', (event) => {
  fetchSuggestions(event.target.value);
});

refreshBtn.addEventListener('click', () => {
  fetchWeatherForCity(cityInput.value || DEFAULT_CITY);
});

fetchWeatherForCity(DEFAULT_CITY);
