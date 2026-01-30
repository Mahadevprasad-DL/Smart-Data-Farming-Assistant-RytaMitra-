import React, { useState, useEffect } from 'react';
import { FaWater, FaCloudRain, FaTemperatureHigh, FaTint } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Irrigation = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchWeatherData = async (lat, lon) => {
    try {
      const API_KEY = '99fdd4cb00e534bbbba703cfd9cfa34d';
      
      // Get current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const weatherData = await weatherResponse.json();
      
      // Get 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastResponse.json();

      setWeatherData(weatherData);
      setForecast(forecastData);
      setError(null);
    } catch (err) {
      setError('ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (err) => setError('ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ')
      );
    } else {
      setError('ಸ್ಥಳ ಸೇವೆಗಳು ಲಭ್ಯವಿಲ್ಲ');
    }
  }, []);

  useEffect(() => {
    const handleVoiceCommands = (event) => {
      const command = event.detail.toLowerCase();
      if (['ಕೃಷಿ ಪುಟ', 'ಹಿಂದೆ ಹೋಗು', 'ಮುಖ್ಯ ಪುಟ'].includes(command)) {
        navigate('/agriculture');
      } else if (['ಮಾಹಿತಿ ನವೀಕರಿಸು', 'ರಿಫ್ರೆಶ್'].includes(command)) {
        window.location.reload();
      }
    };

    window.addEventListener('voiceCommand', handleVoiceCommands);
    return () => window.removeEventListener('voiceCommand', handleVoiceCommands);
  }, [navigate]);

  const calculateIrrigationNeeds = () => {
    if (!weatherData || !forecast) return null;

    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const willRain = forecast.list.some(item => 
      item.weather[0].main === 'Rain' && 
      new Date(item.dt * 1000) < new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    // Base water requirement (mm per day)
    let waterNeed = 5; // Base requirement

    // Adjust for temperature
    if (temp > 30) waterNeed += 2;
    else if (temp > 25) waterNeed += 1;

    // Adjust for humidity
    if (humidity < 40) waterNeed += 1.5;
    else if (humidity < 60) waterNeed += 0.5;

    // Adjust for wind
    if (windSpeed > 5) waterNeed += 1;

    // Adjust if rain is expected
    if (willRain) waterNeed = Math.max(0, waterNeed - 3);

    return {
      waterNeed,
      willRain,
      adjustments: {
        temperature: temp > 25,
        humidity: humidity < 60,
        wind: windSpeed > 5
      }
    };
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">ನೀರಾವರಿ ಮಾರ್ಗದರ್ಶಿ</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 border border-red-200">
          {error}
        </div>
      ) : weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Weather & Irrigation Need */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaWater className="text-3xl text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">ಇಂದಿನ ನೀರಾವರಿ ಶಿಫಾರಸು</h2>
              </div>
            </div>

            {(() => {
              const needs = calculateIrrigationNeeds();
              if (!needs) return null;

              return (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    needs.willRain ? 'bg-blue-50' : 
                    needs.waterNeed > 6 ? 'bg-red-50' : 'bg-emerald-50'
                  }`}>
                    <h3 className="font-semibold mb-2">
                      {needs.willRain ? '🌧️ ಮಳೆ ನಿರೀಕ್ಷೆ' :
                       needs.waterNeed > 6 ? '⚠️ ಹೆಚ್ಚಿನ ನೀರಿನ ಅಗತ್ಯವಿದೆ' :
                       '✅ ಸಾಮಾನ್ಯ ನೀರಾವರಿ'}
                    </h3>
                    <p className="text-lg font-bold mb-2">
                      {needs.waterNeed.toFixed(1)} ಲೀಟರ್/ಚದರ ಮೀಟರ್
                    </p>
                    <div className="space-y-2 text-sm">
                      {needs.adjustments.temperature && 
                        <p>• ಹೆಚ್ಚಿನ ತಾಪಮಾನದಿಂದ ಹೆಚ್ಚುವರಿ ನೀರಿನ ಅಗತ್ಯವಿದೆ</p>}
                      {needs.adjustments.humidity && 
                        <p>• ಕಡಿಮೆ ಆರ್ದ್ರತೆಯಿಂದ ಹೆಚ್ಚುವರಿ ನೀರಿನ ಅಗತ್ಯವಿದೆ</p>}
                      {needs.adjustments.wind && 
                        <p>• ಗಾಳಿಯಿಂದ ಹೆಚ್ಚುವರಿ ಆವಿಯಾಗುವಿಕೆ</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">ಇಂದಿನ ಹವಾಮಾನ:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">ತಾಪಮಾನ</p>
                        <p className="text-xl font-bold">{weatherData.main.temp.toFixed(1)}°C</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ಆರ್ದ್ರತೆ</p>
                        <p className="text-xl font-bold">{weatherData.main.humidity}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Irrigation Tips */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">ದಿನದ ಉತ್ತಮ ನೀರಾವರಿ ಸಮಯ</h2>
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-800">ಬೆಳಿಗ್ಗೆ 6-8 ಗಂಟೆ</h3>
                <p className="text-sm text-emerald-600">
                  • ಕಡಿಮೆ ಆವಿಯಾಗುವಿಕೆ<br/>
                  • ಉತ್ತಮ ನೀರಿನ ಹೀರುವಿಕೆ<br/>
                  • ಸಸ್ಯಗಳಿಗೆ ದಿನದ ಆರಂಭದಲ್ಲಿ ನೀರು
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">ಸಂಜೆ 4-6 ಗಂಟೆ</h3>
                <p className="text-sm text-blue-600">
                  • ತಂಪಾದ ವಾತಾವರಣ<br/>
                  • ಮಣ್ಣಿನಲ್ಲಿ ರಾತ್ರಿಯುದ್ದಕ್ಕೂ ತೇವಾಂಶ<br/>
                  • ಸೂರ್ಯನ ಬಿಸಿಲು ಕಡಿಮೆ
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Irrigation;
