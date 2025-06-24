import { useState } from "react";

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState("dados");
  
  // Dados do produto
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");

  // Variantes = array de objetos {id, nome, preco, estoque}
  const [variantes, setVariantes] = useState([]);

  // Pra criar ID único simples pras variantes (não precisa UUID)
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Adiciona uma variante vazia
  const adicionarVariante = () => {
    setVariantes([
      ...variantes,
      { id: generateId(), nome: "", preco: "", estoque: "" },
    ]);
  };

  // Atualiza uma variante (por id)
  const atualizarVariante = (id, campo, valor) => {
    setVariantes(variantes.map(v => v.id === id ? {...v, [campo]: valor} : v));
  };

  // Remove variante
  const removerVariante = (id) => {
    setVariantes(variantes.filter(v => v.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica
    if (!nome.trim()) return alert("Preencha o nome do produto!");
    if (variantes.length === 0) return alert("Adicione pelo menos uma variante!");

    // Aqui você monta o payload e faz fetch/post para backend
    const produto = {
      nome,
      descricao,
      categoria,
      variantes,
    };

    console.log("Produto a enviar:", produto);
    alert("Produto enviado! (só no console por enquanto)");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Criar Produto</h1>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-purple-500">
        <button
          onClick={() => setActiveTab("dados")}
          className={`py-3 px-6 font-semibold ${
            activeTab === "dados"
              ? "border-b-4 border-purple-500 text-purple-400"
              : "text-gray-400 hover:text-purple-400"
          }`}
        >
          Dados do Produto
        </button>
        <button
          onClick={() => setActiveTab("variantes")}
          className={`py-3 px-6 font-semibold ${
            activeTab === "variantes"
              ? "border-b-4 border-purple-500 text-purple-400"
              : "text-gray-400 hover:text-purple-400"
          }`}
        >
          Variantes
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === "dados" && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome do Produto"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 text-white"
            />
            <textarea
              placeholder="Descrição"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 text-white resize-none h-24"
            />
            <input
              type="text"
              placeholder="Categoria"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 text-white"
            />
          </div>
        )}

        {activeTab === "variantes" && (
          <div>
            <button
              type="button"
              onClick={adicionarVariante}
              className="mb-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold"
            >
              + Adicionar Variante
            </button>

            {variantes.length === 0 && (
              <p className="text-gray-400">Nenhuma variante adicionada ainda.</p>
            )}

            {variantes.map((v) => (
              <div
                key={v.id}
                className="mb-4 p-4 bg-gray-800 rounded flex gap-3 items-center"
              >
                <input
                  type="text"
                  placeholder="Nome (ex: P, M, G, Azul)"
                  value={v.nome}
                  onChange={e => atualizarVariante(v.id, "nome", e.target.value)}
                  className="flex-1 p-2 rounded bg-gray-700 text-white"
                />
                <input
                  type="number"
                  placeholder="Preço"
                  value={v.preco}
                  onChange={e => atualizarVariante(v.id, "preco", e.target.value)}
                  className="w-24 p-2 rounded bg-gray-700 text-white"
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Estoque"
                  value={v.estoque}
                  onChange={e => atualizarVariante(v.id, "estoque", e.target.value)}
                  className="w-20 p-2 rounded bg-gray-700 text-white"
                  min="0"
                  step="1"
                />
                <button
                  type="button"
                  onClick={() => removerVariante(v.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded font-bold w-full"
          >
            Salvar Produto
          </button>
        </div>
      </form>
    </div>
  );
}
