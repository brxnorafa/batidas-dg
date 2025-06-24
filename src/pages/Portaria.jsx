import { useState } from "react";

export default function Portaria() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");

  const [cpfEntrada, setCpfEntrada] = useState("");
  const [cpfVerificar, setCpfVerificar] = useState("");

  const [activeTab, setActiveTab] = useState("entradas");

  // Validação CPF
  function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.charAt(10));
  }

  // Handlers
  // 📤 Cadastrar Cliente
async function cadastrarCliente() {
  if (!nome.trim() || !telefone.trim() || !cpf.trim() || !nascimento.trim()) {
    return alert("Preencha todos os campos!");
  }
  if (!validarCPF(cpf)) {
    return alert("CPF inválido!");
  }

  try {
    const res = await fetch("/php/checkin/checkin.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "cadastrar",
        nome,
        telefone,
        cpf,
        nascimento,
      }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      setNome("");
      setTelefone("");
      setCpf("");
      setNascimento("");
    }
  } catch (err) {
    alert("Erro na comunicação: " + err.message);
  }
}

// 📥 Registrar Entrada
async function registrarEntrada() {
  if (!cpfEntrada.trim()) {
    return alert("Informe o CPF!");
  }

  try {
    const res = await fetch("/php/checkin/checkin.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "registrar",
        cpf: cpfEntrada,
      }),
    });

    const data = await res.json();
    alert(data.message);
    setCpfEntrada("");
  } catch (err) {
    alert("Erro: " + err.message);
  }
}

// 🔍 Verificar Entrada
async function verificarEntrada() {
  if (!cpfVerificar.trim()) {
    return alert("Informe o CPF!");
  }

  try {
    const res = await fetch(`/php/checkin/checkin.php?cpf=${cpfVerificar}`, {
      method: "GET",
    });

    const data = await res.json();
    alert(data.message);
    setCpfVerificar("");
  } catch (err) {
    alert("Erro: " + err.message);
  }
}


  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-5">
      <h1 className="text-white text-3xl font-bold mb-8">Área de Portaria</h1>

      {/* Tabs */}
      <div className="flex w-full max-w-md mb-8 rounded-lg overflow-hidden border border-yellow-400">
        <button
          className={`flex-1 py-3 text-center font-semibold transition ${
            activeTab === "entradas"
              ? "bg-yellow-400 text-gray-900"
              : "bg-gray-800 text-yellow-400 hover:bg-yellow-600 hover:text-gray-100"
          }`}
          onClick={() => setActiveTab("entradas")}
          type="button"
        >
          Entradas
        </button>
        <button
          className={`flex-1 py-3 text-center font-semibold transition ${
            activeTab === "cadastro"
              ? "bg-yellow-400 text-gray-900"
              : "bg-gray-800 text-yellow-400 hover:bg-yellow-600 hover:text-gray-100"
          }`}
          onClick={() => setActiveTab("cadastro")}
          type="button"
        >
          Cadastro
        </button>
      </div>

      <div className="w-full max-w-md">
        {activeTab === "cadastro" && (
          <section className="bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-white text-xl font-semibold mb-4">Cadastrar Cliente</h2>
            <input
              type="text"
              placeholder="Nome completo"
              className="w-full p-3 rounded bg-gray-700 placeholder-gray-400 text-white mb-3 focus:outline-yellow-400"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Telefone (ex: 11999999999)"
              className="w-full p-3 rounded bg-gray-700 placeholder-gray-400 text-white mb-3 focus:outline-yellow-400"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
            <input
              type="text"
              maxLength={11}
              placeholder="CPF (somente números)"
              className="w-full p-3 rounded bg-gray-700 placeholder-gray-400 text-white mb-3 focus:outline-yellow-400"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
            <input
              type="date"
              className="w-full p-3 rounded bg-gray-700 placeholder-gray-400 text-white mb-4 focus:outline-yellow-400"
              value={nascimento}
              onChange={(e) => setNascimento(e.target.value)}
            />
            <button
              onClick={cadastrarCliente}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-semibold transition"
            >
              Cadastrar
            </button>
          </section>
        )}

        {activeTab === "entradas" && (
          <>
            <section className="bg-gray-800 rounded-xl p-6 shadow-md mb-8">
              <h2 className="text-white text-xl font-semibold mb-4">Registrar Entrada</h2>
              <input
                type="text"
                placeholder="CPF"
                className="w-full p-3 rounded bg-gray-700 placeholder-gray-400 text-white mb-4 focus:outline-yellow-400"
                value={cpfEntrada}
                onChange={(e) => setCpfEntrada(e.target.value)}
              />
              <button
                onClick={registrarEntrada}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-semibold transition text-white"
              >
                Registrar
              </button>
            </section>

            <section className="bg-gray-800 rounded-xl p-6 shadow-md">
              <h2 className="text-white text-xl font-semibold mb-4">Verificar Entrada</h2>
              <input
                type="text"
                placeholder="CPF"
                className="w-full p-3 rounded bg-gray-700 placeholder-gray-400 text-white mb-4 focus:outline-yellow-400"
                value={cpfVerificar}
                onChange={(e) => setCpfVerificar(e.target.value)}
              />
              <button
                onClick={verificarEntrada}
                className="w-full bg-yellow-500 hover:bg-yellow-600 py-3 rounded font-semibold transition text-white"
              >
                Verificar
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
