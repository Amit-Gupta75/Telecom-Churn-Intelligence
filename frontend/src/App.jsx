import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Customers from "./pages/Customers.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
        </Routes>
      </div>
    </div>
  );
}
