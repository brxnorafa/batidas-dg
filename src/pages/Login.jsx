import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/php/auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (data.sucess) {
                login(data.role);
                if (data.role === 'admin') navigate('/admin');
                else if (data.role === 'pedidos') navigate('/pedidos');
                else if (data.role === 'portaria') navigate('/portaria');
            } else {
                setError(data.message || 'Usuário ou senha inválidos');
            }
        } catch {
            setError('Erro na conexão com o servidor.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form 
            onSubmit={handleSubmit} 
            className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

                {error && (
                    <p className="mb-4 text-red-600 text-center">{error}</p>
                )}

                <label className="block mb-2 font-semibold">Usuário</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                    required
                />

                <label className="block mb-2 font-semibold">Senha</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-6 border rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Entrar
                </button>
            </form>
        </div>
    );
}