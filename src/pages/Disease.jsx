import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLeaf, FaThermometerHalf, FaTint, FaCloudRain, FaChartBar } from 'react-icons/fa';

const Disease = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    N: 90,
    P: 42,
    K: 43,
    temperature: 20.88,
    humidity: 82.0,
    ph: 6.5,
    rainfall: 202.93,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parameterRanges, setParameterRanges] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Fetch parameter ranges on component mount
  useEffect(() => {
    fetchParameterRanges();
  }, []);

  const fetchParameterRanges = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/crop-info');
      const data = await response.json();
      setParameterRanges(data.parameters);
    } catch (err) {
      console.error('Error fetching parameter ranges:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
    setError(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch('http://localhost:5001/api/predict-crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Prediction failed');
        return;
      }

      setPrediction(data);
      setShowResults(true);
    } catch (err) {
      setError('Error connecting to prediction service: ' + err.message);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      N: 90,
      P: 42,
      K: 43,
      temperature: 20.88,
      humidity: 82.0,
      ph: 6.5,
      rainfall: 202.93,
    });
    setPrediction(null);
    setShowResults(false);
    setError(null);
  };

  const InputField = ({ label, field, icon: Icon, unit, min, max, step = 0.1 }) => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="text-blue-600" />
          {label}
        </div>
        <span className="text-xs text-gray-500">{unit} (Range: {min} - {max})</span>
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full mt-2"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FaLeaf className="text-green-600" />
            Crop Recommendation System
          </h1>
          <p className="text-gray-600">
            Enter soil and environmental parameters to get AI-powered crop recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Soil & Environmental Parameters</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-red-700 font-semibold">⚠️ Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Soil Nutrients Section */}
            <div className="mb-8 pb-6 border-b-2 border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Soil Nutrients (NPK)</h3>
              <InputField
                label="Nitrogen (N)"
                field="N"
                icon={FaChartBar}
                unit="mg/kg"
                min={0}
                max={140}
              />
              <InputField
                label="Phosphorus (P)"
                field="P"
                icon={FaChartBar}
                unit="mg/kg"
                min={0}
                max={145}
              />
              <InputField
                label="Potassium (K)"
                field="K"
                icon={FaChartBar}
                unit="mg/kg"
                min={0}
                max={205}
              />
            </div>

            {/* Environmental Conditions Section */}
            <div className="mb-8 pb-6 border-b-2 border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Environmental Conditions</h3>
              <InputField
                label="Temperature"
                field="temperature"
                icon={FaThermometerHalf}
                unit="°C"
                min={8}
                max={44}
                step={0.1}
              />
              <InputField
                label="Humidity"
                field="humidity"
                icon={FaTint}
                unit="%"
                min={14}
                max={99}
                step={0.1}
              />
              <InputField
                label="Soil pH"
                field="ph"
                icon={FaChartBar}
                unit="pH scale"
                min={3.5}
                max={9.5}
                step={0.1}
              />
              <InputField
                label="Rainfall"
                field="rainfall"
                icon={FaCloudRain}
                unit="mm"
                min={20}
                max={425}
                step={0.1}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePredict}
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 active:scale-95'
                }`}
              >
                {loading ? '⏳ Predicting...' : '🎯 Predict Crop'}
              </button>
              <button
                onClick={resetForm}
                className="py-3 px-6 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition duration-300"
              >
                ↻ Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {showResults && prediction ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Prediction Results</h2>

                {/* Main Prediction Card */}
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-8 mb-8 text-white">
                  <p className="text-sm font-semibold opacity-90 mb-1">Recommended Crop</p>
                  <h3 className="text-4xl font-bold mb-4 capitalize">{prediction.predicted_crop}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-lg">{prediction.confidence}%</span>
                  </div>
                  <p className="text-sm mt-2 opacity-90">Confidence Score</p>
                </div>

                {/* Top Recommendations */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Recommendations</h3>
                  <div className="space-y-3">
                    {prediction.top_recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-blue-600">#{idx + 1}</span>
                          <span className="font-semibold capitalize text-gray-700">{rec.crop}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="font-bold text-green-600">{rec.confidence}%</span>
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ width: `${rec.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Input Parameters Used</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nitrogen (N):</span>
                      <p className="font-semibold text-gray-800">{prediction.input.N} mg/kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phosphorus (P):</span>
                      <p className="font-semibold text-gray-800">{prediction.input.P} mg/kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Potassium (K):</span>
                      <p className="font-semibold text-gray-800">{prediction.input.K} mg/kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Temperature:</span>
                      <p className="font-semibold text-gray-800">{prediction.input.temperature}°C</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Humidity:</span>
                      <p className="font-semibold text-gray-800">{prediction.input.humidity}%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">pH Level:</span>
                      <p className="font-semibold text-gray-800">{prediction.input.ph}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Rainfall:</span>
                      <p className="font-semibold text-gray-800">{prediction.input.rainfall} mm</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <FaLeaf className="text-6xl mb-4 text-gray-300" />
                <p className="text-lg font-semibold">Fill in the parameters and click "Predict Crop"</p>
                <p className="text-sm mt-2">Results will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Enter Soil Data</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Input the NPK values (Nitrogen, Phosphorus, Potassium) from your soil test report
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Set Environment</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Enter temperature, humidity, pH level, and expected rainfall for your region
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Get Prediction</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Click "Predict Crop" to see AI recommendations with confidence scores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disease;
