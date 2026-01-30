import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cropCompensationDetails } from '../data/cropCompensationDetails';

const CropCompensationDetails = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('kannada');
  const { id } = useParams();
  const navigate = useNavigate();

  const cropDetails = cropCompensationDetails[id];

  if (!cropDetails) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {selectedLanguage === 'kannada' ? 'ಬೆಳೆ ಪರಿಹಾರ ಕಂಡುಬಂದಿಲ್ಲ' : 'Compensation Scheme Not Found'}
            </h1>
            <p className="mb-4">
              {selectedLanguage === 'kannada' 
                ? 'ಕ್ಷಮಿಸಿ, ನೀವು ಹುಡುಕುತ್ತಿರುವ ಯೋಜನೆಯು ಲಭ್ಯವಿಲ್ಲ.' 
                : 'Sorry, the compensation scheme you are looking for is not available.'}
            </p>
            <button
              onClick={() => navigate('/scheme')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {selectedLanguage === 'kannada' ? 'ಹಿಂದೆ ಹೋಗು' : 'Go Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Navigation and Language Toggle */}
        <div className="mb-8 flex justify-between items-center">
          <button 
            onClick={() => navigate('/scheme')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
          >
            <span>←</span>
            {selectedLanguage === 'kannada' ? 'ಹಿಂದೆ ಹೋಗು' : 'Back'}
          </button>
          <button 
            onClick={() => setSelectedLanguage(selectedLanguage === 'kannada' ? 'english' : 'kannada')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {selectedLanguage === 'kannada' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ'}
          </button>
        </div>

        {/* Crop Title and Description */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {cropDetails.title[selectedLanguage]}
          </h1>
          <p className="text-lg text-gray-700">
            {cropDetails.description[selectedLanguage]}
          </p>
        </div>

        {/* Application Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {selectedLanguage === 'kannada' ? 'ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆ' : 'Application Process'}
          </h2>
          <div className="space-y-8">
            {cropDetails.steps.map((step, index) => (
              <div key={index} className="flex gap-4 pb-6 border-b border-gray-200 last:border-b-0">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold mb-3 text-gray-800">
                    {step[selectedLanguage]}
                  </p>
                  {step.image && (
                    <img 
                      src={step.image} 
                      alt={`Step ${index + 1}`} 
                      className="rounded-lg w-full max-w-md object-cover shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Apply Button */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                window.open(cropDetails.websiteUrl, '_blank');
              }}
              className="bg-green-500 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors"
            >
              {selectedLanguage === 'kannada' ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropCompensationDetails;
