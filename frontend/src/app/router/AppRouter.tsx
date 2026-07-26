import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerMenuPage from "../../pages/customer/CustomerMenuPage";
import LoginPage from "../../pages/dashboard/LoginPage";
import DashboardPage from "../../pages/dashboard/DashboardPage";
import RequireAuth from "./guards/RequireAuth";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/menu/:restaurantId" element={<CustomerMenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}