import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email);
            navigate('/regras');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
            <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">⚽ Bolão Copa 2026</h1>
                    <p className="text-dark-400 mt-2">Faça login para participar</p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder-dark-500"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-primary-600/20"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="text-center text-sm text-dark-400 mt-6">
                    Não tem conta?{' '}
                    <Link to="/registro" className="text-primary-400 hover:text-primary-300 font-medium">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}
