import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminStock() {
  const [activeTab, setActiveTab] = useState("registrar");

  const instanceId = "LITE-CPR8X2-C38SH4";
  const apiToken = "CLCLsyIcyuJ6rYm18hL97kW9TzUbOOmO9";

  const [whatsappNumber, setWhatsappNumber] = useState("5511945131320");
  const [limiteEstoqueCritico, setLimiteEstoqueCritico] = useState(20);

  // Movimentação states
  const [insumos, setInsumos] = useState([]);
  const [selectedInsumo, setSelectedInsumo] = useState("");
  const [tipoMovimentacao, setTipoMovimentacao] = useState("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [observacao, setObservacao] = useState("");
  const [query, setQuery] = useState("");
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [estoqueCritico, setEstoqueCritico] = useState([]);
  const autocompleteRef = useRef(null);

  const [filtroEstoque, setFiltroEstoque] = useState("");
  const [estoque, setEstoque] = useState([]);

  const estoqueFiltrado = estoque.filter((item) =>
    item.name.toLowerCase().includes(filtroEstoque.toLowerCase())
  );

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
      alert("Erro ao buscar insumos: " + err.message);
    }
  };

  const buscarEstoqueCritico = async (limite = 20) => {
    try {
      const res = await fetch("/php/stock/stock.php?action=estoque_negativo");
      const data = await res.json();
      if (data.success) {
        const criticos = data.estoque_critico.filter(
          (item) => parseFloat(item.quantity) < limite
        );
        setEstoqueCritico(criticos);

        if (criticos.length === 0) {
          alert(`Nenhum insumo com estoque abaixo de ${limite}.`);
        } else {
          const lista = criticos
            .map(
              (item) =>
                `- ${item.name} (${parseFloat(item.quantity).toFixed(1)} ${item.unit})`
            )
            .join("\n");

          const mensagem = `⚠️ *Alerta de Estoque Crítico* ⚠️\n\nOs seguintes insumos estão com estoque abaixo de ${limite}:\n\n${lista}\n\nPor favor, providencie reposição.`;

          await fetch(
            `https://api.w-api.app/v1/message/send-text?instanceId=${instanceId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiToken}`,
              },
              body: JSON.stringify({
                phone: whatsappNumber,
                message: mensagem,
                delayMessage: 5,
              }),
            }
          );

          alert("Mensagem de alerta enviada via WhatsApp!");
        }
      } else {
        alert("Erro ao buscar estoque crítico: " + data.message);
      }
    } catch (err) {
      alert("Erro ao buscar estoque crítico ou enviar mensagem: " + err.message);
    }
  };

  const buscarEstoque = async () => {
    try {
      const res = await fetch("/php/stock/stock.php?action=estoque");
      const data = await res.json();
      if (data.success) {
        setEstoque(data.estoque);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Erro ao buscar estoque: " + err.message);
    }
  };

  const registrarMovimentacao = async () => {
    if (!selectedInsumo) return alert("Selecione um insumo!");
    if (!quantidade || isNaN(quantidade) || parseFloat(quantidade) <= 0)
      return alert("Informe uma quantidade válida!");

    try {
      const res = await fetch("/php/stock/stock.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "registrar",
          insumo_id: selectedInsumo,
          tipo: tipoMovimentacao,
          quantidade: parseFloat(quantidade),
          observacao,
        }),
      });

      const data = await res.json();
      alert(data.message);
      if (data.success) {
        setSelectedInsumo("");
        setTipoMovimentacao("entrada");
        setQuantidade("");
        setObservacao("");
        setQuery("");
        if (activeTab === "estoque") buscarEstoque();
      }
    } catch (err) {
      alert("Erro ao registrar movimentação: " + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === "registrar") {
      buscarInsumos();
    } else if (activeTab === "estoque") {
      buscarEstoque();
    }
  }, [activeTab]);

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredInsumos([]);
      return;
    }
    const lowerQuery = query.toLowerCase();
    setFilteredInsumos(
      insumos
        .filter(
          (ins) =>
            ins.name.toLowerCase().includes(lowerQuery) ||
            ins.unit.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 10)
    );
  }, [query, insumos]);

  const handleSelectInsumo = (insumo) => {
    setSelectedInsumo(insumo.id);
    setQuery(`${insumo.name} (${insumo.unit})`);
    setFilteredInsumos([]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setFilteredInsumos([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const gerarRelatorioPDF = async (insumoId, insumoName, estoqueAtual) => {
    try {
      const res = await fetch(`/php/stock/stock.php?action=movimentacoes&insumo_id=${insumoId}`);
      const data = await res.json();

      if (!data.success) {
        alert("Erro ao buscar movimentações: " + data.message);
        return;
      }

      const movimentacoes = data.movimentacoes;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setTextColor("#6b21a8");
      doc.text(`Relatório de Estoque - ${insumoName}`, 14, 20);

      doc.setFontSize(12);
      doc.setTextColor("#000");
      doc.text(`Estoque Atual: ${parseFloat(estoqueAtual).toFixed(3)}`, 14, 30);
      doc.text(`Data do Relatório: ${new Date().toLocaleDateString()}`, 14, 37);

      const tableColumn = ["Tipo", "Quantidade", "Observação", "Data"];
      const tableRows = movimentacoes.map((mov) => [
        mov.movement_type.charAt(0).toUpperCase() + mov.movement_type.slice(1),
        parseFloat(mov.quantity).toFixed(3),
        mov.observation || "-",
        new Date(mov.created_at).toLocaleString(),
      ]);

      autoTable(doc, {
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: "#7c3aed", textColor: "#fff" },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      });

      doc.save(`relatorio_estoque_${insumoName.replace(/\s+/g, "_").toLowerCase()}.pdf`);
    } catch (error) {
      alert("Erro ao gerar relatório: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-5 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-6">Gestão de Estoque</h1>

      <div className="flex w-full max-w-5xl mb-6 rounded-lg overflow-hidden border border-purple-500">
        <button
          onClick={() => setActiveTab("registrar")}
          className={`flex-1 py-3 font-semibold text-center transition ${activeTab === "registrar"
            ? "bg-purple-500 text-white"
            : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
            }`}
        >
          Registrar Movimentação
        </button>
        <button
          onClick={() => setActiveTab("estoque")}
          className={`flex-1 py-3 font-semibold text-center transition ${activeTab === "estoque"
            ? "bg-purple-500 text-white"
            : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
            }`}
        >
          Estoque Atual
        </button>
      </div>

      <div className="w-full max-w-5xl">
        {activeTab === "registrar" && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
            <div className="relative" ref={autocompleteRef}>
              <input
                type="text"
                placeholder="Digite para buscar insumo"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedInsumo(""); // limpa seleção ao digitar
                }}
                className="w-full p-3 rounded bg-gray-700 text-white"
                autoComplete="off"
              />

              {filteredInsumos.length > 0 && (
                <ul className="absolute z-10 w-full bg-gray-700 rounded-b shadow-lg max-h-60 overflow-y-auto">
                  {filteredInsumos.map((ins) => (
                    <li
                      key={ins.id}
                      className="p-3 cursor-pointer hover:bg-purple-600"
                      onClick={() => handleSelectInsumo(ins)}
                    >
                      {ins.name} ({ins.unit})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <select
              value={tipoMovimentacao}
              onChange={(e) => setTipoMovimentacao(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white"
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
              <option value="ajuste">Ajuste</option>
            </select>

            <input
              type="number"
              placeholder="Quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white"
              min="0.001"
              step="0.001"
            />

            <input
              type="text"
              placeholder="Observação (opcional)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white"
            />

            <button
              onClick={registrarMovimentacao}
              className="w-full bg-purple-500 hover:bg-purple-600 py-3 rounded font-bold text-white transition"
            >
              Registrar
            </button>
          </div>
        )}

        {activeTab === "estoque" && (
          <>
            {/* Bolha flutuante de configuração do alerta */}
            <div className="relative z-10 -mb-10 w-full max-w-5xl">
              <div className="bg-gray-700 border border-purple-500 rounded-xl shadow-2xl p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div className="flex flex-col">
                  <label className="text-white mb-1">Limite do Estoque Crítico</label>
                  <input
                    type="number"
                    value={limiteEstoqueCritico}
                    onChange={(e) => setLimiteEstoqueCritico(parseInt(e.target.value) || 0)}
                    className="w-28 p-2 rounded bg-gray-800 text-white border border-purple-500"
                    min={0}
                    step={1}
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <label className="text-white mb-1">Número do WhatsApp</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Ex: 5511999999999"
                    className="p-2 rounded bg-gray-800 text-white border border-purple-500 w-full"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => buscarEstoqueCritico(limiteEstoqueCritico)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold h-10"
                  >
                    Notificar Estoque Crítico
                  </button>
                </div>
              </div>
            </div>

            {/* Card principal do estoque */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 pt-12 mt-16 relative z-0">
              <div className="mb-4">
                <label className="text-white mb-1 block">Filtrar pelo nome do insumo</label>
                <input
                  type="text"
                  placeholder="Digite o nome"
                  value={filtroEstoque}
                  onChange={(e) => setFiltroEstoque(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-purple-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-white">
                  <thead>
                    <tr className="bg-gray-700 text-purple-400">
                      <th className="px-4 py-3 text-left">Nome</th>
                      <th className="px-4 py-3 text-left">Unidade</th>
                      <th className="px-4 py-3 text-left">Quantidade em Estoque</th>
                      <th className="px-4 py-3 text-left">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estoqueFiltrado.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-purple-300">
                          Nenhum insumo encontrado.
                        </td>
                      </tr>
                    ) : (
                      estoqueFiltrado.map((item) => (
                        <tr key={item.id} className="border-t border-gray-700">
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.unit}</td>
                          <td className="px-4 py-3">{parseFloat(item.quantity).toFixed(3)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => gerarRelatorioPDF(item.id, item.name, item.quantity)}
                              className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded font-semibold"
                            >
                              Relatório
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
