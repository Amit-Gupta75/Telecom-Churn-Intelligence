import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Customers from "./pages/Customers.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";
import EditCustomer from "./pages/EditCustomer.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Layout from "./components/Layout.jsx";
import AdminLayout from "./components/layouts/AdminLayout.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard.jsx";
import CustomerDashboard from "./pages/customer/CustomerDashboard.jsx";

export default function App() {
  return (
    <Routes>

      {/* Public Routes */}

      <Route
        path="/"
        element={<Register />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<AdminDashboard />}
        />

        <Route
          path="customers"
          element={<Customers />}
        />
      </Route>

      {/* NORMAL USER ROUTES */}
      <Route
        path="*"
        element={
          <ProtectedRoute
            roles={["admin", "employee", "customer"]}
          >
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Home />}
        />

        <Route
          path="employee"
          element={<EmployeeDashboard />}
        />

        <Route
          path="customer"
          element={<CustomerDashboard />}
        />

        <Route
          path="customers"
          element={<Customers />}
        />

        <Route
          path="customers/:id"
          element={<CustomerDetails />}
        />

        <Route
          path="customers/:id/edit"
          element={<EditCustomer />}
        />

      </Route>

    </Routes>
  );
}