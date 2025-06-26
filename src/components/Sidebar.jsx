import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import avatar_dg from '../assets/avatar_dg.png';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const modulos = [
    { key: 'orders', nome: 'Pedidos', icone: 'fa-chart-line' },
    { key: 'register', nome: 'Funcionários', icone: 'fa-users' },
    { key: 'whatsapp', nome: 'Whatsapp', icone: 'fa-brands fa-whatsapp' },
    { key: 'supplies', nome: 'Insumos', icone: 'fa-circle-info' },
    { key: 'stock', nome: 'Estoque', icone: 'fa-boxes-stacked' },
    { key: 'products', nome: 'Produtos', icone: 'fa-bottle-water' },
    { key: 'reports', nome: 'Relatórios', icone: 'fa-file-pdf' },
  ];


  const currentPath = window.location.pathname.split('/')[2];

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav
      className={`flex flex-col justify-between bg-white h-screen rounded-r-2xl fixed z-20 transition-all duration-300 ${
        open ? 'w-64' : 'w-20'
      } group`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 mb-6 overflow-hidden">
          <img src={avatar_dg} className="w-12 h-12 object-cover rounded-xl" alt="Avatar" />
          <div
            className={`transition-opacity duration-300 whitespace-nowrap ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p className="font-medium">Administração</p>
            <p className="text-xs text-red-500">Sistema Batidas DG</p>
          </div>
        </div>

        <ul className="space-y-2">
          {modulos.map(({ key, nome, icone }) => (
            <li
              key={key}
              className={`rounded-lg transition-colors duration-200 ${
                currentPath === key
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-green-500 hover:text-white'
              }`}
            >
              <NavLink
                to={`/admin/${key}`}
                className="flex items-center p-3 gap-3"
                end
              >
                <i className={`fas ${icone} w-5 text-center`}></i>
                <span
                  className={`transition-opacity duration-300 whitespace-nowrap ${
                    open ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {nome}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Botão de logout */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors duration-200 w-full"
        >
          <i className="fas fa-right-from-bracket w-5 text-center"></i>
          <span
            className={`transition-opacity duration-300 whitespace-nowrap ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Sair
          </span>
        </button>
      </div>
    </nav>
  );
}
