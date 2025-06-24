import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex bg-gray-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-20 p-6 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
