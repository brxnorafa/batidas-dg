import { useState, useEffect } from "react";

export default function AdminWhatsapp() {
  const instanceId = "LITE-CPR8X2-C38SH4";
  const apiToken = "CLCLsyIcyuJ6rYm18hL97kW9TzUbOOmO9";

  const [instanceData, setInstanceData] = useState(null);
  const [profilePic, setProfilePic] = useState("");
  const [profileName, setProfileName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [messageMes, setMessageMes] = useState(
    "🎉 Olá {nome}, parabéns adiantado pelo seu aniversário! A equipe Batidas DG deseja tudo de bom pra você! 🥳"
  );
  const [messageQuinze, setMessageQuinze] = useState(
    "🎉 Olá {nome}, faltam só 15 dias pro seu aniversário! A gente já tá comemorando aqui na Batidas DG! 🎉🥳"
  );
  const [loadingInstance, setLoadingInstance] = useState(true);

  const fetchInstanceStatus = async () => {
    setLoadingInstance(true);
    try {
      const res = await fetch(
        `https://api.w-api.app/v1/instance/fetch-instance?instanceId=${instanceId}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      if (!res.ok) throw new Error("Erro ao buscar status da instância");
      const data = await res.json();

      setInstanceData(data);

      if (data.connected) {
        await fetchProfilePic(data.instanceId);
      } else {
        setProfileName("");
        setProfilePic("");
      }
    } catch (err) {
      console.error(err);
      setInstanceData(null);
      setProfileName("");
      setProfilePic("");
    } finally {
      setLoadingInstance(false);
    }
  };

  const fetchProfilePic = async (id) => {
    try {
      const res = await fetch(
        `https://api.w-api.app/v1/instance/device?instanceId=${id}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      if (!res.ok) throw new Error("Erro ao buscar foto do perfil");
      const data = await res.json();
      setProfileName(data.name || "");
      setProfilePic(data.profilePictureUrl || "");
    } catch (err) {
      console.error(err);
      setProfileName("");
      setProfilePic("");
    }
  };

  const fetchQrCode = async () => {
    try {
      const res = await fetch(
        `https://api.w-api.app/v1/instance/qr-code?instanceId=${instanceId}&image=enable`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      if (!res.ok) throw new Error("Erro ao buscar QR Code");
      const blob = await res.blob();
      setQrCode(URL.createObjectURL(blob));
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar QR Code, veja o console.");
    }
  };

  const disconnectInstance = async () => {
    try {
      const res = await fetch(
        `https://api.w-api.app/v1/instance/disconnect?instanceId=${instanceId}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      if (!res.ok) throw new Error("Erro ao desconectar");
      const data = await res.json();
      if (!data.error) alert(data.message);
      await fetchInstanceStatus();
    } catch (err) {
      console.error(err);
      alert("Erro ao desconectar, veja o console.");
    }
  };

  const sendTestMessage = async () => {
    if (!testNumber.trim() || !testMessage.trim()) {
      alert("Preencha número e mensagem!");
      return;
    }
    try {
      const res = await fetch(
        `https://api.w-api.app/v1/message/send-text?instanceId=${instanceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            phone: testNumber,
            message: testMessage,
            delayMessage: 15,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || res.statusText);
      alert("Mensagem enviada!");
      setTestNumber("");
      setTestMessage("");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar mensagem, veja o console.");
    }
  };

  const buscarAniversariantes = async () => {
    try {
      const res = await fetch("/php/birthday.php");
      if (!res.ok) throw new Error("Erro ao buscar aniversariantes");
      const aniversariantes = await res.json();

      if (!Array.isArray(aniversariantes) || aniversariantes.length === 0) {
        alert("Nenhum aniversariante encontrado 😢");
        return;
      }

      for (const pessoa of aniversariantes) {
        let mensagem = null;
        if (pessoa.tipo === "mes") {
          mensagem = messageMes.replace("{nome}", pessoa.nome);
        } else if (pessoa.tipo === "quinze") {
          mensagem = messageQuinze.replace("{nome}", pessoa.nome);
        }

        if (!mensagem) continue;

        await fetch(
          `https://api.w-api.app/v1/message/send-text?instanceId=${instanceId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
              phone: pessoa.telefone,
              message: mensagem,
              delayMessage: 15,
            }),
          }
        );
      }

      alert("Mensagens enviadas! 🎉📱");
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar aniversariantes.");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchInstanceStatus();
  }, []);

  return (
    <>
      <h1 className="text-4xl font-extrabold mb-10">📱 Configurações do Whatsapp</h1>

      <div className="flex flex-col gap-10">
        {loadingInstance ? (
          <p>Carregando dados da instância...</p>
        ) : instanceData ? (
          <section className="bg-gray-800 rounded-xl p-8 w-full shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">
              Instância: {instanceData.instanceName}
            </h2>

            <div className="flex items-center gap-5 mb-6">
              {instanceData.connected && profilePic ? (
                <img
                  src={profilePic}
                  alt="Foto do Perfil"
                  className="w-20 h-20 rounded-full border-2 border-green-400 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-3xl text-gray-400 font-bold">
                  ?
                </div>
              )}

              <div>
                <p>📛 <b>{instanceData.connected ? profileName || "-" : "-"}</b></p>
                <p>📱 {instanceData.connected ? instanceData.connectedPhone || "-" : "-"}</p>
                <p>
                  <b className={instanceData.connected ? "text-green-400" : "text-red-400"}>
                    {instanceData.connected ? "Conectado" : "Desconectado"}
                  </b>
                </p>
              </div>
            </div>

            {/* Aqui: mensagens personalizadas só se conectado */}
            {instanceData.connected && (
              <>
                <p className="mt-6 mb-1 font-semibold text-yellow-400">
                  Mensagem para aniversariantes daqui 1 mês
                </p>
                <textarea
                  value={messageMes}
                  onChange={(e) => setMessageMes(e.target.value)}
                  rows={3}
                  placeholder="Mensagem para aniversariantes daqui 1 mês"
                  className="w-full p-3 rounded-lg bg-gray-700 text-white"
                />

                <p className="mt-4 mb-1 font-semibold text-yellow-400">
                  Mensagem para aniversariantes daqui 15 dias
                </p>
                <textarea
                  value={messageQuinze}
                  onChange={(e) => setMessageQuinze(e.target.value)}
                  rows={3}
                  placeholder="Mensagem para aniversariantes daqui 15 dias"
                  className="w-full p-3 rounded-lg bg-gray-700 text-white"
                />
              </>
            )}

            {instanceData.connected ? (
              <>
                <button
                  onClick={buscarAniversariantes}
                  className="mt-4 w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold"
                >
                  🎂 Buscar Aniversariantes...
                </button>

                <button
                  onClick={disconnectInstance}
                  className="mt-3 w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold"
                >
                  📴 Desconectar Número
                </button>
              </>
            ) : (
              <button
                onClick={fetchQrCode}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
              >
                📲 Conectar Número
              </button>
            )}
          </section>
        ) : (
          <p>Erro ao carregar dados da instância.</p>
        )}

        <section className="bg-gray-800 rounded-xl p-8 w-full shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Enviar Mensagem de Teste</h2>
          <input
            type="text"
            placeholder="Número com DDI e DDD"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-gray-700 text-white"
          />
          <input
            type="text"
            placeholder="Mensagem"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-gray-700 text-white"
          />
          <button
            onClick={sendTestMessage}
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold"
          >
            📤 Enviar Mensagem
          </button>
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-4">📲 Escaneie o QR Code</h2>
            {qrCode ? (
              <img
                src={qrCode}
                alt="QR Code"
                className="w-56 h-56 mx-auto rounded-lg"
              />
            ) : (
              <p className="text-gray-300">Carregando QR Code...</p>
            )}
            <button
              onClick={() => {
                setShowModal(false);
                fetchInstanceStatus();
              }}
              className="mt-5 w-full bg-red-600 hover:bg-red-700 py-2.5 rounded-lg font-semibold text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
