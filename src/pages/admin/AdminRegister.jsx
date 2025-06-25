import { useState, useEffect } from "react";

export default function AdminRegister() {
  const [activeTab, setActiveTab] = useState("listar");

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("orders");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    if (activeTab === "listar") {
      carregarUsuarios();
    }
  }, [activeTab]);

  const carregarUsuarios = async () => {
    try {
      const res = await fetch("/php/employee/employees.php");
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    }
  };

  const traduzRole = (role) => {
    switch (role) {
      case "administrator":
        return "Administrador";
      case "orders":
        return "Pedidos";
      case "checkin":
        return "Portaria";
      default:
        return "Outro";
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir esse funcionário?")) {
      try {
        const res = await fetch("/php/employee/employees.php", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();
        if (data.success) {
          carregarUsuarios();
        } else {
          alert(data.message || "Erro ao excluir.");
        }
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !name || !password) {
      setStatus("Preencha todos os campos.");
      return;
    }

    try {
      const res = await fetch("/php/employee/employees.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, role, password }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("🎉 Funcionário cadastrado com sucesso!");
        setUsername("");
        setName("");
        setPassword("");
        setRole("orders");
        if (activeTab === "listar") carregarUsuarios();
      } else {
        setStatus(data.message || "Erro ao cadastrar.");
      }
    } catch (error) {
      setStatus("Erro de conexão.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-gray-900 p-8 rounded-lg text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Gerenciar Funcionários</h1>

      {/* Tabs */}
      <div className="flex mb-6 border border-purple-500 rounded-lg overflow-hidden">
        <button
          onClick={() => setActiveTab("listar")}
          className={`flex-1 py-3 font-semibold text-center transition ${activeTab === "listar"
              ? "bg-purple-500 text-white"
              : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
            }`}
        >
          Funcionários
        </button>
        <button
          onClick={() => setActiveTab("registrar")}
          className={`flex-1 py-3 font-semibold text-center transition ${activeTab === "registrar"
              ? "bg-purple-500 text-white"
              : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
            }`}
        >
          Cadastrar
        </button>
      </div>

      {/* Conteúdo */}
      {activeTab === "listar" && (
        <div className="overflow-x-auto rounded-lg shadow mb-10">
          <table className="min-w-full text-white border border-gray-700 rounded overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Usuário</th>
                <th className="px-4 py-3 text-left">Nome Completo</th>
                <th className="px-4 py-3 text-left">Função</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-2">{user.id}</td>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{traduzRole(user.role)}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-semibold text-sm"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "registrar" && (
        <div>
          <h2 className="text-2xl mb-4 font-bold text-center">Cadastrar Novo Funcionário</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Usuário (username)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-600"
              required
            />
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-600"
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-600"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-600"
            >
              <option value="administrator">Administrador</option>
              <option value="orders">Pedidos</option>
              <option value="checkin">Portaria</option>
            </select>
            <button
              type="submit"
              className="bg-green-600 py-3 rounded font-semibold hover:bg-green-700 transition"
            >
              Cadastrar
            </button>
          </form>

          {status && <p className="mt-6 text-center text-green-400 font-medium">{status}</p>}
        </div>
      )}
    </div>
  );
}
