import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Forbidden from "./pages/Forbidden.jsx";

import Customers from "./pages/Customers.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";
import EditCustomer from "./pages/EditCustomer.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext";

import AdminLayout from "./components/layouts/AdminLayout.jsx";
import EmployeeLayout from "./components/layouts/EmployeeLayout.jsx";
import CustomerLayout from "./components/layouts/CustomerLayout.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminCustomers from "./pages/admin/AdminCustomers.jsx";
import AdminCustomerDetails from "./pages/admin/AdminCustomerDetails.jsx";
import AdminEditCustomer from "./pages/admin/AdminEditCustomer.jsx";
import Employees from "./pages/admin/Employees.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminPredictions from "./pages/admin/AdminPredictions.jsx";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard.jsx";
import EmployeePredictions from "./pages/employee/EmployeePredictions.jsx";
import EmployeeInteractions from "./pages/employee/EmployeeInteractions.jsx";

import CustomerDashboard from "./pages/customer/CustomerDashboard.jsx";
import Recharge from "./pages/customer/Recharge.jsx";
import MyPlan from "./pages/customer/MyPlan.jsx";
import Usage from "./pages/customer/Usage.jsx";
import BillsPayments from "./pages/customer/BillsPayments.jsx";
import Offers from "./pages/customer/Offers.jsx";
import Profile from "./pages/customer/Profile.jsx";
import Settings from "./pages/customer/Settings.jsx";
import Support from "./pages/customer/Support.jsx";


const homeByRole = {
  admin: "/admin",
  employee: "/employee",
  customer: "/customer"
};

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homeByRole[user.role] || "/login" : "/login"} replace />;
}


export default function App(){

return (

<Routes>


{/* LOGIN */}

<Route path="/login" element={<Login />} />

<Route path="/forbidden" element={<Forbidden />} />



{/* ADMIN PANEL */}

<Route
  path="/admin"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminLayout />
    </ProtectedRoute>
  }
>

  <Route index element={<AdminDashboard />} />

  <Route path="customers" element={<AdminCustomers />} />
  <Route path="customers/:id" element={<AdminCustomerDetails />} />
  <Route path="customers/:id/edit" element={<AdminEditCustomer />} />

  <Route path="employees" element={<Employees />} />
  <Route path="analytics" element={<AdminAnalytics />} />
  <Route path="predictions" element={<AdminPredictions />} />

</Route>



{/* EMPLOYEE PANEL */}

<Route
  path="/employee"
  element={
    <ProtectedRoute roles={["employee"]}>
      <EmployeeLayout />
    </ProtectedRoute>
  }
>

  <Route index element={<EmployeeDashboard />} />

  <Route path="customers" element={<Customers />} />
  <Route path="customers/:id" element={<CustomerDetails />} />
  <Route path="customers/:id/edit" element={<EditCustomer />} />

  <Route path="predictions" element={<EmployeePredictions />} />
  <Route path="interactions" element={<EmployeeInteractions />} />

</Route>



{/* CUSTOMER PANEL */}

<Route
  path="/customer"
  element={
    <ProtectedRoute roles={["customer"]}>
      <CustomerLayout />
    </ProtectedRoute>
  }
>

  <Route index element={<CustomerDashboard />} />
  <Route path="recharge" element={<Recharge />} />
  <Route path="plan" element={<MyPlan />} />
  <Route path="usage" element={<Usage />} />
  <Route path="bills" element={<BillsPayments />} />
  <Route path="offers" element={<Offers />} />
  <Route path="profile" element={<Profile />} />
  <Route path="settings" element={<Settings />} />
  <Route path="support" element={<Support />} />

</Route>



{/* ROOT + FALLBACK */}

<Route path="/" element={<RootRedirect />} />
<Route path="*" element={<RootRedirect />} />


</Routes>

);

}
