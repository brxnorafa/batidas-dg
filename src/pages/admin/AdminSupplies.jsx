import { useState, useEffect } from "react";

export default function AdminSupplies() {
  const [activeTab, setActiveTab] = useState("cadastrar");

  // States Cadastro e Edição
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("");
  const [quantidade, setQuantidade] = useState("");

  // States Listagem
  const [insumos, setInsumos] = useState([]);
  const [filtroInsumos, setFiltroInsumos] = useState("");

  const insumosFiltrados = insumos.filter((i) =>
    i.name.toLowerCase().includes(filtroInsumos.toLowerCase())
  );


  // State edição
  const [editId, setEditId] = useState(null);

  const limparFormulario = () => {
    setNome("");
    setUnidade("");
    setQuantidade("");
    setEditId(null);
  };

  const cadastrarInsumo = async () => {
    if (!nome.trim() || !unidade.trim()) {
      return alert("Preencha o nome e a unidade!");
    }

    try {
      const res = await fetch("/php/supplies/supplies.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cadastrar",
          nome,
          unidade,
          quantidade: quantidade ? parseFloat(quantidade) : 0,
        }),
      });

      const data = await res.json();
      alert(data.message);
      if (data.success) {
        limparFormulario();
        buscarInsumos();
      }
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const buscarInsumos = async () => {
    try {
      const res = await fetch("/php/supplies/supplies.php?action=listar");
      const data = await res.json();
      if (data.success) {
        setInsumos(data.insumos);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const iniciarEdicao = (insumo) => {
    setEditId(insumo.id);
    setNome(insumo.name);
    setUnidade(insumo.unit);
    // quantidade não editável aqui, então nem seto
    setActiveTab("editar");
  };

  const editarInsumo = async () => {
    if (!nome.trim() || !unidade.trim()) {
      return alert("Preencha o nome e a unidade!");
    }

    try {
      const res = await fetch(`/php/supplies/supplies.php?id=${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          unidade,
          // quantidade nem manda pq não é pra editar aqui
        }),
      });

      const data = await res.json();
      alert(data.message);
      if (data.success) {
        limparFormulario();
        buscarInsumos();
        setActiveTab("listar");
      }
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const excluirInsumo = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esse insumo?")) return;

    try {
      const res = await fetch(`/php/supplies/supplies.php?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) buscarInsumos();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === "listar") {
      buscarInsumos();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-5">
      <h1 className="text-2xl text-white font-bold mb-6">Administração de Insumos</h1>

      {/* Tabs */}
      <div className="flex w-full max-w-5xl mb-6 rounded-lg overflow-hidden border border-purple-500">
        {["cadastrar", "listar", "editar"].map((tab) => (
          <button
            key={tab}
            disabled={tab === "editar" && editId === null}
            className={`flex-1 py-3 text-center font-semibold transition ${activeTab === tab
                ? "bg-purple-500 text-white"
                : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
              } ${tab === "editar" && editId === null ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "cadastrar"
              ? "Cadastrar"
              : tab === "listar"
                ? "Insumos Cadastrados"
                : "Editar Insumo"}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="w-full max-w-5xl">
        {(activeTab === "cadastrar" || activeTab === "editar") && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
            <input
              type="text"
              placeholder="Nome do insumo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white"
            />

            <select
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white"
            >
              <option value="">Selecione a unidade</option>
              <option value="ml">ml</option>
              <option value="unidade">unidade</option>
              <option value="g">g</option>
            </select>

            {/* No cadastro mostramos quantidade */}
            {activeTab === "cadastrar" && (
              <input
                type="number"
                placeholder="Quantidade"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white"
              />
            )}

            <button
              onClick={activeTab === "cadastrar" ? cadastrarInsumo : editarInsumo}
              className="w-full bg-purple-500 hover:bg-purple-600 py-3 rounded font-bold text-white transition"
            >
              {activeTab === "cadastrar" ? "Cadastrar Insumo" : "Salvar Alterações"}
            </button>
          </div>
        )}

        {activeTab === "listar" && (
          <div>
            <input
              type="text"
              placeholder="Filtrar insumos pelo nome"
              value={filtroInsumos}
              onChange={(e) => setFiltroInsumos(e.target.value)}
              className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
            />

            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
              <table className="min-w-full text-white">
                <thead>
                  <tr className="bg-gray-700 text-purple-400">
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">Unidade</th>
                    <th className="px-4 py-3 text-left">Quantidade</th>
                    <th className="px-4 py-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {insumosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-purple-300">
                        Nenhum insumo encontrado.
                      </td>
                    </tr>
                  ) : (
                    insumosFiltrados.map((item) => (
                      <tr key={item.id} className="border-t border-gray-700">
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.unit}</td>
                        <td className="px-4 py-3">{parseFloat(item.total_quantity).toFixed(3)}</td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            onClick={() => iniciarEdicao(item)}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-3 py-1 rounded"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => excluirInsumo(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
