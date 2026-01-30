import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Weather from '../components/Weather';

const Agriculture = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleVoiceCommands = (event) => {
      const command = event.detail.toLowerCase();
      if (['ರೋಗ ಪತ್ತೆ', 'ಸಸ್ಯ ರೋಗ', 'ಬೆಳೆ ರೋಗ'].includes(command)) {
        navigate('/detection');
      } else if (['ಪ್ರವಾಹ', 'ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ', 'ನೆರೆ ಮಾಹಿತಿ'].includes(command)) {
        navigate('/alert');
      } else if (['ನೀರಾವರಿ', 'ನೀರು ಹಾಕುವುದು', 'ನೀರು ನಿರ್ವಹಣೆ'].includes(command)) {
        navigate('/irrigation');
      }
    };

    window.addEventListener('voiceCommand', handleVoiceCommands);
    return () => window.removeEventListener('voiceCommand', handleVoiceCommands);
  }, [navigate]);

  const sections = [
    {
      id: 'weather',
      title: t('agriculture.weather.title'),
      icon: '🌤️',
      description: t('agriculture.weather.description'),
      component: <Weather />
    },
    {
      id: 'flood',
      title: t('agriculture.flood.title'),
      icon: '🌊',
      description: t('agriculture.flood.description'),
      onClick: () => navigate('/alert')
    },
    {
      id: 'crop',
      title: 'Crop Recommendation',
      icon: '🌾',
      description: 'AI-powered crop recommendations based on soil and environmental conditions',
      onClick: () => navigate('/detection')
    },
    {
      id: 'irrigation',
      title: t('agriculture.irrigation.title'),
      icon: '💧',
      description: t('agriculture.irrigation.description'),
      onClick: () => navigate('/irrigation')
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">{t('agriculture.title')}</h1>

      {/* Weather Dashboard */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <Weather />
      </div>

      {/* Other Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.filter(section => section.id !== 'weather').map((section) => (
          <div
            key={section.id}
            onClick={section.onClick}
            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl transition-transform">
                {section.icon}
              </span>
              <h2 className="text-xl font-semibold text-gray-800">
                {section.title}
              </h2>
            </div>
            <p className="text-gray-600">
              {section.description}
            </p>
            {section.id === 'crop' && (
              <div className="mt-4 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                ⚡ AI-Powered
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Agriculture;
