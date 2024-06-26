const apiKey = '0bd6c744a048b990ba28604394800459';
let isCelsius = true;
let searchHistory = [];

document.addEventListener('DOMContentLoaded', () => {
    // Hide weather icon initially
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'none'; 
});

function getWeather() {
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            if (!searchHistory.includes(city)) {
                searchHistory.push(city);
                updateSearchHistory();
            }
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching current weather data. Please try again.');
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            alert('Error fetching forecast data. Please try again.');
        });
}

function displayWeather(data) {
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    weatherInfoDiv.innerHTML = '';
    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const date = new Date().toLocaleDateString();
        let temperature = data.main.temp - 273.15;
        if (!isCelsius) {
            temperature = (temperature * 9 / 5) + 32;
        }
        const temperatureUnit = isCelsius ? '°C' : '°F';
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;

        weatherInfoDiv.innerHTML = `
            <h3>${cityName} (${date})</h3>
            <img src="${iconUrl}" alt="${description}">
            <p>${Math.round(temperature)}${temperatureUnit}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
            <p>${description}</p>
        `;
    }
}

function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast-data');
    forecastDiv.innerHTML = '';

    // Filter and display each day's forecast
    const dailyForecasts = getDailyForecasts(data.list);

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.date).toLocaleDateString();
        const temperature = isCelsius ? `${Math.round(forecast.temp)}°C` : `${Math.round(forecast.temp * 9 / 5 + 32)}°F`;
        const humidity = `${forecast.humidity}%`;
        const windSpeed = `${forecast.windSpeed} m/s`;
        const description = forecast.description;
        const iconUrl = `https://openweathermap.org/img/wn/${forecast.icon}.png`;

        forecastDiv.innerHTML += `
            <div class="forecast-item">
                <h4>${date}</h4>
                <img src="${iconUrl}" alt="${description}">
                <p>Temperature: ${temperature}</p>
                <p>Humidity: ${humidity}</p>
                <p>Wind Speed: ${windSpeed}</p>
                <p>${description}</p>
            </div>
        `;
    });
}

function getDailyForecasts(data) {
    const dailyForecasts = [];
    const days = {};

    data.forEach(item => {
        const date = item.dt_txt.split(' ')[0]; 
        if (!days[date]) {
            days[date] = {
                date: item.dt_txt,
                temp: item.main.temp - 273.15, 
                humidity: item.main.humidity,
                windSpeed: item.wind.speed,
                description: item.weather[0].description,
                icon: item.weather[0].icon
            };
        } else {
            // Update the daily forecast if a later entry for the same day is found
            if (item.main.temp - 273.15 > days[date].temp) {
                days[date].temp = item.main.temp - 273.15;
                days[date].humidity = item.main.humidity;
                days[date].windSpeed = item.wind.speed;
                days[date].description = item.weather[0].description;
                days[date].icon = item.weather[0].icon;
            }
        }
    });

    // Convert days object to array 
    for (const key in days) {
        dailyForecasts.push(days[key]);
    }
    // Return only the next 5 days 
    return dailyForecasts.slice(0, 5); 
}

function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    getWeather();
}

function updateSearchHistory() {
    const searchHistoryDiv = document.getElementById('search-history');
    searchHistoryDiv.innerHTML = '<h3>Search History</h3>';

    searchHistory.forEach(city => {
        const cityBtn = document.createElement('button');
        cityBtn.textContent = city;
        cityBtn.onclick = () => {
            document.getElementById('city').value = city;
            getWeather();
        };
        searchHistoryDiv.appendChild(cityBtn);
    });
}

document.getElementById('toggle-temp-unit').addEventListener('click', toggleTemperatureUnit);
