"""
Crop Recommendation & Disease Detection API
Predicts the best crop based on soil nutrients and environmental conditions
"""

import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from sklearn.preprocessing import LabelEncoder
import warnings

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Load the trained model and label encoder
try:
    with open('crop_model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("✅ Crop model loaded successfully")
except Exception as e:
    print(f"❌ Error loading crop model: {e}")
    model = None

try:
    with open('label_encoder.pkl', 'rb') as f:
        label_encoder = pickle.load(f)
    print("✅ Label encoder loaded successfully")
except Exception as e:
    print(f"❌ Error loading label encoder: {e}")
    label_encoder = None


@app.route('/api/predict-crop', methods=['POST'])
def predict_crop():
    """
    Predict crop based on input parameters
    Expected JSON:
    {
        "N": 90,           # Nitrogen content (0-140)
        "P": 42,           # Phosphorus content (0-145)
        "K": 43,           # Potassium content (0-205)
        "temperature": 20.87,  # in Celsius (8-44)
        "humidity": 82.00,     # in percentage (14-99)
        "ph": 6.50,            # soil pH (3.5-9.5)
        "rainfall": 202.93     # in mm (20-425)
    }
    """
    try:
        data = request.json

        # Validate required fields
        required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400

        # Extract values
        N = float(data['N'])
        P = float(data['P'])
        K = float(data['K'])
        temperature = float(data['temperature'])
        humidity = float(data['humidity'])
        ph = float(data['ph'])
        rainfall = float(data['rainfall'])

        # Validate ranges
        if not (0 <= N <= 140):
            return jsonify({'error': 'N (Nitrogen) must be between 0-140'}), 400
        if not (0 <= P <= 145):
            return jsonify({'error': 'P (Phosphorus) must be between 0-145'}), 400
        if not (0 <= K <= 205):
            return jsonify({'error': 'K (Potassium) must be between 0-205'}), 400
        if not (8 <= temperature <= 44):
            return jsonify({'error': 'Temperature must be between 8-44°C'}), 400
        if not (14 <= humidity <= 99):
            return jsonify({'error': 'Humidity must be between 14-99%'}), 400
        if not (3.5 <= ph <= 9.5):
            return jsonify({'error': 'pH must be between 3.5-9.5'}), 400
        if not (20 <= rainfall <= 425):
            return jsonify({'error': 'Rainfall must be between 20-425mm'}), 400

        if model is None or label_encoder is None:
            return jsonify({'error': 'Model not loaded'}), 500

        # Prepare input for model
        features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])

        # Make prediction
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]

        # Get crop name from label encoder
        crop_name = label_encoder.inverse_transform([prediction])[0]

        # Get confidence (probability of predicted class)
        confidence = float(max(probabilities)) * 100

        # Get top 3 recommendations
        top_indices = np.argsort(probabilities)[-3:][::-1]
        top_crops = []
        for idx in top_indices:
            crop = label_encoder.inverse_transform([idx])[0]
            prob = float(probabilities[idx]) * 100
            top_crops.append({
                'crop': crop,
                'confidence': round(prob, 2)
            })

        return jsonify({
            'success': True,
            'predicted_crop': crop_name,
            'confidence': round(confidence, 2),
            'top_recommendations': top_crops,
            'input': {
                'N': N,
                'P': P,
                'K': K,
                'temperature': temperature,
                'humidity': humidity,
                'ph': ph,
                'rainfall': rainfall
            }
        }), 200

    except ValueError as e:
        return jsonify({'error': f'Invalid input value: {str(e)}'}), 400
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500


@app.route('/api/crop-info', methods=['GET'])
def get_crop_info():
    """
    Get information about expected ranges for all parameters
    """
    return jsonify({
        'parameters': {
            'N': {
                'name': 'Nitrogen',
                'unit': 'mg/kg',
                'min': 0,
                'max': 140,
                'description': 'Nitrogen content in soil'
            },
            'P': {
                'name': 'Phosphorus',
                'unit': 'mg/kg',
                'min': 0,
                'max': 145,
                'description': 'Phosphorus content in soil'
            },
            'K': {
                'name': 'Potassium',
                'unit': 'mg/kg',
                'min': 0,
                'max': 205,
                'description': 'Potassium content in soil'
            },
            'temperature': {
                'name': 'Temperature',
                'unit': '°C',
                'min': 8,
                'max': 44,
                'description': 'Average temperature'
            },
            'humidity': {
                'name': 'Humidity',
                'unit': '%',
                'min': 14,
                'max': 99,
                'description': 'Relative humidity'
            },
            'ph': {
                'name': 'pH',
                'unit': 'scale',
                'min': 3.5,
                'max': 9.5,
                'description': 'Soil pH level'
            },
            'rainfall': {
                'name': 'Rainfall',
                'unit': 'mm',
                'min': 20,
                'max': 425,
                'description': 'Annual rainfall'
            }
        }
    }), 200


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'label_encoder_loaded': label_encoder is not None
    }), 200


if __name__ == '__main__':
    print("🚀 Starting Crop Prediction API...")
    print("📊 Model Status:")
    print(f"   - Model: {'✅ Loaded' if model is not None else '❌ Not Loaded'}")
    print(f"   - Label Encoder: {'✅ Loaded' if label_encoder is not None else '❌ Not Loaded'}")
    app.run(debug=True, port=5001)
