import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function AdminWhatsapp() {
  const instanceId = "LITE-CPR8X2-C38SH4";
  const apiToken = "CLCLsyIcyuJ6rYm18hL97kW9TzUbOOmO9";

  const [activeTab, setActiveTab] = useState("instancia");
  const [subTab, setSubTab] = useState("status");

  const [instanceData, setInstanceData] = useState(null);
  const [profilePic, setProfilePic] = useState("");
  const [profileName, setProfileName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [imageLink, setImageLink] = useState("");
  const [testImageLink, setTestImageLink] = useState("");


  const [messageMes, setMessageMes] = useState(
    "🎉 Olá {nome}, parabéns adiantado pelo seu aniversário! A equipe Batidas DG deseja tudo de bom pra você! 🥳"
  );
  const [messageQuinze, setMessageQuinze] = useState(
    "🎉 Olá {nome}, faltam só 15 dias pro seu aniversário! A gente já tá comemorando aqui na Batidas DG! 🎉🥳"
  );

  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [loadingInstance, setLoadingInstance] = useState(true);

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


  const fetchInstanceStatus = async () => {
    setLoadingInstance(true);
    try {
      const res = await fetch(
        `https://api.w-api.app/v1/instance/fetch-instance?instanceId=${instanceId}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      const data = await res.json();
      setInstanceData(data);
      if (data.connected) await fetchProfilePic(data.instanceId);
      else {
        setProfileName("");
        setProfilePic("");
      }
    } catch (err) {
      console.error(err);
      setInstanceData(null);
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
      const data = await res.json();
      setProfileName(data.name || "");
      setProfilePic(data.profilePictureUrl || "");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQrCode = async () => {
    try {
      const res = await fetch(
        `https://api.w-api.app/v1/instance/qr-code?instanceId=${instanceId}&image=enable`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      const blob = await res.blob();
      setQrCode(URL.createObjectURL(blob));
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar QR Code.");
    }
  };

  const disconnectInstance = async () => {
    try {
      await fetch(
        `https://api.w-api.app/v1/instance/disconnect?instanceId=${instanceId}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      await fetchInstanceStatus();
      toast.success("Instância desconectada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao desconectar.");
    }
  };


  const buscarAniversariantes = async () => {
    try {
      const res = await fetch("/php/birthday/birthday.php");
      const aniversariantes = await res.json();

      if (!aniversariantes || aniversariantes.length === 0) {
        toast.info("Nenhum aniversariante encontrado.");
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

        // Envia texto
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

        // Envia imagem se tiver
        if (imageLink.trim() !== "") {
          await fetch(
            `https://api.w-api.app/v1/message/send-image?instanceId=${instanceId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiToken}`,
              },
              body: JSON.stringify({
                phone: pessoa.telefone,
                image: imageLink,
                caption: "", // opcional
                delayMessage: 15,
              }),
            }
          );
        }
      }

      toast.success("Mensagens enviadas!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar aniversariantes.");
    }
  };



  const sendTestMessage = async () => {
    if (!testNumber || !testMessage) {
      toast.warn("Preencha o número e a mensagem.");
      return;
    }

    try {
      // Envia texto
      await fetch(
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
            delayMessage: 5,
          }),
        }
      );

      // Envia imagem se testImageLink estiver preenchido
      if (testImageLink.trim() !== "") {
        await fetch(
          `https://api.w-api.app/v1/message/send-image?instanceId=${instanceId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
              phone: testNumber,
              image: testImageLink,
              caption: "", // ou testMessage se quiser como legenda
              delayMessage: 5,
            }),
          }
        );
      }

      toast.success("Mensagem enviada!");
      setTestNumber("");
      setTestMessage("");
      setTestImageLink("");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar mensagem.");
    }
  };

  useEffect(() => {
    if (activeTab === "instancia") fetchInstanceStatus();
  }, [activeTab]);

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">📱 Whatsapp Automático</h1>

      {/* Tabs principais */}
      <div className="flex mb-6 border border-purple-500 rounded overflow-hidden">
        <button
          onClick={() => setActiveTab("instancia")}
          className={`flex-1 py-3 font-semibold transition ${activeTab === "instancia"
            ? "bg-purple-500 text-white"
            : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
            }`}
        >
          Instância
        </button>
        <button
          onClick={() => setActiveTab("teste")}
          className={`flex-1 py-3 font-semibold transition ${activeTab === "teste"
            ? "bg-purple-500 text-white"
            : "bg-gray-800 text-purple-400 hover:bg-purple-600 hover:text-white"
            }`}
        >
          Teste
        </button>
      </div>

      {activeTab === "instancia" && (
        <>
          {/* Subtabs */}
          <div className="flex border-b border-purple-400 mb-6">
            <button
              onClick={() => setSubTab("status")}
              className={`px-4 py-2 font-medium transition border-b-2 ${subTab === "status"
                ? "border-purple-400 text-white"
                : "border-transparent text-purple-300 hover:text-white"
                }`}
            >
              Status
            </button>
            <button
              onClick={() => setSubTab("config")}
              className={`px-4 py-2 font-medium transition border-b-2 ${subTab === "config"
                ? "border-purple-400 text-white"
                : "border-transparent text-purple-300 hover:text-white"
                }`}
            >
              Configurações
            </button>
          </div>

          {/* Conteúdo das subtabs */}
          {subTab === "status" && (
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              {loadingInstance ? (
                <p>Carregando instância...</p>
              ) : instanceData ? (
                <>
                  <div className="flex items-center gap-5 mb-6">
                    {instanceData.connected && profilePic ? (
                      <img
                        src={profilePic}
                        alt="Perfil"
                        className="w-20 h-20 rounded-full border-2 border-green-400 object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-3xl text-gray-400 font-bold">
                        ?
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-gray-300">
                      <div><b>🆔 ID da Instância:</b> {instanceData.instanceId}</div>
                      <div><b>🔐 Nome da Instância:</b> {instanceData.instanceName}</div>
                      <div><b>📞 Número Conectado:</b> {instanceData.connectedPhone || "-"}</div>
                      <div><b>👤 Nome do Perfil:</b> {profileName || "-"}</div>
                      <div>
                        <b>📶 Status de Conexão:</b>{" "}
                        <span className={instanceData.connected ? "text-green-400" : "text-red-400"}>
                          {instanceData.connected ? "Conectado" : "Desconectado"}
                        </span>
                      </div>
                      <div><b>📅 Criada em:</b> {formatDate(instanceData.created)}</div>
                      <div><b>⏳ Expira em:</b> {formatDate(instanceData.expires)}</div>
                      <div><b>💳 Status de Pagamento:</b> {instanceData.paymentStatus}</div>
                      <div><b>🧪 Modo de Teste:</b> {instanceData.isTrial ? "Sim" : "Não"}</div>
                      <div><b>📨 Mensagens Enviadas:</b> {instanceData.messagesSent}</div>
                      <div><b>📥 Mensagens Recebidas:</b> {instanceData.messagesReceived}</div>
                      <div><b>👥 Contatos:</b> {instanceData.contacts}</div>
                      <div><b>💬 Conversas:</b> {instanceData.chats}</div>
                    </div>
                  </div>

                  {instanceData.connected ? (
                    <>
                      <button
                        onClick={buscarAniversariantes}
                        className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-semibold mb-3"
                      >
                        🎂 Buscar Aniversariantes
                      </button>
                      <button
                        onClick={disconnectInstance}
                        className="w-full bg-red-600 hover:bg-red-700 py-3 rounded font-semibold"
                      >
                        📴 Desconectar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={fetchQrCode}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-semibold"
                    >
                      📲 Conectar Número
                    </button>
                  )}
                </>
              ) : (
                <p>Erro ao carregar status da instância.</p>
              )}
            </div>
          )}

          {subTab === "config" && (
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-6">
              <div>
                <p className="text-yellow-300 text-sm mb-2">
                  ⚠️ Você pode usar <code className="bg-gray-700 px-1 py-0.5 rounded">{`{nome}`}</code> para inserir automaticamente o nome do aniversariante na mensagem.
                </p>
                <p className="mb-1 text-yellow-400 font-semibold">
                  Mensagem para aniversariantes daqui 1 mês:
                </p>
                <textarea
                  rows={3}
                  value={messageMes}
                  onChange={(e) => setMessageMes(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white"
                />
              </div>
              <div>
                <p className="mb-1 text-yellow-400 font-semibold">
                  Mensagem para aniversariantes daqui 15 dias:
                </p>
                <textarea
                  rows={3}
                  value={messageQuinze}
                  onChange={(e) => setMessageQuinze(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white"
                />
              </div>
              <div>
                <p className="text-yellow-300 text-sm mb-2">
                  ⚠️ O link abaixo será usado como imagem nas mensagens de aniversário. Deve ser um link direto para imagem (<code>.jpg</code>, <code>.png</code>, etc).
                </p>
                <input
                  type="text"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageLink}
                  onChange={(e) => setImageLink(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white"
                />
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "teste" && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
          <input
            type="text"
            placeholder="📞 Número com DDI e DDD (ex: 5511999999999)"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />

          <input
            type="text"
            placeholder="💬 Mensagem de teste"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />

          <input
            type="text"
            placeholder="🖼️ Link da imagem para teste (opcional)"
            value={testImageLink}
            onChange={(e) => setTestImageLink(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />

          <button
            onClick={sendTestMessage}
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-semibold"
          >
            📤 Enviar Mensagem
          </button>
        </div>
      )}

      {/* Modal QR Code */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-4">📲 Escaneie o QR Code</h2>
            {qrCode ? (
              <img src={qrCode} alt="QR Code" className="w-56 h-56 mx-auto rounded-lg" />
            ) : (
              <p>Carregando QR Code...</p>
            )}
            <button
              onClick={() => {
                setShowModal(false);
                fetchInstanceStatus();
              }}
              className="mt-5 w-full bg-red-600 hover:bg-red-700 py-2.5 rounded font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}
