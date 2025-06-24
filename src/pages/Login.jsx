import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, Lock } from "lucide-react";

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

            if (data.success) {
                login(data.role);
                if (data.role === 'administrator') navigate('/admin/orders');
                else if (data.role === 'orders') navigate('/orders');
                else if (data.role === 'checkin') navigate('/checkin');
            } else {
                setError(data.message || 'Usuário ou senha inválidos');
            }
        } catch (error) {
            console.log('Erro no fetch:', error);
            setError('Erro na conexão com o servidor.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050512]">
            <form
                onSubmit={handleSubmit}
                className="bg-[#161616] border border-purple-400 rounded-xl shadow-md w-full max-w-sm p-6 flex flex-col items-center"
            >
                {/* Logo */}
                <div className="mb-4 w-24 h-24 flex items-center justify-center rounded-full border-2 border-purple-400 p-2">
                    <img
                        src="/avatar_dg.png"
                        alt="Logotipo"
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>

                <h2 className="text-2xl font-bold mb-2 text-center text-white">Login</h2>
                <p className="text-gray-400 mb-6 text-center">Bem-vindo à Bátidas DG!</p>

                {error && (
                    <p className="mb-4 text-red-600 text-center">{error}</p>
                )}

                {/* Input de usuário */}
                <div className="relative w-full mb-4">
                    <User className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Nome de usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 p-2 bg-[#222] text-white border border-gray-700 rounded focus:outline-none focus:border-purple-400"
                        required
                    />
                </div>

                {/* Input de senha */}
                <div className="relative w-full mb-6">
                    <Lock className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 p-2 bg-[#222] text-white border border-gray-700 rounded focus:outline-none focus:border-purple-400"
                        required
                    />
                </div>

                {/* Botão */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
                >
                    LOGIN
                </button>
            </form>
        </div>
    );
}