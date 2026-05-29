import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
    { path: '/jogos', label: 'Jogos' },
    { path: '/meus-palpites', label: 'Meus Palpites' },
    { path: '/classificacao', label: 'Classificação' },
    { path: '/selecoes', label: 'Seleções' },
    { path: '/regras', label: 'Regras' },
];

export default function Header() {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <header className="bg-primary-800 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                    ⚽ Bolão Copa 2026
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === item.path
                                    ? 'bg-primary-900 text-white'
                                    : 'text-primary-100 hover:bg-primary-700'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-primary-200">Olá, {user?.name}</span>
                    <button
                        onClick={logout}
                        className="text-sm bg-primary-900 hover:bg-primary-950 px-3 py-1.5 rounded-md transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
}
