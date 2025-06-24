import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Pedidos from '../pages/Pedidos';
import Portaria from '../pages/Portaria';
import AdminOrders from '../pages/admin/AdminOrders';
import { useAuth } from '../contexts/AuthContext';

export default function AppRoutes() {
  const { role } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/admin/orders"
        element={role === 'administrador' ? <AdminOrders /> : <Navigate to="/login" />}
      />

      <Route
        path="/pedidos"
        element={role === 'pedidos' ? <Pedidos /> : <Navigate to="/login" />}
      />

      <Route
        path="/portaria"
        element={role === 'portaria' ? <Portaria /> : <Navigate to="/login" />}
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
