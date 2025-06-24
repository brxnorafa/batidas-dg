import { useState, useEffect } from 'react';

export default function AdminOrders() {
  const [pedidos, setPedidos] = useState([]);
  const [status, setStatus] = useState('');

  const mockPedidos = [
    {
      id: 1,
      created_at: new Date().toISOString(),
      nome_cliente: 'João da Silva',
      status: 'Em andamento',
      itens: [
        { id: 101, nome: 'Caipirinha de Limão', quantidade: 2 },
        { id: 102, nome: 'Batida de Maracujá', quantidade: 1 },
      ],
    },
    {
      id: 2,
      created_at: new Date().toISOString(),
      nome_cliente: 'Maria Oliveira',
      status: 'Pendente',
      itens: [
        { id: 103, nome: 'Batida de Morango', quantidade: 3 },
      ],
    },
  ];

  useEffect(() => {
    setPedidos(mockPedidos);
    setStatus(`Pedidos carregados em ${new Date().toLocaleString()}`);
  }, []);

  const finalizarPedido = (id) => {
    alert(`Pedido #${id} finalizado.`);
  };

  const cancelarPedido = (id) => {
    alert(`Pedido #${id} cancelado.`);
  };

  const finalizarTodos = () => {
    alert(`Todos os pedidos finalizados.`);
  };

  const cancelarTodos = () => {
    alert(`Todos os pedidos cancelados.`);
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Pedidos - Batidas DG (Mock)
      </h1>

      <p className="mt-6 text-green-400">{status}</p>

      {/* Botões de ação em massa */}
      <div className="flex gap-4 mt-6 mb-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={finalizarTodos}
        >
          Finalizar Todos
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={cancelarTodos}
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
            {pedidos.map((pedido) => (
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
                    {pedido.itens.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between border-t border-gray-600 px-2 py-1"
                      >
                        <span>{item.nome}</span>
                        <span className="font-bold">x{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{pedido.nome_cliente}</td>
                <td className="px-4 py-3">
                  <span className="status-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500 text-black font-semibold text-sm">
                    {pedido.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex justify-around">
                  <button
                    className="bg-green-600 rounded hover:bg-green-700 px-4 py-2 text-white font-semibold shadow"
                    onClick={() => finalizarPedido(pedido.id)}
                  >
                    Finalizar
                  </button>
                  <button
                    className="bg-red-600 rounded hover:bg-red-700 px-4 py-2 text-white font-semibold shadow"
                    onClick={() => cancelarPedido(pedido.id)}
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
