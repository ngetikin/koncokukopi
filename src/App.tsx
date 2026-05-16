import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import POS from "./pages/POS";
import AdminProducts from "./pages/admin/Products";
import AdminTransactions from "./pages/admin/Transactions";
import AdminReports from "./pages/admin/Reports";
import AdminUsers from "./pages/admin/Users";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<SignIn />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
