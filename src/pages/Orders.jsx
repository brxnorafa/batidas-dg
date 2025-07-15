import { useState, useEffect } from "react";
import avatar_softwave from '../assets/avatar_softwave.png';
const formasPagamento = [
  { label: "Cartão Crédito", value: "credito" },
  { label: "Cartão Débito", value: "debito" },
  { label: "Pix", value: "pix" },
  { label: "Fiado", value: "fiado" },
  { label: "Dinheiro", value: "dinheiro" },
];


function ModalPagamento({ onConfirm }) {
  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-[#050512] bg-opacity-90 p-8 rounded-lg shadow-lg text-center max-w-sm w-full relative">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Esperando pagamento
          </h2>
          <div className="mx-auto mb-6 w-16 h-16 border-4 border-t-purple-400 border-purple-600 rounded-full animate-spin"></div>
          <button
            onClick={onConfirm}
            className="bg-purple-700 text-white font-semibold px-6 py-3 rounded hover:bg-purple-600 transition"
          >
            Confirmar Pagamento
          </button>
        </div>
      </div>
    </>
  );
}

export default function Orders() {
  const [step, setStep] = useState(1);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState({});
  const [insumosOpcionais, setInsumosOpcionais] = useState({});
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [pagamento, setPagamento] = useState(formasPagamento[0]);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);

  const categorias = Array.from(
    new Set(produtos.map((p) => p.category || "Sem Categoria"))
  );

  const produtosFiltrados = produtos.filter((produto) => {
    const bateCategoria =
      filtroCategoria === "" ||
      (produto.category || "Sem Categoria") === filtroCategoria;
    const bateNome = produto.name
      .toLowerCase()
      .includes(filtroNome.toLowerCase());
    return bateCategoria && bateNome;
  });

  useEffect(() => {
    fetch("/php/orders/employee/orders.php?action=listar_produtos")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Filtra produtos com has_stock = 1
          const produtosComEstoque = data.produtos.filter(p => p.has_stock === 1);
          setProdutos(produtosComEstoque);
        } else {
          alert("Erro ao buscar produtos");
        }
      });
  }, []);


  const toggleProduto = (produto) => {
    setCarrinho((prev) => {
      const novo = { ...prev };
      if (novo[produto.id]) delete novo[produto.id];
      else novo[produto.id] = { produto, quantidade: 1, opcionais: {} };
      return novo;
    });
  };

  const mudarQuantidade = (id, quantidade) => {
    setCarrinho((prev) => {
      const novo = { ...prev };
      if (novo[id]) {
        let q = quantidade < 1 ? 1 : quantidade;
        novo[id] = { ...novo[id], quantidade: q };
      }
      return novo;
    });
  };

  const ajustarQuantidadeProduto = (id, delta) => {
    setCarrinho((prev) => {
      const novo = { ...prev };
      if (!novo[id]) return novo;
      let q = novo[id].quantidade + delta;
      if (q < 1) q = 1;
      novo[id] = { ...novo[id], quantidade: q };
      return novo;
    });
  };

  const toggleOpcional = (produtoId, supplyId) => {
    setCarrinho((prev) => {
      const novo = { ...prev };
      if (!novo[produtoId]) return prev;
      const opcionais = { ...novo[produtoId].opcionais };
      if (opcionais[supplyId]) delete opcionais[supplyId];
      else opcionais[supplyId] = 1;
      novo[produtoId] = { ...novo[produtoId], opcionais };
      return novo;
    });
  };

  const mudarQuantidadeOpcional = (produtoId, supplyId, quantidade) => {
    setCarrinho((prev) => {
      const novo = { ...prev };
      if (!novo[produtoId]) return prev;
      if (!novo[produtoId].opcionais[supplyId]) return prev;
      let q = quantidade < 1 ? 1 : quantidade;
      const opcionais = { ...novo[produtoId].opcionais };
      opcionais[supplyId] = q;
      novo[produtoId] = { ...novo[produtoId], opcionais };
      return novo;
    });
  };

  const ajustarQuantidadeOpcional = (produtoId, supplyId, delta) => {
    setCarrinho((prev) => {
      const novo = { ...prev };
      if (!novo[produtoId]) return novo;
      if (!novo[produtoId].opcionais[supplyId]) return novo;
      let q = novo[produtoId].opcionais[supplyId] + delta;
      if (q < 1) q = 1;
      const opcionais = { ...novo[produtoId].opcionais };
      opcionais[supplyId] = q;
      novo[produtoId] = { ...novo[produtoId], opcionais };
      return novo;
    });
  };

  const removerProduto = (id) => {
    setCarrinho((prev) => {
      const novo = { ...prev };
      delete novo[id];
      return novo;
    });
  };

  const carregarOpcionais = async () => {
    const ids = Object.keys(carrinho);
    const promises = ids.map((id) =>
      fetch(`/php/orders/employee/orders.php?action=insumos_opcionais&produto_id=${id}`)
        .then((res) => res.json())
        .then((data) => ({ id, insumos: data.insumos || [] }))
    );
    const resultados = await Promise.all(promises);
    const novos = {};
    resultados.forEach(({ id, insumos }) => {
      novos[id] = insumos;
    });
    setInsumosOpcionais(novos);
  };

  useEffect(() => {
    if (step === 2) carregarOpcionais();
  }, [step]);

  const podeAvancar = () => {
    if (step === 1) return Object.keys(carrinho).length > 0;
    if (step === 2) return true;
    if (step === 3) return clienteNome.trim() !== "";
    return false;
  };

  const finalizarPedido = () => {
    setShowPagamentoModal(true);
  };

  const confirmarPagamento = async () => {
    // Calcula o total
    let total = 0;
    Object.values(carrinho).forEach(({ produto, quantidade, opcionais }) => {
      total += produto.price * quantidade;
      if (insumosOpcionais[produto.id]) {
        insumosOpcionais[produto.id].forEach((insumo) => {
          if (opcionais[insumo.id]) {
            total += (insumo.price || 0) * opcionais[insumo.id];
          }
        });
      }
    });

    const pedido = {
      clienteNome,
      pagamento: pagamento.value,
      total: total.toFixed(2),
      itens: Object.values(carrinho).map(({ produto, quantidade, opcionais }) => ({
        produtoId: produto.id,
        quantidade,
        opcionais: Object.entries(opcionais).map(([supplyId, qtd]) => ({
          supplyId,
          quantidade: qtd,
        })),
      })),
    };

    try {
      const res = await fetch("/php/orders/employee/orders.php?action=salvar_pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });
      const data = await res.json();

      if (data.success) {
        setShowPagamentoModal(false);
        alert("Pedido finalizado com sucesso!");
        setCarrinho({});
        setClienteNome("");
        setPagamento(formasPagamento[0]);
        setStep(1);
      } else {
        alert("Erro ao finalizar pedido: " + (data.message || "Desconhecido"));
      }
    } catch (err) {
      console.error("Erro na comunicação com o servidor:", err);
      alert("Erro na comunicação com o servidor.");
    }
  };

  // 👉 Função para calcular o total
  const calcularTotal = () => {
    let total = 0;
    Object.values(carrinho).forEach(({ produto, quantidade, opcionais }) => {
      total += produto.price * quantidade;
      if (insumosOpcionais[produto.id]) {
        insumosOpcionais[produto.id].forEach((insumo) => {
          if (opcionais[insumo.id]) {
            total += (insumo.price || 0) * opcionais[insumo.id];
          }
        });
      }
    });
    return total.toFixed(2).replace(".", ",");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-5 pb-24">
      <img
        src={avatar_softwave}
        alt="Logo Softwave"
        className="mx-auto h-12 mb-4"
      />

      {/* Etapas */}
      <div className="flex w-full max-w-xl mx-auto mb-8 rounded-lg overflow-hidden border border-purple-500">
        <button
          className={`flex-1 py-3 text-center font-semibold transition ${step === 1
            ? "bg-purple-500 text-white"
            : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
            }`}
          onClick={() => setStep(1)}
        >
          1. Selecionar Produtos
        </button>
        <button
          className={`flex-1 py-3 text-center font-semibold transition ${step === 2
            ? "bg-purple-500 text-white"
            : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
            }`}
          disabled={Object.keys(carrinho).length === 0}
          onClick={() => setStep(2)}
        >
          2. Detalhes
        </button>
        <button
          className={`flex-1 py-3 text-center font-semibold transition ${step === 3
            ? "bg-purple-500 text-white"
            : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
            }`}
          disabled={step < 2}
          onClick={() => setStep(3)}
        >
          3. Cliente & Pagamento
        </button>
      </div>

      {/* Passo 1 */}
      {step === 1 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Filtro Categoria */}
            <select
              className="bg-gray-800 text-white p-2 rounded flex-grow"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas Categorias</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Filtro Nome */}
            <input
              type="text"
              placeholder="Buscar por nome..."
              className="bg-gray-800 text-white p-2 rounded flex-grow"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
          </div>

          {produtosFiltrados.length === 0 ? (
            <p className="text-center text-gray-400 mt-20">
              Nenhum produto disponível para os filtros selecionados.
            </p>
          ) : (
            <div className="grid gap-4">
              {produtosFiltrados.map((produto) => (
                <label
                  key={produto.id}
                  className={`flex items-center p-4 rounded cursor-pointer hover:bg-purple-600 select-none ${carrinho[produto.id] ? "bg-purple-700" : "bg-gray-800"
                    }`}
                >
                  <input
                    type="checkbox"
                    className="mr-3 w-6 h-6 cursor-pointer"
                    checked={!!carrinho[produto.id]}
                    onChange={() => toggleProduto(produto)}
                  />
                  <div className="flex flex-col">
                    <span className="text-white font-semibold">{produto.name}</span>
                    <span className="text-gray-400 text-sm">R$ {produto.price}</span>
                    <span className="text-gray-400 text-xs italic">
                      {produto.category || "Sem Categoria"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Passo 2 */}
      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-6">
          {Object.values(carrinho).map(({ produto, quantidade, opcionais }) => (
            <div
              key={produto.id}
              className="bg-gray-800 p-4 rounded shadow-inner space-y-3"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-white font-bold text-lg">
                  {produto.name} - R$ {produto.price}
                </h2>
                <button
                  type="button"
                  onClick={() => removerProduto(produto.id)}
                  className="text-red-500 hover:text-red-700 font-bold"
                  title="Remover produto"
                >
                  &times;
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white">Quantidade:</span>
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded px-2"
                  onClick={() => ajustarQuantidadeProduto(produto.id, -1)}
                  type="button"
                >
                  -
                </button>
                <input
                  type="number"
                  className="bg-gray-700 text-white w-20 p-1 rounded text-center"
                  value={quantidade}
                  onChange={(e) =>
                    mudarQuantidade(produto.id, Number(e.target.value))
                  }
                  min={1}
                />
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded px-2"
                  onClick={() => ajustarQuantidadeProduto(produto.id, +1)}
                  type="button"
                >
                  +
                </button>
              </div>

              {insumosOpcionais[produto.id] && (
                <div>
                  <h3 className="text-white font-semibold mb-1 text-sm">
                    Insumos Opcionais:
                  </h3>
                  <div className="grid gap-2">
                    {insumosOpcionais[produto.id].map((insumo) => {
                      const selecionado = !!opcionais[insumo.id];
                      const quantidadeOpcional = selecionado ? opcionais[insumo.id] : 0;
                      return (
                        <label
                          key={insumo.id}
                          className="flex items-center gap-2 select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selecionado}
                            onChange={() => toggleOpcional(produto.id, insumo.id)}
                            className="w-6 h-6 cursor-pointer"
                          />
                          <span className="text-white flex-1">
                            {insumo.name} ({insumo.unit})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Passo 3 */}
      {step === 3 && (
        <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow-md space-y-4">
          <label className="block">
            <span className="text-white font-semibold">Nome do Cliente:</span>
            <input
              type="text"
              className="w-full p-3 rounded bg-gray-700 text-white mt-1"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Digite o nome do cliente"
            />
          </label>
          <label className="block">
            <span className="text-white font-semibold">Forma de Pagamento:</span>
            <select
              className="w-full p-3 rounded bg-gray-700 text-white mt-1"
              value={pagamento}
              onChange={(e) => setPagamento(e.target.value)}
            >
              {formasPagamento.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Botões flutuantes */}
      <div className="fixed bottom-6 right-6 flex gap-4">
        {step > 1 && (
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-5 rounded shadow-lg"
            onClick={() => setStep(step - 1)}
            type="button"
          >
            Voltar
          </button>
        )}
        {step < 3 && (
          <button
            className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded shadow-lg ${!podeAvancar() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={!podeAvancar()}
            onClick={() => setStep(step + 1)}
            type="button"
          >
            Próximo
          </button>
        )}
        {step === 3 && (
          <button
            className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded shadow-lg ${!podeAvancar() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={!podeAvancar()}
            onClick={finalizarPedido}
            type="button"
          >
            Finalizar Pedido
          </button>
        )}
      </div>

      {/* Modal de pagamento */}
      {showPagamentoModal && <ModalPagamento onConfirm={confirmarPagamento} />}

      {/* ✅ Total fixo flutuante no rodapé esquerdo */}
      <div className="fixed bottom-6 left-6 bg-gray-800 text-white py-3 px-5 rounded shadow-lg text-lg font-semibold">
        Total: R$ {calcularTotal()}
      </div>
    </div>
  );
}
