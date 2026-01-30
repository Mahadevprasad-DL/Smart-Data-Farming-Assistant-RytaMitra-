import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gangaKalyana } from '../data/schemeDetails/gangaKalyana';
import { pmfby } from '../data/schemeDetails/pmfby';
import { kisanCredit } from '../data/schemeDetails/kisanCredit';

const SchemeDetails = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('kannada');
  const { id } = useParams();
  const navigate = useNavigate();

  const schemeDetails = {
    'ganga-kalyana': gangaKalyana,
    'pmfby': pmfby,
    'kisan-credit': kisanCredit
  };

  const currentScheme = schemeDetails[id];

  // Add error handling for invalid scheme
  if (!currentScheme) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {selectedLanguage === 'kannada' ? 'ಯೋಜನೆ ಕಂಡುಬಂದಿಲ್ಲ' : 'Scheme Not Found'}
            </h1>
            <p className="mb-4">
              {selectedLanguage === 'kannada' 
                ? 'ಕ್ಷಮಿಸಿ, ನೀವು ಹುಡುಕುತ್ತಿರುವ ಯೋಜನೆಯು ಲಭ್ಯವಿಲ್ಲ.' 
                : 'Sorry, the scheme you are looking for is not available.'}
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
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {selectedLanguage === 'kannada' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ'}
          </button>
        </div>

        {/* Scheme Title and Description */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {currentScheme.title[selectedLanguage]}
          </h1>
          <p className="text-lg">
            {currentScheme.description[selectedLanguage]}
          </p>
        </div>

        {/* Application Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">
            {selectedLanguage === 'kannada' ? 'ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆ' : 'Application Process'}
          </h2>
          <div className="space-y-6">
            {currentScheme.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 border-b pb-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium mb-2">{step[selectedLanguage]}</p>
                  {step.image && (
                    <img 
                      src={step.image} 
                      alt={`Step ${index + 1}`} 
                      className="rounded-lg w-[100vw] -mx-6 md:w-full md:max-w-md md:mx-0" // changed this line
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
                if (id === 'ganga-kalyana') {
                  window.open('https://kmdc.karnataka.gov.in', '_blank');
                } else if (id === 'pmfby') {
                  window.open('https://pmfby.gov.in', '_blank');
                } else if (id === 'kisan-credit') {
                  window.open('https://www.sbi.co.in', '_blank');
                }
              }}
              className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600"
            >
              {selectedLanguage === 'kannada' ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;