// DOM Elements (match all IDs from HTML)
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const tempMax = document.getElementById('temp-max');
const tempMin = document.getElementById('temp-min');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const rain = document.getElementById('rain');
const dateElement = document.getElementById('date');
const cropRecommendations = document.getElementById('crop-recommendations');
const soilTip = document.getElementById('soil-tip').querySelector('p');

// API Key - REPLACE WITH YOURS!
const API_KEY = '3c90c14eb84257314f52c6d716f64b9d';

// Current date
dateElement.textContent = new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
locationBtn.addEventListener('click', getLocationWeather);
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchWeather();
});

// Functions
function searchWeather() {
  const city = cityInput.value.trim();
  if (!city) return alert('Please enter a city');
  fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
}

function getLocationWeather() {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
  }, error => {
    alert("Location access denied");
  });
}

function fetchWeather(apiUrl) {
  // Show loading state
  cropRecommendations.innerHTML = '<div class="loader"></div>';
  soilTip.textContent = "Loading data...";
  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    })
    .then(data => {
      displayWeather(data);
      recommendCrops(data);
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Failed to get weather: " + error.message);
    });
}

function displayWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  weatherDescription.textContent = data.weather[0].description;
  tempMax.textContent = `${Math.round(data.main.temp_max)}°C`;
  tempMin.textContent = `${Math.round(data.main.temp_min)}°C`;
  humidity.textContent = `${data.main.humidity}%`;
  windSpeed.textContent = `${data.wind.speed} m/s`;
  rain.textContent = data.rain ? `${data.rain['1h'] || 0} mm` : '0 mm';
  
  // Set weather icon
  setWeatherIcon(data.weather[0].id);
}

function setWeatherIcon(weatherId) {
  weatherIcon.innerHTML = '';
  const icon = document.createElement('i');
  
  if (weatherId >= 200 && weatherId < 300) {
    icon.className = 'fas fa-bolt'; // Thunderstorm
  } else if (weatherId >= 300 && weatherId < 500) {
    icon.className = 'fas fa-cloud-rain'; // Drizzle
  } else if (weatherId >= 500 && weatherId < 600) {
    icon.className = 'fas fa-cloud-showers-heavy'; // Rain
  } else if (weatherId >= 600 && weatherId < 700) {
    icon.className = 'fas fa-snowflake'; // Snow
  } else if (weatherId >= 700 && weatherId < 800) {
    icon.className = 'fas fa-smog'; // Atmosphere
  } else if (weatherId === 800) {
    icon.className = 'fas fa-sun'; // Clear
  } else {
    icon.className = 'fas fa-cloud'; // Clouds
  }
  
  weatherIcon.appendChild(icon);
}

function recommendCrops(data) {
  const temp = data.main.temp;
  const humidity = data.main.humidity;
  const rainfall = data.rain ? (data.rain['1h'] || 0) : 0;
  
  let crops = [];
  let soilAdvice = '';

  // Temperature-based recommendations
  if (temp < 5) {
    crops = ["Winter Wheat", "Kale", "Spinach"];
    soilAdvice = "Use cold-resistant varieties with good drainage.";
  } 
  else if (temp < 15) {
    crops = ["Potatoes", "Broccoli", "Carrots"];
    soilAdvice = "Well-drained loamy soil with pH 6.0-7.0 works best.";
  } 
  else if (temp < 25) {
    crops = ["Tomatoes", "Corn", "Beans"];
    soilAdvice = "Rich organic matter with consistent moisture.";
  } 
  else {
    crops = ["Okra", "Sweet Potatoes", "Eggplant"];
    soilAdvice = "Mulch heavily to retain soil moisture.";
  }

  // Humidity adjustments
  if (humidity > 70) {
    crops = crops.filter(crop => !["Tomatoes", "Squash"].includes(crop));
    crops.push("Rice", "Taro");
    soilAdvice += " Ensure good air circulation to prevent mold.";
  } 
  else if (humidity < 30) {
    crops = crops.filter(crop => !["Lettuce", "Spinach"].includes(crop));
    crops.push("Agave", "Aloe Vera");
    soilAdvice += " Use drip irrigation for water efficiency.";
  }

  // Rainfall adjustments
  if (rainfall > 10) {
    crops = crops.filter(crop => !["Basil", "Rosemary"].includes(crop));
    crops.push("Watercress", "Rice");
    soilAdvice += " Consider raised beds for better drainage.";
  }

  // Display recommendations
  cropRecommendations.innerHTML = `
    <div class="crop-list">
      <h3><i class="fas fa-seedling"></i> Recommended Crops</h3>
      <ul>
        ${crops.map(crop => `<li><i class="fas fa-leaf"></i> ${crop}</li>`).join('')}
      </ul>
      <p class="weather-conditions">
        Current conditions: ${temp}°C | Humidity: ${humidity}% | Rain: ${rainfall}mm
      </p>
    </div>
  `;
  
  soilTip.textContent = soilAdvice;
}