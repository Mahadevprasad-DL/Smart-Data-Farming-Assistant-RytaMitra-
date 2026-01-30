import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Weather = () => {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const API_KEY = '99fdd4cb00e534bbbba703cfd9cfa34d';
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeather(data);
        
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!forecastResponse.ok) {
          throw new Error('Failed to fetch forecast data');
        }
        const forecastData = await forecastResponse.json();
        setForecast(forecastData);
        setError(null);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Failed to get location. Please enable location services.');
        setLoading(false);
      }
    );
  }, []);

  const generateFarmerAdvisory = (weatherData) => {
    if (!weatherData || !weatherData.main) return [];
    
    const advisories = [];
    const { temp, humidity } = weatherData.main;
    const windSpeed = weatherData.wind?.speed || 0;

    // Temperature based advisories
    if (temp > 35) {
      advisories.push('agriculture.weather.advisoryList.highTemp');
      advisories.push('agriculture.weather.advisoryList.waterCrops');
    }
    if (temp < 10) {
      advisories.push('agriculture.weather.advisoryList.lowTemp');
      advisories.push('agriculture.weather.advisoryList.frostProtection');
    }

    // Humidity based advisories
    if (humidity > 80) {
      advisories.push('agriculture.weather.advisoryList.highHumidity');
      advisories.push('agriculture.weather.advisoryList.fungalAlert');
    }
    if (humidity < 30) {
      advisories.push('agriculture.weather.advisoryList.lowHumidity');
      advisories.push('agriculture.weather.advisoryList.waterConservation');
    }

    // Wind based advisories
    if (windSpeed > 10) {
      advisories.push('agriculture.weather.advisoryList.strongWind');
      advisories.push('agriculture.weather.advisoryList.cropSupport');
    }

    // Time of day specific advice
    const hour = new Date().getHours();
    if (hour >= 10 && hour <= 16) {
      advisories.push('agriculture.weather.advisoryList.noonActivity');
    }

    return advisories;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p>{t('agriculture.weather.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="text-center">{error}</p>
        <p className="text-center mt-2 text-sm">
          {t('agriculture.weather.errorMessage')}
        </p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        <p className="text-center">{t('agriculture.weather.noData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      {weather && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">{t('agriculture.weather.current')}</h3>
                <p className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</p>
                <p className="text-lg">{weather.weather[0].description}</p>
              </div>
              <div className="text-6xl">
                {getWeatherEmoji(weather.weather[0].main)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm opacity-75">{t('agriculture.weather.humidity')}</p>
                <p className="text-xl">{weather.main.humidity}%</p>
              </div>
              <div>
                <p className="text-sm opacity-75">{t('agriculture.weather.wind')}</p>
                <p className="text-xl">{Math.round(weather.wind.speed)} m/s</p>
              </div>
            </div>
          </div>

          {/* Farmer's Advisory */}
          <div className="bg-emerald-50 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">{t('agriculture.weather.advisory')}</h3>
            <div className="space-y-3">
              {generateFarmerAdvisory(weather).map((advice, index) => (
                <p key={index} className="flex items-center gap-2">
                  <span className="text-emerald-600">•</span>
                  {t(advice)}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5-day Forecast */}
      {forecast && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">{t('agriculture.weather.forecast')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {forecast.list
              .filter((_, index) => index % 8 === 0)
              .slice(0, 5)
              .map((day, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {new Date(day.dt * 1000).toLocaleDateString()}
                  </p>
                  <div className="text-2xl my-2">
                    {getWeatherEmoji(day.weather[0].main)}
                  </div>
                  <p className="font-bold">{Math.round(day.main.temp)}°C</p>
                  <p className="text-sm text-gray-600">{day.weather[0].description}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getWeatherEmoji = (condition) => {
  const emojis = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Snow: '❄️',
    Thunderstorm: '⛈️',
    Drizzle: '🌦️',
    Mist: '🌫️'
  };
  return emojis[condition] || '🌤️';
};

export default Weather;
