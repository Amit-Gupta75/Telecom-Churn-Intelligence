import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers:{
    "Content-Type":"application/json"
  }
});

api.interceptors.request.use((config)=>{

    const token = localStorage.getItem("token");

    if(token){
        config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;

});


// Global auth error handling: an expired/invalid token (401) logs the
// user out and sends them to login; a role that's valid but not allowed
// for this resource (403) sends them to a dedicated "access denied" page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    console.error("API ERROR:", {
      status,
      url: error.config?.url,
      method: error.config?.method,
      response: error.response?.data,
    });

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // TEMPORARILY DO NOT REDIRECT ON 403.
    // This lets us identify the actual failing endpoint.

    return Promise.reject(error);
  }
);

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

// Own profile (customer role)
export const getMyProfile = () => api.get("/customers/me").then((r) => r.data);
export const updateMyProfile = (data) => api.patch("/customers/me", data).then((r) => r.data);
export const changeMyPassword = (data) => api.post("/customers/me/password", data).then((r) => r.data);

// Raise a complaint (customer role) — reuses the existing interaction API
export const raiseComplaint = (data) => api.post("/interactions", data).then((r) => r.data);

// Create a portal login for a customer (admin only)
export const createPortalLogin = (customerId, data) =>
  api.post(`/customers/${customerId}/portal-login`, data).then((r) => r.data);

// Employees (admin only)
export const getEmployees = () => api.get("/users/employees").then((r) => r.data);
export const getEmployee = (id) => api.get(`/users/employees/${id}`).then((r) => r.data);
export const createEmployee = (data) => api.post("/users/employees", data).then((r) => r.data);
export const deleteEmployee = (id) => api.delete(`/users/employees/${id}`).then((r) => r.data);

// All predictions / interactions (admin + employee)
export const getAllPredictions = () => api.get("/predictions").then((r) => r.data);
export const getAllInteractions = () => api.get("/interactions").then((r) => r.data);

export default api;


