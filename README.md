# Sleep Debt Data Mining

An interactive web application that analyzes sleep habits and predicts sleep debt categories using machine learning. The application combines a Python FastAPI backend with a React frontend to provide data exploration, visualizations, model evaluation, and individual predictions.

## Features

- **Dashboard:** Explore dataset summaries and sleep debt category distribution.
- **Dataset Explorer:** Browse and search dataset records.
- **Data Visualizations:** Analyze histograms, boxplots, scatterplots, and correlation matrices.
- **Model Lab:** Compare machine learning models using accuracy, macro F1-score, and training time.
- **Sleep Debt Prediction:** Enter sleep-related information and receive a predicted category with class probabilities when supported by the model.
- **Clustering:** Explore patterns in the dataset using clustering analysis.

## Technologies Used

### Backend
- Python
- FastAPI and Uvicorn
- Pandas and NumPy
- Scikit-learn
- Joblib

### Frontend
- React
- Vite
- Axios
- Recharts
- Lucide React
- CSS

## Dataset

The project uses a dataset containing 8,500 records and 18 columns related to sleep habits, screen time, lifestyle factors, and sleep debt categories.

The target variable is `sleep_debt_category`.

## Machine Learning

The project compares four classification algorithms:

- Logistic Regression
- Decision Tree
- Random Forest
- Extra Trees

In the recorded evaluation, Random Forest achieved the best results, with **97.06% accuracy** and a **94.86% macro F1-score**.

These results reflect the current experiment and may vary if the dataset, preprocessing, or training configuration changes.

## Project Structure

```text
Sleep-Debt-Data-Mining/
├── backend/
│   ├── data/
│   ├── models/
│   ├── outputs/
│   ├── analysis.py
│   ├── main.py
│   ├── preprocessing.py
│   ├── requirements.txt
│   └── train_model.py
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md

## Installation and Setup

### 1. Clone the repository

git clone YOUR_GITHUB_REPOSITORY_URL
cd Sleep-Debt-Data-Mining

### 2. Set up the backend

Create and activate a Python virtual environment from the project root:


python -m venv .venv


On Windows PowerShell:


.\.venv\Scripts\Activate.ps1


Install the backend dependencies:


pip install -r backend/requirements.txt


Start the backend:


python -m uvicorn main:app --reload --app-dir .\backend


The API runs at `http://127.0.0.1:8000`.

Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Set up the frontend

Open a second terminal:


cd frontend
npm install
npm run dev


Open the local URL printed by Vite, usually `http://localhost:5173`.

## Prediction Model

The application loads the trained model from `backend/models/best_model.joblib`. Keep this file available when running the prediction API.

## Notes

- Run the backend and frontend simultaneously.
- The frontend connects to the backend through the configured local API URL.
- Model performance depends on the dataset and training configuration.
- This project is intended for educational and data analysis purposes; predictions should not be treated as medical diagnoses.

## License

No license has been specified yet.
