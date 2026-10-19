import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 30000,
});

export const getOverview = () => api.get("/overview");

export const getModelComparison = () =>
  api.get("/model-comparison");

export const getPredictionOptions = () =>
  api.get("/prediction-options");

export const getHistogram = (column) =>
  api.get("/histogram", { params: { column } });

export const getBoxplot = (column) =>
  api.get("/boxplot", { params: { column } });

export const getScatterplot = (x_column, y_column) =>
  api.get("/scatterplot", {
    params: { x_column, y_column },
  });

export const getCorrelation = () =>
  api.get("/correlation");

export const getClustering = (n_clusters = 4) =>
  api.get("/clustering", {
    params: { n_clusters },
  });

export const predictSleepDebt = (features) =>
  api.post("/predict", { features });

export const checkBackend = () =>
  api.get("/health");

export const getDatasetPreview = (limit = 100) =>
  api.get("/dataset-preview", {
    params: { limit },
  });

export default api;
