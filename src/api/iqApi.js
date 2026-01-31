import axios from "axios";

const BASE_URL = "https://master-backend-18ik.onrender.com/api";

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// ===== IQ ADMIN APIS =====

// Get all IQ tests (admin)
export const getIQTests = (params) =>
  api.get("/iq/admin/tests", { params });

// Update test status (active / inactive)
export const updateIQTestStatus = (testId, is_active) =>
  api.put(`/iq/admin/tests/${testId}/status`, { is_active });

// Create new IQ test
export const createIQTest = (payload) =>
  api.post("/iq/admin/tests", payload);

// Add questions to a test
export const addQuestionsToTest = (testId, questions) =>
  api.post(`/iq/admin/tests/${testId}/questions`, { questions });

export default api;
