import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FloodAlert = () => {
  const [floodRisk, setFloodRisk] = useState(0);
  const [floodWarning, setFloodWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchFloodData = async (latitude, longitude) => {
    try {
      setLoading(true);
      const url = `https://flood-api.open-meteo.com/v1/flood?latitude=${latitude}&longitude=${longitude}&daily=river_discharge`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('ಡೇಟಾ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
      
      const data = await response.json();
      if (!data.daily?.river_discharge) throw new Error('ಅಮಾನ್ಯ ಡೇಟಾ ಫಾರ್ಮ್ಯಾಟ್');

      const dischargeData = data.daily.river_discharge;
      const threshold = 20;
      const latestDischarge = dischargeData[dischargeData.length - 1];

      setFloodRisk((latestDischarge / threshold) * 100);
      setFloodWarning(latestDischarge >= threshold);
      setError(null);
    } catch (err) {
      setError(err.message);
      setFloodRisk(0);
      setFloodWarning(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchFloodData(position.coords.latitude, position.coords.longitude);
        },
        (err) => setError('ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ')
      );
    } else {
      setError('ನಿಮ್ಮ ಬ್ರೌಸರ್ ಸ್ಥಳ ಸೇವೆಗಳನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ');
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ ವ್ಯವಸ್ಥೆ</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flood Risk Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💧</span>
            <h2 className="text-xl font-semibold">ಪ್ರವಾಹ ಅಪಾಯ ಮೌಲ್ಯಮಾಪನ</h2>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
            </div>
          ) : (
            <>
              {/* Risk Meter */}
              <div className="mb-6">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${Math.min(floodRisk, 100)}%` }}
                    className={`h-full transition-all duration-1000 ${
                      floodRisk > 75 ? 'bg-red-500' :
                      floodRisk > 50 ? 'bg-yellow-500' :
                      'bg-emerald-500'
                    }`}
                  />
                </div>
                <p className="text-center mt-2">
                  ಅಪಾಯದ ಮಟ್ಟ: {Math.round(floodRisk)}%
                </p>
              </div>

              {/* Warning Message */}
              {floodWarning ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <p className="text-red-700">
                      ಹೆಚ್ಚಿನ ಪ್ರವಾಹ ಅಪಾಯವಿದೆ! ಮುಂಜಾಗ್ರತೆ ವಹಿಸಿ.
                    </p>
                  </div>
                  <div className="mt-4 space-y-2 text-red-600">
                    <p>• ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ಸ್ಥಳಾಂತರಿಸಲು ಸಿದ್ಧರಾಗಿ</p>
                    <p>• ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಿ</p>
                    <p>• ತುರ್ತು ಸಂಪರ್ಕ ಸಂಖ್ಯೆಗಳನ್ನು ಬರೆದಿಟ್ಟುಕೊಳ್ಳಿ</p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <p className="text-emerald-700">
                      ಸಾಮಾನ್ಯ ಪ್ರವಾಹ ಅಪಾಯ ಮಟ್ಟ.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">☎️</span>
            <h2 className="text-xl font-semibold">ತುರ್ತು ಸಂಪರ್ಕಗಳು</h2>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium">ರಾಜ್ಯ ತುರ್ತು ಕೇಂದ್ರ</div>
              <div className="text-xl font-bold">📞 1070</div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium">ಜಿಲ್ಲಾ ತುರ್ತು ಕೇಂದ್ರ</div>
              <div className="text-xl font-bold">📞 1077</div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium">ಪೊಲೀಸ್ ನಿಯಂತ್ರಣ ಕೊಠಡಿ</div>
              <div className="text-xl font-bold">📞 100</div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
            >
              ಮಾಹಿತಿ ನವೀಕರಿಸಿ
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default FloodAlert;
