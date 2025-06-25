import { useState, useEffect } from "react";

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState("cadastrar");
  const [step, setStep] = useState(1);

  // Estados categorias
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  // Para nova categoria na tab categorias
  const [novaCategoria, setNovaCategoria] = useState("");

  // Para produtos
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [filtroProdutos, setFiltroProdutos] = useState("");

  const produtosFiltrados = produtos.filter((p) =>
  p.nome.toLowerCase().includes(filtroProdutos.toLowerCase())
);



  // Estados insumos e seleção (step 2 e 3)
  const [insumos, setInsumos] = useState([]);
  const [insumoFilter, setInsumoFilter] = useState("");

  // Insumos obrigatórios selecionados: { [id]: { id, name, quantidade } }
  const [insumosSelecionados, setInsumosSelecionados] = useState({});

  // Insumos opcionais selecionados (step 3): { [id]: { id, name, quantidade } }
  const [insumosOpcionaisSelecionados, setInsumosOpcionaisSelecionados] = useState({});
  
  // Buscar produtos (lista simples)
  const buscarProdutos = async () => {
    try {
      const res = await fetch("/php/products/products.php?action=listar_produtos");
      const data = await res.json();
      if (data.success) {
        setProdutos(data.produtos);
      } else {
        alert("Erro ao buscar produtos: " + data.message);
      }
    } catch (err) {
      alert("Erro ao conectar no servidor: " + err.message);
    }
  };

  const excluirProduto = async (id) => {
    if (!confirm("Tem certeza que quer excluir este produto?")) return;

    try {
      const res = await fetch("/php/products/products.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "excluir_produto", id }),
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        buscarProdutos(); // Atualiza a lista
      }
    } catch (err) {
      alert("Erro ao excluir produto: " + err.message);
    }
  };

  // Quando abrir a tab listar, busca os produtos
  useEffect(() => {
    if (activeTab === "listar") {
      buscarProdutos();
    }
  }, [activeTab]);


  // Buscar categorias
  const buscarCategorias = async () => {
    try {
      const res = await fetch("/php/products/products.php?action=categorias");
      const data = await res.json();
      if (data.success) {
        setCategorias(data.categorias);
      } else {
        alert("Erro ao buscar categorias: " + data.message);
      }
    } catch (err) {
      alert("Erro ao conectar no servidor: " + err.message);
    }
  };

  // Buscar insumos
  const buscarInsumos = async () => {
    try {
      const res = await fetch("/php/supplies/supplies.php?action=listar");
      const data = await res.json();
      if (data.success) {
        setInsumos(data.insumos);
      } else {
        alert("Erro ao buscar insumos: " + data.message);
      }
    } catch (err) {
      alert("Erro ao conectar no servidor: " + err.message);
    }
  };

  // Cadastrar categoria
  const cadastrarCategoria = async () => {
    if (!novaCategoria.trim()) return alert("Informe o nome da categoria!");

    try {
      const res = await fetch("/php/products/products.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cadastrar_categoria",
          nome: novaCategoria.trim(),
        }),
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        setNovaCategoria("");
        buscarCategorias();
      }
    } catch (err) {
      alert("Erro ao cadastrar categoria: " + err.message);
    }
  };

  // Excluir categoria
  const excluirCategoria = async (id) => {
    if (!confirm("Tem certeza que quer excluir essa categoria?")) return;

    try {
      const res = await fetch("/php/products/products.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "excluir_categoria", id }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Categoria excluída com sucesso!");
        buscarCategorias();
      } else {
        alert("Erro ao excluir categoria: " + data.message);
      }
    } catch (error) {
      alert("Erro na conexão: " + error.message);
    }
  };

  // Toggle insumo obrigatório
  const toggleInsumo = (insumo) => {
    setInsumosSelecionados((prev) => {
      const newSelected = { ...prev };
      if (newSelected[insumo.id]) {
        delete newSelected[insumo.id];
      } else {
        newSelected[insumo.id] = { ...insumo, quantidade: 1 };
      }
      return newSelected;
    });
  };

  // Toggle insumo opcional
  const toggleInsumoOpcional = (insumo) => {
    setInsumosOpcionaisSelecionados((prev) => {
      const newSelected = { ...prev };
      if (newSelected[insumo.id]) {
        delete newSelected[insumo.id];
      } else {
        newSelected[insumo.id] = { ...insumo, quantidade: 1 };
      }
      return newSelected;
    });
  };

  // Mudar quantidade insumo obrigatório
  const mudarQuantidade = (id, qtd, opcional = false) => {
    if (opcional) {
      setInsumosOpcionaisSelecionados((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            quantidade: qtd < 1 ? 1 : qtd,
          },
        };
      });
    } else {
      setInsumosSelecionados((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            quantidade: qtd < 1 ? 1 : qtd,
          },
        };
      });
    }
  };

  // Filtra insumos pelo filtro de texto
  const insumosFiltrados = insumos.filter((insumo) =>
    insumo.name.toLowerCase().includes(insumoFilter.toLowerCase())
  );

  // useEffect para buscar categorias quando abrir tabs cadastrar ou categorias
  useEffect(() => {
    if (activeTab === "cadastrar" || activeTab === "categorias") {
      buscarCategorias();
    }
  }, [activeTab]);

  // useEffect para buscar insumos quando for step 2 ou 3 do cadastrar
  useEffect(() => {
    if (activeTab === "cadastrar" && (step === 2 || step === 3)) {
      buscarInsumos();
    }
  }, [activeTab, step]);

  // Função para salvar produto
  const salvarProduto = async () => {
    if (!nome.trim()) return alert("Informe o nome do produto");
    if (!preco || isNaN(preco)) return alert("Informe um preço válido");
    if (!categoriaSelecionada) return alert("Selecione uma categoria");
    if (Object.keys(insumosSelecionados).length === 0)
      return alert("Selecione pelo menos um insumo obrigatório");

    const payload = {
      action: "salvar_produto",
      nome: nome.trim(),
      preco: Number(preco),
      categoriaSelecionada: Number(categoriaSelecionada),
      insumosObrigatorios: Object.values(insumosSelecionados).map(({ id, quantidade }) => ({
        id,
        quantidade,
      })),
      insumosOpcionais: Object.values(insumosOpcionaisSelecionados).map(({ id }) => ({ id })),
    };

    try {
      const res = await fetch("/php/products/products.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        // Limpar estados e voltar ao step 1
        setNome("");
        setPreco("");
        setCategoriaSelecionada(null);
        setInsumosSelecionados({});
        setInsumosOpcionaisSelecionados({});
        setStep(1);
      }
    } catch (err) {
      alert("Erro ao salvar produto: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gestão de Produtos</h1>

      {/* Tabs */}
      <div className="flex mb-6 border border-purple-500 rounded overflow-hidden">
        <button
          onClick={() => setActiveTab("cadastrar")}
          className={`flex-1 py-3 font-semibold text-center transition ${
            activeTab === "cadastrar"
              ? "bg-purple-500 text-white"
              : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
          }`}
        >
          Cadastrar
        </button>
        <button
          onClick={() => setActiveTab("listar")}
          className={`flex-1 py-3 font-semibold text-center transition ${
            activeTab === "listar"
              ? "bg-purple-500 text-white"
              : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
          }`}
        >
          Listar
        </button>
        <button
          onClick={() => setActiveTab("categorias")}
          className={`flex-1 py-3 font-semibold text-center transition ${
            activeTab === "categorias"
              ? "bg-purple-500 text-white"
              : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
          }`}
        >
          Categorias
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "cadastrar" && (
        <div>
          {step === 1 && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome do Produto"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-3 rounded bg-gray-800"
              />
              <input
                type="number"
                placeholder="Preço"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full p-3 rounded bg-gray-800"
              />

              {/* Categoria como select */}
              <select
                value={categoriaSelecionada ?? ""}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                className="w-full p-3 rounded bg-gray-800 text-white"
              >
                <option value="" disabled>
                  Selecione uma categoria
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (!nome.trim()) return alert("Informe o nome do produto");
                  if (!preco) return alert("Informe o preço");
                  if (!categoriaSelecionada)
                    return alert("Selecione uma categoria");
                  setStep(2);
                }}
                className="bg-purple-600 py-3 rounded w-full font-bold"
              >
                Próximo
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold mb-2">Insumos Obrigatórios</h1>
              <input
                type="text"
                placeholder="Filtrar insumos pelo nome"
                value={insumoFilter}
                onChange={(e) => setInsumoFilter(e.target.value)}
                className="w-full p-3 rounded bg-gray-800"
              />

              <div className="max-h-64 overflow-y-auto border border-gray-700 rounded bg-gray-800 p-2">
                {insumosFiltrados.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Nenhum insumo encontrado.
                  </p>
                ) : (
                  insumosFiltrados.map((insumo) => (
                    <label
                      key={insumo.id}
                      className="flex items-center cursor-pointer p-2 rounded hover:bg-purple-700"
                    >
                      <input
                        type="checkbox"
                        checked={!!insumosSelecionados[insumo.id]}
                        onChange={() => toggleInsumo(insumo)}
                        className="mr-3"
                      />
                      <div className="flex flex-col">
                        <span>{insumo.name}</span>
                        <span className="text-xs text-gray-400">{insumo.unit}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="bg-gray-800 rounded p-4 shadow-inner">
                <h3 className="text-lg font-semibold mb-2">
                  Insumos Selecionados
                </h3>
                {Object.keys(insumosSelecionados).length === 0 ? (
                  <p className="text-gray-400">Nenhum insumo selecionado.</p>
                ) : (
                  Object.values(insumosSelecionados).map(
                    ({ id, name, quantidade }) => (
                      <div
                        key={id}
                        className="flex items-center justify-between mb-2 border-b border-gray-700 pb-1"
                      >
                        <span>{name}</span>
                        <input
                          type="number"
                          min={1}
                          value={quantidade}
                          onChange={(e) =>
                            mudarQuantidade(id, Number(e.target.value))
                          }
                          className="w-20 p-1 rounded bg-gray-700 text-white text-center"
                        />
                      </div>
                    )
                  )
                )}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-600 py-2 px-4 rounded font-semibold hover:bg-gray-700 transition"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    if (Object.keys(insumosSelecionados).length === 0) {
                      alert("Selecione pelo menos um insumo obrigatório.");
                      return;
                    }
                    setInsumoFilter("");
                    setStep(3);
                  }}
                  className="bg-purple-600 py-2 px-4 rounded font-bold hover:bg-purple-700 transition"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold mb-2">Insumos Opcionais</h1>
              <input
                type="text"
                placeholder="Filtrar insumos pelo nome"
                value={insumoFilter}
                onChange={(e) => setInsumoFilter(e.target.value)}
                className="w-full p-3 rounded bg-gray-800"
              />

              <div className="max-h-64 overflow-y-auto border border-gray-700 rounded bg-gray-800 p-2">
                {insumosFiltrados.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Nenhum insumo encontrado.
                  </p>
                ) : (
                  insumosFiltrados.map((insumo) => (
                    <label
                      key={insumo.id}
                      className="flex items-center cursor-pointer p-2 rounded hover:bg-purple-700"
                    >
                      <input
                        type="checkbox"
                        checked={!!insumosOpcionaisSelecionados[insumo.id]}
                        onChange={() => toggleInsumoOpcional(insumo)}
                        className="mr-3"
                      />
                      <div className="flex flex-col">
                        <span>{insumo.name}</span>
                        <span className="text-xs text-gray-400">{insumo.unit}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="bg-gray-800 rounded p-4 shadow-inner">
                <h3 className="text-lg font-semibold mb-2">
                  Insumos Opcionais Selecionados
                </h3>
                {Object.keys(insumosOpcionaisSelecionados).length === 0 ? (
                  <p className="text-gray-400">Nenhum insumo selecionado.</p>
                ) : (
                  Object.values(insumosOpcionaisSelecionados).map(
                    ({ id, name, quantidade }) => (
                      <div
                        key={id}
                        className="flex items-center justify-between mb-2 border-b border-gray-700 pb-1"
                      >
                        <span>{name}</span>
                        <input
                          type="number"
                          min={1}
                          value={quantidade}
                          onChange={(e) =>
                            mudarQuantidade(id, Number(e.target.value), true)
                          }
                          className="w-20 p-1 rounded bg-gray-700 text-white text-center"
                        />
                      </div>
                    )
                  )
                )}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    setStep(2);
                    setInsumoFilter("");
                  }}
                  className="bg-gray-600 py-2 px-4 rounded font-semibold hover:bg-gray-700 transition"
                >
                  Voltar
                </button>
                <button
                  onClick={salvarProduto}
                  className="bg-purple-600 py-2 px-4 rounded font-bold hover:bg-purple-700 transition"
                >
                  Finalizar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "listar" && (
       <div className="bg-gray-800 rounded p-6 shadow-lg">
       <h2 className="text-2xl font-bold mb-4">Produtos Cadastrados</h2>

       {/* Input filtro */}
       <input
       type="text"
       placeholder="Filtrar produtos pelo nome"
       value={filtroProdutos}
       onChange={(e) => setFiltroProdutos(e.target.value)}
       className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
       />

       {produtosFiltrados.length === 0 ? (
       <p className="text-purple-300">Nenhum produto encontrado.</p>
       ) : (
       <ul>
              {produtosFiltrados.map((produto) => (
              <li
              key={produto.id}
              className="flex justify-between items-center p-3 border-b border-gray-700 hover:bg-purple-600 rounded"
              >
              <span>{produto.nome}</span>
              <button
                     onClick={() => excluirProduto(produto.id)}
                     className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1 rounded transition"
              >
                     Excluir
              </button>
              </li>
              ))}
       </ul>
       )}
       </div>
       )}

      {activeTab === "categorias" && (
        <div className="space-y-4 bg-gray-800 rounded p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Gerenciar Categorias</h2>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Nova Categoria"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              className="flex-grow p-3 rounded bg-gray-700 text-white"
            />
            <button
              onClick={cadastrarCategoria}
              className="bg-purple-500 hover:bg-purple-600 px-6 rounded font-bold transition"
            >
              Adicionar
            </button>
          </div>

          <ul className="max-h-72 overflow-y-auto">
            {categorias.length === 0 ? (
              <li className="text-purple-300 text-center py-4">
                Nenhuma categoria cadastrada.
              </li>
            ) : (
              categorias.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between items-center p-3 border-b border-gray-700 hover:bg-purple-600 rounded"
                >
                  <span>{c.name}</span>
                  <button
                    onClick={() => excluirCategoria(c.id)}
                    className="text-red-500 hover:text-red-700 font-bold transition"
                    title="Excluir categoria"
                  >
                    X
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
