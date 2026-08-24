import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers:{
    "Content-Type":"application/json"
  }
});

// Customers
export const getCustomers = () => api.get("/customers").then((r) => r.data);
export const getCustomer = (id) => api.get(`/customers/${id}`).then((r) => r.data);
export const createCustomer = (data) => api.post("/customers", data).then((r) => r.data);
export const updateCustomer = (id, data) =>
  api.put(`/customers/${id}`, data)
     .then((r) => r.data);
// Predictions
export const predictChurn = (customerData) =>
  api.post("/predictions", customerData).then((r) => r.data);
export const getPredictionHistory = (customerId) =>
  api.get(`/predictions/${customerId}`).then((r) => r.data);

// Support & complaint history
export const getInteractions = (customerId) =>
  api.get(`/interactions/${customerId}`).then((r) => r.data);
export const addInteraction = (data) => api.post("/interactions", data).then((r) => r.data);

// Stats / model status
export const getStats = () => api.get("/stats").then((r) => r.data);


//Delete Customer
export const deleteCustomer = (id) =>
  api.delete(`/customers/${id}`).then((r) => r.data);

//Login Customer
export const loginUser = (data) =>
  api.post("/auth/login", data).then((r) => r.data);


//Register User
export const registerUser = (data) =>
  api.post("/auth/register", data).then((r) => r.data);

export default api;


