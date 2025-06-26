import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login';
import Orders from '../pages/Orders';
import Portaria from '../pages/Portaria';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminRegister from '../pages/admin/AdminRegister';
import AdminLayout from '../layouts/AdminLayout'; 
import AdminWhatsapp from '../pages/admin/AdminWhatsapp';
import AdminSupplies from '../pages/admin/AdminSupplies';
import AdminStock from '../pages/admin/AdminStock';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminReports from '../pages/admin/AdminReports';
import { useAuth } from '../contexts/AuthContext';

export default function AppRoutes() {
  const { role } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={role === 'administrator' ? <AdminLayout /> : <Navigate to="/login" />}
        >
          <Route path="orders" element={<AdminOrders />} />
          <Route path="register" element={<AdminRegister />} />
          <Route path="whatsapp" element={<AdminWhatsapp />} />
          <Route path="supplies" element={<AdminSupplies />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        <Route
          path="/orders"
          element={role === 'orders' ? <Orders /> : <Navigate to="/login" />}
        />

        <Route
          path="/checkin"
          element={role === 'checkin' ? <Portaria /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}
