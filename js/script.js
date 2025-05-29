"use strict";
//This project uses weather data provided by Open-Meteo: https://open-meteo.com/

// DECLARING VARIABLES
//Global variables for saved API data from the two async functions so I can access them across functions
let savedGeoLocationDetails;
let savedWeatherDetails;
let savedLatitude;
let savedLongitude;
let isDay;

//Variable for when user inputs zip code and clicking submit
const zipCodeInput = document.getElementById("zip-code-input");
const submitBtn = document.getElementById("submit-btn");

//Variables in connection with what gets displayed when user clicks on submit button
const temperatureEl = document.getElementById("temperature");
const cityEl = document.getElementById("city");
const usaStateEl = document.getElementById("usa-state");
const weatherIconEl = document.getElementById("weather-icon");
const weatherCodeDescriptionEl = document.getElementById(
  "weather-code-description"
);

//Variables in connection with what gets displayed when user clicks on the more details button
const moreInfoSectionEl = document.getElementById("more-info-section");
const moreInfoBtn = document.getElementById("more-info-btn");
const tempFeelsLikeEl = document.getElementById("temp-feels-like");
const windSpeedEl = document.getElementById("wind-speed");
const windDirectionEl = document.getElementById("wind-direction");
const uvEl = document.getElementById("uv-max");

//Variable for error message
const errorMsg = document.getElementById("error-msg");

//Varialbe for displaying footer
const footerEl = document.getElementById("footer");

// EVENT LISTENERS

//Clearing the zip code input as well as placeholder when user clicks into the field AND resetting all fields to default state
zipCodeInput.addEventListener("focus", () => {
  zipCodeInput.value = "";
  zipCodeInput.placeholder = "";
  errorMsg.classList.add("hidden");
  temperatureEl.textContent = "Fahrenheit";
  cityEl.textContent = "City";
  usaStateEl.textContent = "State";
  weatherIconEl.src = "../images/sun.webp";
  weatherCodeDescriptionEl.textContent = "Description";
  tempFeelsLikeEl.textContent = "Apparent Temp";
  windSpeedEl.textContent = "Wind Speed";
  windDirectionEl.textContent = "Wind Direction";
  uvEl.textContent = "UV Index";
});

//When clicking outside the zip code input field the placeholder returns
zipCodeInput.addEventListener("blur", () => {
  zipCodeInput.placeholder = "e.g., 10001";
});

//Clicking on this button will display temperature, city, state, weather illustration

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const trimmedZipCodeInput = zipCodeInput.value.trim();
  fetchGeoLocationFromUserZipCodeInput(trimmedZipCodeInput);
});

//Clicking on this button will display weather code description and...
moreInfoBtn.addEventListener("click", () => {
  if (!savedWeatherDetails) {
    displayErrorMessage();
  } else {
    fetchMoreWeatherInfo(savedLatitude, savedLongitude);
  }
});

//CALLING APIS WITH ASYNC FUNCTIONS
//Open Meteo Geocoding API: https://open-meteo.com/en/docs/geocoding-api

//NOTE: Unintuitively, I had to use name in the fetch() to obtain the zip code from the API (even though "postcodes" exists in the API. However, if I use "postcodes", I get an error...)
async function fetchGeoLocationFromUserZipCodeInput(zipcode) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?country_code=US&name=${zipcode}`
    );
    const data = await response.json();
    savedGeoLocationDetails = data;
    console.log(savedGeoLocationDetails);
    if (
      !savedGeoLocationDetails.results ||
      savedGeoLocationDetails.results.length === 0 ||
      savedGeoLocationDetails.results[0].country !== "United States"
    ) {
      displayErrorMessage();
      return;
    }
    //NOTE about const firstResult = data.results[0]: Even when searching by specific US zip codes and setting `country_code=US`, the Open-Meteo API may return additional results from other countries. For simplicity, this app uses only the first result in the returned array, which has consistently been the correct U.S. location in testing.
    const firstResult = savedGeoLocationDetails.results[0];
    const cityName = firstResult.name;
    const usaState = firstResult.admin1;
    const latitude = firstResult.latitude;
    const longitude = firstResult.longitude;

    cityEl.textContent = cityName;
    usaStateEl.textContent = usaState;

    // display temp, cityName, usaState, illustration);
    fetchTempCityStateWeatherIllustration(latitude, longitude);
  } catch (error) {
    console.error("An error occurred - couldn't fetch zip code data", error);
  }
}

//Open Meteo API: https://open-meteo.com/en/docs
async function fetchTempCityStateWeatherIllustration(latitude, longitude) {
  //Sometimes it takes a little while to load the temperature - so I am adding this comment for better user experience:
  temperatureEl.textContent = `Just a sec...`;

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
    );

    const data = await response.json();
    savedWeatherDetails = data;
    console.log(savedWeatherDetails);
    savedLatitude = data.latitude;
    savedLongitude = data.longitude;

    //Getting temperature
    const temperature = savedWeatherDetails.current_weather.temperature;
    temperatureEl.textContent = `${((temperature * 9) / 5 + 32).toFixed(1)} °F`;

    //Using isDay to determine wheter it is day or night. If day then 1, otherwise it is 0 - based on sunrise and sunset. I am using the isDay to determine whether I will show a moon or a sun. If night, I replace the two sun illustrations (sun + partly cloudy) with moons based on the weather code. See helper function: getWeatherCodeIllustrationPath(weathercode)
    isDay = savedWeatherDetails.current_weather.is_day === 1;

    //Getting weather code image path
    const weatherCode = savedWeatherDetails.current_weather.weathercode;
    weatherIconEl.src = getWeatherCodeIllustrationPath(weatherCode);

    //Description of weather code
    weatherCodeDescriptionEl.textContent =
      getWeatherCodeDescription(weatherCode);
  } catch (error) {
    console.error(
      "An error occurred. Couldn't fetch temperature, city and state",
      error
    );
    throw error;
  }
}

//ASYNC FUNCTION FOR MORE INFORMATION BUTTON
//Open Meteo API: https://open-meteo.com/en/docs
//Since I am using global variables for latitude and longitude, I don't need to pass them in as parameters here. The zip code information has already been loaded by this time, so it won't break my app
// async function fetchMoreWeatherInfo(latitude, longitude)
async function fetchMoreWeatherInfo() {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${savedLatitude}&longitude=${savedLongitude}&temperature_unit=fahrenheit&daily=apparent_temperature_mean,uv_index_max,wind_speed_10m_max,wind_direction_10m_dominant`
    );

    const data = await response.json();
    const savedMoreInfoWeatherDetails = data;
    console.log(savedMoreInfoWeatherDetails);
    const daily = savedMoreInfoWeatherDetails.daily;
    const tempFeelsLike = daily.apparent_temperature_mean[0];
    const windSpeed = daily.wind_speed_10m_max[0];
    const windDirection = daily.wind_direction_10m_dominant[0];
    const uv = daily.uv_index_max[0];
    console.log(tempFeelsLike, windSpeed, windDirection, uv);

    //Temperature feels like text
    tempFeelsLikeEl.textContent = `Feels like: ${tempFeelsLike} °F`;

    //Wind speed text
    //converting km/h to mph
    windSpeedEl.textContent = `${getWindSpeedDescription(windSpeed)}: ${(
      windSpeed * 0.621371
    ).toFixed(0)} mph`;

    //Wind direction text
    windDirectionEl.textContent = `Wind direction: ${getWindDirection(
      windDirection
    )}`;
    uvEl.textContent = `UV: ${uv.toFixed(0)} (${getUVExposureDescription(uv)})`;
  } catch (error) {
    console.error(
      "An error occurred. Couldn't fetch apparent temp, wind speed, wind direction, uv index",
      error
    );
    throw error;
  }
}

//HELPER FUNCTIONS

//Get the images' path depending on the weather code from open meteo
function getWeatherCodeIllustrationPath(weathercode) {
  if ([0, 1].includes(weathercode))
    return isDay ? "../images/sun.webp" : "../images/clear-night.webp";
  if (weathercode === 2)
    return isDay
      ? "../images/partly-cloudy.webp"
      : "../images/cloudy-night.webp";
  if (weathercode === 3) return "../images/overcast.webp";
  if ([45, 48].includes(weathercode)) return "../images/fog.webp";
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weathercode)
  )
    return "images/rain.webp";
  if ([77, 85, 86].includes(weathercode)) return "../images/snow.webp";
  if ([95, 96, 99].includes(weathercode)) return "../images/lightning.webp";
}

//Description for the weather code from open meteo
function getWeatherCodeDescription(weathercode) {
  let descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    56: "Light freezing drizzle",
    57: "Dense intensity drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with light hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[weathercode];
}

//Helper function for wind speed
//Used the Beaufort Wind Scale
//https://www.weather.gov/mfl/beaufort
//Note: Combined "Moderate breeze" and "Fresh breeze" to "Breezy"
//Note: Instead of "Near gale" I use the description "Very windy"
function getWindSpeedDescription(wind) {
  if (wind <= 1) return "Calm";
  if (wind <= 3) return "Light air";
  if (wind <= 7) return "Light breeze";
  if (wind <= 12) return "Gentle breeze";
  if (wind <= 24) return "Breezy";
  if (wind <= 31) return "Strong breeze";
  if (wind <= 38) return "Very windy";
  if (wind <= 46) return "Gale";
  if (wind <= 54) return "Severe gale";
  if (wind <= 63) return "Storm";
  if (wind <= 72) return "Violent storm";
  return "Hurricane";
}

//Helper function for wind direction
//Using  8 (360 / 8 = 45°) slices intentionally for simplicity and user clarity
// This covers the main wind directions: N, NE, E, SE, S, SW, W, NW.
function getWindDirection(windDegree) {
  if (windDegree >= 0 && windDegree < 45) return "N";
  if (windDegree >= 45 && windDegree < 90) return "NE";
  if (windDegree >= 90 && windDegree < 135) return "E";
  if (windDegree >= 135 && windDegree < 180) return "SE";
  if (windDegree >= 180 && windDegree < 225) return "S";
  if (windDegree >= 225 && windDegree < 270) return "SW";
  if (windDegree >= 270 && windDegree < 315) return "W";
  if (windDegree >= 315 && windDegree < 360) return "NW";
}

//Helper function for UV exposure
function getUVExposureDescription(uvIndex) {
  console.log("UV index received", uvIndex);
  if (uvIndex < 3) return "Low";
  if (uvIndex < 6) return "Moderate";
  if (uvIndex < 8) return "High";
  return "Very high";
}

//Display error message
function displayErrorMessage() {
  errorMsg.classList.remove("hidden");
}

// FOOTER SECTION
const copyright = document.createElement("p");
footerEl.appendChild(copyright);

const today = new Date();
const thisYear = today.getFullYear();

copyright.textContent = `\u00A9 Christina Ligare ${thisYear}`;

//FOR REFERENCE: Weather codes from Open Meteo API: https://open-meteo.com/en/docs
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
