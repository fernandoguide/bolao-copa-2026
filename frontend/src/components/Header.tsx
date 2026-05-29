import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
    { path: '/jogos', label: '⚽ Jogos' },
    { path: '/meus-palpites', label: '🎯 Palpites' },
    { path: '/classificacao', label: '🏆 Ranking' },
    { path: '/selecoes', label: '🌍 Seleções' },
    { path: '/regras', label: '📋 Regras' },
];

export default function Header() {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <header className="bg-dark-900/80 backdrop-blur-md border-b border-dark-700/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
                    <span className="text-2xl">⚽</span>
                    <span className="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                        Bolão Copa 2026
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === item.path
                                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                                : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-dark-400">
                        Olá, <span className="text-primary-300 font-medium">{user?.name}</span>
                    </span>
                    <button
                        onClick={logout}
                        className="text-sm bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-dark-600"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
}
