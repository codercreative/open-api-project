# Open API App

[Open Meteo](https://open-meteo.com)
[Open Meteo Geocoding]("https://open-meteo.com/en/docs/geocoding-api)

## Overview

- A simple weather app that uses Open Meteo APIs to show real-time weather data based on the user's city input
- The app displays a weather code illustration, temperature, and the city and country names

## How It Works

The user enters the name of a city, and the app displays:

- A weather code illustration
- The current temperature
- The city and country names

## Key Features

- Fetches live weather data using two Open Meteo APIs
- Displays weather condition (via an illustration), temperature and location
- Pulling API data with async/await JavaScript promises as well as helper functions

## Still in Progress

- Complete function that displays illustration based on city's weather code
- Show a default sun illustration when the app loads
- Display an error message if no city is entered or if the input is invalid
- Clear the input field after displaying the city data
