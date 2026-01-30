import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schemes } from '../data/schemes';

const cropCompensations = [
  {
    id: 'paddy',
    icon: '🌾',
    title: { kannada: 'ಅಕ್ಕಿ ಬೆಳೆ ಪರಿಹಾರ', english: 'Paddy Compensation' },
    description: {
      kannada: 'ಪ್ರಾಕೃತಿಕ ವಿಕೋಪದಿಂದ ಅಕ್ಕಿ ಬೆಳೆ ಹಾನಿಯಾದ ರೈತರಿಗೆ ಪರಿಹಾರ.',
      english: 'Compensation for paddy crop loss due to natural calamities.'
    }
  },
  {
    id: 'wheat',
    icon: '🌾',
    title: { kannada: 'ಗೋಧಿ ಬೆಳೆ ಪರಿಹಾರ', english: 'Wheat Compensation' },
    description: {
      kannada: 'ಗೋಧಿ ಬೆಳೆ ಹಾನಿಗೆ ತ್ವರಿತ ಹಣಕಾಸು ಸಹಾಯ.',
      english: 'Financial relief for wheat crop damage.'
    }
  },
  {
    id: 'maize',
    icon: '🌽',
    title: { kannada: 'ಜೋಳ ಬೆಳೆ ಪರಿಹಾರ', english: 'Maize Compensation' },
    description: {
      kannada: 'ಜೋಳ ಬೆಳೆ ನಷ್ಟಕ್ಕೆ ಪೂರಕ ಪರಿಹಾರ ಮತ್ತು ಸಹಾಯ.',
      english: 'Support package for maize crop losses.'
    }
  },
  {
    id: 'sugarcane',
    icon: '🍬',
    title: { kannada: 'ಕಬ್ಬು ಬೆಳೆ ಪರಿಹಾರ', english: 'Sugarcane Compensation' },
    description: {
      kannada: 'ಕಬ್ಬು ಬೆಳೆ ಹಾನಿಗೆ ಪರಿಹಾರ ಮತ್ತು ಪುನಶ್ಚೇತನ ಸಹಾಯ.',
      english: 'Relief assistance for sugarcane crop damage.'
    }
  },
  {
    id: 'cotton',
    icon: '🧵',
    title: { kannada: 'ಹತ್ತಿ ಬೆಳೆ ಪರಿಹಾರ', english: 'Cotton Compensation' },
    description: {
      kannada: 'ಹತ್ತಿ ಬೆಳೆ ಹಾನಿಗೆ ವಿಮಾ ಮಾದರಿಯ ಪರಿಹಾರ.',
      english: 'Insurance-style relief for cotton crop loss.'
    }
  },
  {
    id: 'pulses',
    icon: '🥬',
    title: { kannada: 'ದಾಳಿಂ ಬೆಳೆ ಪರಿಹಾರ', english: 'Pulse Crops Compensation' },
    description: {
      kannada: 'ಪಲ್ಸಸ್/ದಾಳಿಂಬೆಳೆ ಹಾನಿಗೆ ವೇಗವಾದ ಪರಿಹಾರ.',
      english: 'Quick relief for pulse crop damages.'
    }
  }
];

const Scheme = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('kannada');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Language Toggle */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {selectedLanguage === 'kannada' ? 'ಕೃಷಿ ಯೋಜನೆಗಳು' : 'Agricultural Schemes'}
          </h1>
          <button 
            onClick={() => setSelectedLanguage(selectedLanguage === 'kannada' ? 'english' : 'kannada')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {selectedLanguage === 'kannada' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ'}
          </button>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <div 
              key={scheme.id}
              onClick={() => navigate(`/scheme/${scheme.id}`)}
              className="bg-white rounded-lg shadow p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col"
            >
              <div className="text-3xl mb-3">{scheme.icon}</div>
              <h2 className="text-lg font-semibold mb-2">
                {scheme.title[selectedLanguage]}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {scheme.shortDescription[selectedLanguage]}
              </p>
            </div>
          ))}
        </div>

        {/* Crop Compensation Section */}
        <div className="mt-12">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              {selectedLanguage === 'kannada' ? 'ಬೆಳೆ ಪರಿಹಾರ ಯೋಜನೆಗಳು' : 'Crop Compensation'}
            </h2>
            <p className="text-gray-600 text-sm">
              {selectedLanguage === 'kannada'
                ? 'ಹಾನಿಗೊಳಗಾದ 6 ಪ್ರಮುಖ ಬೆಳೆಗಳಿಗೆ ವೇಗವಾದ ಪರಿಹಾರ ವಿವರಗಳು'
                : 'Quick relief options for 6 major crops'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cropCompensations.map((crop) => (
              <div
                key={crop.id}
                onClick={() => navigate(`/crop-compensation/${crop.id}`)}
                className="bg-white rounded-lg shadow p-6 border border-gray-100 h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-3">{crop.icon}</div>
                <h3 className="text-lg font-semibold mb-2">
                  {crop.title[selectedLanguage]}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {crop.description[selectedLanguage]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheme;


