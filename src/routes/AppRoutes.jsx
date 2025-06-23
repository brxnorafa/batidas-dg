import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import AdminLayout from '../layout/AdminLayout';
import Pedidos from '../pages/Pedidos';
import Portaria from '../pages/Portaria';
import { useAuth } from '../contexts/AuthContext';

export default function AppRoutes() {
  const { role } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={role ? <Navigate to={`/${role}`} /> : <Login />}
      />

      <Route
        path="/admin/*"
        element={role === 'admin' ? <AdminLayout /> : <Navigate to="/login" />}
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
