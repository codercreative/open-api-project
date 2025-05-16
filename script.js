"use strict";

// DECLARING VARIABLES
const cityInput = document.getElementById("city-input");
const weatherCodeIllustrationEl = document.getElementById(
  "weather-code-illustration"
);
const temperatureEl = document.getElementById("temperature");
const cityEl = document.getElementById("city");
const countryEl = document.getElementById("country");
const submitBtn = document.getElementById("submit-btn");

// EVENT LISTENER
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const lowerCaseTrimmedUserInput = cityInput.value.trim();
  const encodedCityInput = encodeURIComponent(lowerCaseTrimmedUserInput);

  fetchCoordinatesFromUsersCityName(encodedCityInput);
});

//CALLING APIS WITH ASYNC FUNCTIONS
//Open Meteo Geocoding API: https://open-meteo.com/en/docs/geocoding-api
async function fetchCoordinatesFromUsersCityName(city) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const data = await response.json();
    //Usually many cities share the same name - for the purposes of this app, I only want to display the first result from the open meteo API:
    const firstResult = data.results[0];
    const cityName = firstResult.name;
    const countryName = firstResult.country;
    const latitude = firstResult.latitude;
    const longitude = firstResult.longitude;
    fetchTemperatureAndWeathercode(latitude, longitude);
    displayCityNameAndCountry(cityName, countryName);
  } catch (error) {
    console.error("An error occurred - couldn't fetch city data", error);
  }
}

// Open Meteo API: https://open-meteo.com/en/docs
async function fetchTemperatureAndWeathercode(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_2m&weather_code`
    );
    const data = await response.json();
    const temperature = data.current_weather.temperature;
    const weatherCode = data.current_weather.weathercode;
    displayWeatherCodeIllustration(weatherCode);
    displayTemperature(temperature);
  } catch (error) {
    console.error("An error occurred", error);
    throw error;
  }
}

//HELPER FUNCTIONS
function displayCityNameAndCountry(city, country) {
  cityEl.textContent = city;
  countryEl.textContent = country;
}

function displayTemperature(temperature) {
  temperatureEl.textContent = `${temperature}°C`;
}

function displayWeatherCodeIllustration(weathercode) {
  console.log(
    `Weather Code: ${weathercode} | `,
    "logic pending in this function for displaying weather illustrations based on the weather codes in the comments at the bottom of the JS file"
  );
}
//Weather codes from Open Meteo API: https://open-meteo.com/en/docs
// WMO Weather interpretation codes (WW)
// Code	Description
// 0	Clear sky
// 1, 2, 3	Mainly clear, partly cloudy, and overcast
// 45, 48	Fog and depositing rime fog
// 51, 53, 55	Drizzle: Light, moderate, and dense intensity
// 56, 57	Freezing Drizzle: Light and dense intensity
// 61, 63, 65	Rain: Slight, moderate and heavy intensity
// 66, 67	Freezing Rain: Light and heavy intensity
// 71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
// 77	Snow grains
// 80, 81, 82	Rain showers: Slight, moderate, and violent
// 85, 86	Snow showers slight and heavy
// 95 *	Thunderstorm: Slight or moderate
// 96, 99 *	Thunderstorm with slight and heavy hail
