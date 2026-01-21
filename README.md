# Smart Agri Assistant

End-to-end agri assistant with crop recommendation (ML), livestock tracking, weather, irrigation, and utilities. Frontend (Vite + React + Tailwind) with multilingual + voice support; backend (Flask) for crop prediction; Supabase for livestock data.

## Feature Matrix

| Area | What it does | Tech/Notes |
| --- | --- | --- |
| Crop Recommendation (ML) | 7-parameter form (N, P, K, temperature, humidity, pH, rainfall); top-3 crops with confidence; friendly validation. | React UI (`src/pages/Disease.jsx`), Flask `/api/predict-crop`, RandomForest model (`crop_model.pkl`). |
| Crop Info API | Returns parameter ranges/metadata to guide inputs. | Flask `/api/crop-info`. |
| Health Check | Readiness endpoint for backend. | Flask `/api/health`. |
| Model Training | Trains on `Crop_recommendation.csv`; prints accuracy + classification report; saves artifacts. | `backend/train_model.py`, outputs `crop_model.pkl`, `label_encoder.pkl`. |
| Livestock - Cow | Supabase CRUD, multi-entry per day, table views. | React + Supabase; per-day uniqueness removed. |
| Poultry - Chicken | Form with egg price + daily entries; table view; multi-entry per day. | React + Supabase; FaEgg icon fix. |
| Weather Widget | Dashboard weather card. | `Weather` component. |
| Flood Alert | Quick navigation to flood alerts. | Agriculture landing card. |
| Irrigation | Scheduling/management entry point. | Agriculture landing card. |
| Theme Auto-Detect Sidebar | Auto light/dark from system; smooth transitions. | `src/components/Sidebar.jsx` with `prefers-color-scheme`. |
| Multilingual | en/hi/kn/ta/te translations. | `public/locales/*`. |
| Voice Commands (Agriculture) | Kannada commands route to detection/alert/irrigation. | `src/pages/Agriculture.jsx` voiceCommand listener. |
| Voice Bot (Ramanna) | Kannada AI assistant with speech. | React voice components. |
| Documentation | Setup, reference, visuals. | Multiple `*.md` guides in repo. |

## Architecture

- Frontend: Vite + React + Tailwind, i18n, voice navigation, cards-based UX
- Backend: Flask API for predictions and metadata
- ML: RandomForest on `Crop_recommendation.csv`; artifacts `crop_model.pkl`, `label_encoder.pkl`
- Data: Supabase for livestock modules (Cow/Chicken)

## Project Structure (high level)

```
backend/
  crop_prediction.py       # Flask API (predict-crop, crop-info, health)
  train_model.py           # Train RF model, print metrics, save artifacts
  requirements.txt         # flask, flask-cors, scikit-learn, pandas, numpy
public/
  locales/                 # en/hi/kn/ta/te translations
  fasalBhima/, gangaKalyana/, kisanCredit/, ...
src/
  pages/                   # Agriculture, Disease (crop rec UI), Bank, etc.
  components/              # Sidebar (theme-aware), Weather, VoiceInput, etc.
  data/                    # Schemes, bank/fd data
  hooks/                   # useVoiceCommands
  i18n.js, main.jsx, App.jsx, index.css
```

## Setup and Run

### Frontend (Vite + React)
```bash
npm install
npm run dev
# opens http://localhost:5173
```

### Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
python crop_prediction.py
# runs at http://localhost:5001
```

### Train or Re-train the Model
```bash
cd backend
python train_model.py
# prints accuracy + classification report
# saves crop_model.pkl and label_encoder.pkl
```

## API (Backend)
- POST `/api/predict-crop` — body: `{ N, P, K, temperature, humidity, ph, rainfall }` → top-3 crops with confidence
- GET `/api/crop-info` — parameter ranges and descriptions
- GET `/api/health` — readiness check

## Key Pages/Flows
- Agriculture landing: cards for Flood Alert, Crop Recommendation, Irrigation; voice navigation (Kannada)
- Crop Recommendation UI: 7 inputs, validation, results with confidences
- Sidebar: auto-detects light/dark, animated navigation
- Cow/Chicken modules: Supabase-backed CRUD with multi-entry per day

## Voice & Language
- Voice bot (Ramanna) and voice commands for navigation
- Kannada-first commands for detection/alert/irrigation
- Translations available: en, hi, kn, ta, te

## Scripts
- `npm run dev` — start frontend
- `python crop_prediction.py` — start backend
- `python train_model.py` — train model and print metrics

## Notes
- Ensure `Crop_recommendation.csv` exists in `backend/` before training
- Start backend before using Crop Recommendation UI
- Configure Supabase keys/env for livestock modules

## Support
- Email: esrsamarth@gmail.com
- WhatsApp: +91-9353618980

Built with care for farmers. 🌾
