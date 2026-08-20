# Telecom Customer Churn Prediction & Retention Recommendation

An end-to-end system that predicts which telecom customers are likely to churn
and recommends a personalized retention offer — combining a trained ML model
with LLM-powered reasoning agents.

## Architecture

```
React (frontend)  →  Node/Express (backend API + MongoDB)  →  Python AI service (FastAPI)
                                                                 ├─ churn_model.pkl (sklearn)
                                                                 └─ agents/ (reason → retention → response)
```

- **frontend/** — React (Vite) dashboard: view customers, run predictions, see risk
  factors and the recommended retention offer.
- **backend/** — Express API that stores customers/predictions in MongoDB and proxies
  prediction requests to the AI service.
- **ai/** — FastAPI service. `model/` trains and serves the churn classifier
  (scikit-learn). `agents/` is a small pipeline of LLM agents (Gemini) that turn the
  raw prediction into human-readable reasoning and a retention offer.
- **notebooks/** — EDA, preprocessing, and model-comparison notebooks.

## Quick start

### 1. AI service
```bash
cd ai
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python model/train.py          # trains churn_model.pkl from data/raw/telco_churn.csv
uvicorn main:app --reload --port 8000
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env           # set MONGO_URI, AI_SERVICE_URL
npm run dev                    # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

Or run everything with Docker:
```bash
docker compose up --build
```

## Dataset

Place the Telco Customer Churn CSV (IBM sample dataset or your own export) at
`ai/data/raw/telco_churn.csv`. `preprocess.py` cleans it into
`ai/data/processed/cleaned_data.csv`, which `train.py` uses to fit the model.

## Environment variables

| File | Variable | Purpose |
|---|---|---|
| `backend/.env` | `MONGO_URI` | MongoDB connection string |
| `backend/.env` | `AI_SERVICE_URL` | URL of the FastAPI AI service |
| `ai/.env` | `GEMINI_API_KEY` | Key for the retention/reasoning agents |
| `frontend/.env` | `VITE_API_URL` | Backend API base URL |

> Note: `ai/data/raw/telco_churn.csv` ships with a small 16-row sample so the
> pipeline runs end-to-end out of the box. Swap in the full IBM Telco Customer
> Churn dataset (or your own export, same columns) before training for real.
