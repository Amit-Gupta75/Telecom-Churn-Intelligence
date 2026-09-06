# Agent Instructions

## Project at a glance

This repository is a telecom churn prediction and retention system. Keep the three services separate:

- `frontend/`: React 18 + Vite dashboard. UI pages and reusable components live in `src/`.
- `backend/`: Node.js + Express API. Routes register endpoints, controllers contain request logic, and Mongoose models define MongoDB data.
- `ai/`: FastAPI service. `model/` trains and scores the scikit-learn model; `agents/` turns model output into explanations and retention offers.
- `notebooks/`: exploratory analysis and model comparison; do not treat notebooks as the runtime source of truth.

Read [README.md](README.md) for setup, architecture, data expectations, environment variables, and Docker usage. Link to that documentation instead of copying it into new instructions or comments.

## How to choose a change location

- Change screen layout, routing, or client API calls in `frontend/src/`.
- Change HTTP behavior or persistence in `backend/routes/`, `backend/controllers/`, and `backend/models/`.
- Change prediction inputs, feature engineering, model training, or AI-generated explanations in `ai/model/`, `ai/main.py`, and `ai/agents/`.
- If a response crosses services, preserve the existing contract. For example, the AI prediction response contains `probability`, `factors`, `summary`, and `offers`; update all consumers together when that shape must change.

Prefer the smallest change in the owning layer. Follow nearby naming, formatting, component, controller, and error-handling patterns before introducing a new abstraction.

## Validation

Run the narrowest relevant check after editing:

- Frontend: `cd frontend; npm run build`
- Backend: `cd backend; npm start` for a smoke check when MongoDB is available
- AI Python syntax: `python -m compileall ai`
- AI model pipeline: from `ai/`, run `python model/train.py` when model or preprocessing code changes and the dataset is available
- Full local environment: `docker compose up --build`

There are currently no repository test scripts. Do not claim a test passed unless the command actually ran. For frontend-only changes, a successful Vite build is the minimum useful check.

## Data and configuration cautions

- Never commit secrets from `.env` files. Use the variable names documented in [README.md](README.md).
- Keep model feature names and API field names aligned. The Python model uses dataset-style names such as `MonthlyCharges`, while frontend/backend customer objects use camelCase such as `monthlyCharges`.
- Retraining can replace generated model artifacts and metrics. Review the diff before keeping generated files.
- The sample CSV is intentionally tiny and is for pipeline verification, not meaningful model quality claims.
- Docker uses host port `5001` for the backend while the backend process listens on `5000`; keep this distinction in mind when diagnosing connectivity.

## Communication style for explanations

Explain changes like a patient technical teacher:

1. Say what was changed and why in plain language.
2. Name the file or layer that owns the behavior.
3. Give one small concrete example when it clarifies the flow.
4. Call out assumptions, validation performed, and any remaining limitation.

For example: "The frontend sends `monthlyCharges`, then the backend forwards the value to the AI service as `MonthlyCharges` because the trained model expects the dataset column name." Keep explanations concise, avoid unexplained jargon, and do not bury important warnings.

## Editing discipline

- Inspect the nearby implementation and an existing call site before editing.
- Preserve unrelated user changes in the working tree.
- Do not add comments that merely narrate obvious code; add documentation only when behavior or a cross-service contract would otherwise be difficult to understand.
- Keep UI changes consistent with the existing component and CSS variables. Use the icon library already installed rather than drawing replacement icons.
- When an API contract changes, update its client, server, and AI boundary together and run the relevant build or syntax checks.
