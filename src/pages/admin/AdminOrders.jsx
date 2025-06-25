import { useState, useEffect } from 'react';

export default function AdminOrders() {
  const [pedidos, setPedidos] = useState([]);
  const [status, setStatus] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/php/orders/orders.php');
      const data = await res.json();
      if (data.success) {
        setPedidos(data.orders);
        setStatus(`Atualizado em ${new Date().toLocaleString()}`);
      } else {
        setStatus('Erro ao buscar pedidos');
      }
    } catch (err) {
      console.error(err);
      setStatus('Erro ao conectar com servidor');
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderAction = async (id, action) => {
    if (!window.confirm(`${action === 'finish' ? 'Finalizar' : 'Cancelar'} pedido #${id}?`)) return;

    try {
      const res = await fetch('/php/orders/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ order_id: id, action }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar pedido');
    }
  }

  const handleMassAction = async (action) => {
    if (!window.confirm(`Tem certeza que deseja ${action === 'finish_all' ? 'FINALIZAR' : 'CANCELAR'} TODOS os pedidos?`)) return;

    try {
      const res = await fetch('/php/orders/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ action }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar ação em massa');
    }
  };


  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Pedidos - Batidas DG
      </h1>

      <p className="mt-6 text-green-400">{status}</p>

      {/* Botões de ação em massa */}
      <div className="flex gap-4 mt-6 mb-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => handleMassAction('finish_all')}
        >
          Finalizar Todos
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => handleMassAction('cancel_all')}
        >
          Cancelar Todos
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-lg mt-4">
        <table className="min-w-full text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Data/Hora</th>
              <th className="px-4 py-3 text-left">Itens</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {pedidos.map((pedido) => {
              // Tradução simples do status (adicione mais conforme precisar)
              const traduzirStatus = (status) => {
                switch (status) {
                  case 'in_preparation':
                    return 'Em preparação';
                  case 'finished':
                    return 'Finalizado';
                  case 'canceled':
                    return 'Cancelado';
                  default:
                    return status;
                }
              };

              return (
                <tr key={pedido.id}>
                  <td className="px-4 py-3">{pedido.id}</td>
                  <td className="px-4 py-3">
                    {new Date(pedido.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      {(pedido.items || []).map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col border-t border-gray-600 px-2 py-1"
                        >
                          <div className="flex justify-between">
                            <span>{item.product_name}</span>
                            <span className="font-bold">x{item.quantity}</span>
                          </div>
                          <div className="ml-4 text-gray-300 text-sm">
                            {item.optionals && item.optionals.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {item.optionals.map((opt) => (
                                  <li key={opt.id}>
                                    {opt.supply_name} (x{opt.quantity})
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <em>Sem opcional.</em>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">{pedido.customer_name}</td>
                  <td className="px-4 py-3">
                    <span className="status-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500 text-black font-semibold text-sm">
                      {traduzirStatus(pedido.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex justify-around">
                    <button
                      className="bg-green-600 rounded hover:bg-green-700 px-4 py-2 text-white font-semibold shadow"
                      onClick={() => handleOrderAction(pedido.id, 'finish')}
                    >
                      Finalizar
                    </button>
                    <button
                      className="bg-red-600 rounded hover:bg-red-700 px-4 py-2 text-white font-semibold shadow"
                      onClick={() => handleOrderAction(pedido.id, 'cancel')}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
