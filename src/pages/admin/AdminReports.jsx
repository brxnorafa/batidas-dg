import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("hoje");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (tipo) => {
    setLoading(true);
    try {
      const res = await fetch(`/php/reports/reports.php?tipo=${tipo}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        console.error("Erro ao carregar dados do relatório");
        setData(null);
      }
    } catch (err) {
      console.error("Erro de conexão", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    // --- HEADER ---

    const avatar1 = "/avatar_dg.png";

    const pageWidth = doc.internal.pageSize.getWidth();
    const imgSize = 30;
    const centerX = pageWidth / 2;
    const yImg = 15;

    // Colocar avatar1 centralizado
    doc.addImage(avatar1, "JPEG", centerX - imgSize / 2, yImg, imgSize, imgSize);

    // Linha horizontal abaixo do header
    doc.setDrawColor(75, 0, 130);
    doc.setLineWidth(0.8);
    doc.line(15, yImg + imgSize + 10, pageWidth - 15, yImg + imgSize + 10);

    // --- CONTEÚDO ---
    let y = yImg + imgSize + 20;
    const leftMargin = 20;
    const sectionSpacing = 35;

    // Pedidos
    doc.setFontSize(16);
    doc.setTextColor("#4B0082");
    doc.setFont("helvetica", "bold");
    doc.text("Pedidos", leftMargin, y);
    y += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#000000");
    doc.text(`Finalizados: ${data.pedidos.finalizados}`, leftMargin, y);
    y += 7;
    doc.text(`Cancelados: ${data.pedidos.cancelados}`, leftMargin, y);
    y += 7;
    doc.text(`Total: ${data.pedidos.total}`, leftMargin, y);
    y += sectionSpacing;

    // Pagamentos
    doc.setFontSize(16);
    doc.setTextColor("#4B0082");
    doc.setFont("helvetica", "bold");
    doc.text("Pagamentos", leftMargin, y);
    y += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#000000");
    doc.text(`Pix: ${formatCurrency(data.pagamentos["Pix"] || 0)}`, leftMargin, y);
    y += 7;
    doc.text(`Dinheiro: ${formatCurrency(data.pagamentos["Dinheiro"] || 0)}`, leftMargin, y);
    y += 7;
    doc.text(`Débito: ${formatCurrency(data.pagamentos["Cartão Débito"] || 0)}`, leftMargin, y);
    y += 7;
    doc.text(`Crédito: ${formatCurrency(data.pagamentos["Cartão Crédito"] || 0)}`, leftMargin, y);
    y += 7;
    doc.text(`Total: R$ ${data.valorTotal}`, leftMargin, y);
    y += sectionSpacing;

    // Clientes cadastrados
    doc.setFontSize(16);
    doc.setTextColor("#4B0082");
    doc.setFont("helvetica", "bold");
    doc.text("Clientes Cadastrados", leftMargin, y);
    y += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#000000");
    doc.text(`Total: ${data.clientes}`, leftMargin, y);
    y += sectionSpacing;

    // Entrada
    doc.setFontSize(16);
    doc.setTextColor("#4B0082");
    doc.setFont("helvetica", "bold");
    doc.text("Entrada", leftMargin, y);
    y += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#000000");
    doc.text(`Pessoas que entraram: ${data.entradas}`, leftMargin, y);

    doc.save(`Relatorio_BatidasDG_${activeTab}.pdf`);
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const tabs = [
    { key: "hoje", label: "Hoje" },
    { key: "semana", label: "Essa semana" },
    { key: "mes", label: "Esse mês" },
    { key: "geral", label: "Geral" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Relatórios</h1>

      {/* Tabs */}
      <div className="flex mb-4 border border-purple-500 rounded overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 font-semibold transition ${activeTab === tab.key
              ? "bg-purple-500 text-white"
              : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Botão geral para gerar PDF */}
      <div className="mb-6 text-center">
        <button
          onClick={generatePDF}
          className="bg-blue-600 hover:bg-blue-700 py-2 px-6 rounded font-semibold"
          disabled={loading || !data}
          title={loading ? "Carregando dados..." : "Gerar relatório em PDF"}
        >
          📄 Gerar PDF Completo
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-300">🔄 Carregando dados...</p>
      ) : !data ? (
        <p className="text-center text-red-400">❌ Erro ao carregar relatórios.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          {/* Card: Pedidos */}
          <div className="bg-gray-800 rounded-xl p-5 shadow-md">
            <h2 className="text-xl font-bold mb-3">📦 Pedidos</h2>
            <ul className="mb-4 space-y-1 text-gray-300">
              <li>
                ✅ Finalizados: <b>{data.pedidos.finalizados}</b>
              </li>
              <li>
                ❌ Cancelados: <b>{data.pedidos.cancelados}</b>
              </li>
              <li>
                📋 Total: <b>{data.pedidos.total}</b>
              </li>
            </ul>
          </div>

          {/* Card: Pagamentos */}
          <div className="bg-gray-800 rounded-xl p-5 shadow-md">
            <h2 className="text-xl font-bold mb-3">💰 Pagamentos</h2>
            <ul className="mb-4 space-y-1 text-gray-300">
              <li>
                🔷 Pix: <b>{formatCurrency(data.pagamentos["Pix"] || 0)}</b>
              </li>
              <li>
                💵 Dinheiro: <b>{formatCurrency(data.pagamentos["Dinheiro"] || 0)}</b>
              </li>
              <li>
                💳 Débito: <b>{formatCurrency(data.pagamentos["Cartão Débito"] || 0)}</b>
              </li>
              <li>
                💳 Crédito: <b>{formatCurrency(data.pagamentos["Cartão Crédito"] || 0)}</b>
              </li>
              <li>
                📈 Total: <b>R$ {data.valorTotal}</b>
              </li>
            </ul>
          </div>

          {/* Card: Clientes */}
          <div className="bg-gray-800 rounded-xl p-5 shadow-md">
            <h2 className="text-xl font-bold mb-3">👥 Clientes Cadastrados</h2>
            <p className="text-gray-300 text-lg mb-4">
              Total: <b>{data.clientes}</b>
            </p>
          </div>

          {/* Card: Entrada */}
          <div className="bg-gray-800 rounded-xl p-5 shadow-md">
            <h2 className="text-xl font-bold mb-3">🚪 Entrada</h2>
            <p className="text-gray-300 text-lg mb-4">
              Pessoas que entraram: <b>{data.entradas}</b>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
