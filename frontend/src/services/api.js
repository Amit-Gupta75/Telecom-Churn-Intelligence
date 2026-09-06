import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers:{
    "Content-Type":"application/json"
  }
});


// Attach JWT token to every request
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});


// Handle unauthorized users
api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

    }

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
export const getAllInteractions = () => api.get("/interactions").then((r) => r.data);
// A logged-in customer raising their own complaint hits the same endpoint
// as addInteraction — kept as a separate export so customer-facing pages
// read clearly.
export const raiseComplaint = (data) => api.post("/interactions", data).then((r) => r.data);

// All predictions across customers (admin/employee)
export const getAllPredictions = () => api.get("/predictions").then((r) => r.data);

// Stats / model status
export const getStats = () => api.get("/stats").then((r) => r.data);

// Logged-in customer's own profile
export const getMyProfile = () => api.get("/customers/me").then((r) => r.data);
export const updateMyProfile = (data) =>
  api.patch("/customers/me", data).then((r) => r.data);
export const changeMyPassword = (data) =>
  api.post("/customers/me/password", data).then((r) => r.data);

// Admin/employee create a portal login for an existing customer record
export const createPortalLogin = (id, data) =>
  api.post(`/customers/${id}/portal-login`, data).then((r) => r.data);

// Employees (admin only)
export const getEmployees = () => api.get("/users/employees").then((r) => r.data);
export const getEmployee = (id) => api.get(`/users/employees/${id}`).then((r) => r.data);
export const createEmployee = (data) => api.post("/users/employees", data).then((r) => r.data);
export const deleteEmployee = (id) =>
  api.delete(`/users/employees/${id}`).then((r) => r.data);


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
