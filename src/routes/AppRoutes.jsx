import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Pedidos from '../pages/Pedidos';
import Portaria from '../pages/Portaria';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminRegister from '../pages/admin/AdminRegister';
import AdminLayout from '../layouts/AdminLayout'; 
import AdminWhatsapp from '../pages/admin/AdminWhatsapp';
import AdminSupplies from '../pages/admin/AdminSupplies';
import { useAuth } from '../contexts/AuthContext';

export default function AppRoutes() {
  const { role } = useAuth();

  return (
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
      </Route>

      <Route
        path="/pedidos"
        element={role === 'orders' ? <Pedidos /> : <Navigate to="/login" />}
      />

      <Route
        path="/checkin"
        element={role === 'checkin' ? <Portaria /> : <Navigate to="/login" />}
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
