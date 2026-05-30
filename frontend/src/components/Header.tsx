import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { t } = useI18n();
    const [menuOpen, setMenuOpen] = useState(false);

    const navItems = [
        { path: '/regras', label: t.navRules },
        { path: '/dashboard', label: t.navDashboard },
        { path: '/jogos', label: t.navMatches },
        { path: '/meus-palpites', label: t.navPredictions },
        { path: '/classificacao', label: t.navRanking },
        { path: '/selecoes', label: t.navGroups },
        { path: '/boloes', label: '🎲 Bolões' },
        ...(user?.role === 'admin' ? [{ path: '/admin', label: '⚙️ Admin' }] : []),
    ];

    return (
        <header className="bg-dark-900/80 backdrop-blur-md border-b border-dark-700/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
                    <span className="text-2xl">⚽</span>
                    <span className="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                        {t.appTitle}
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

                <div className="hidden md:flex items-center gap-3">
                    <LanguageSwitcher />
                    <span className="text-sm text-dark-400">
                        {t.hello}, <span className="text-primary-300 font-medium">{user?.name}</span>
                    </span>
                    <button
                        onClick={logout}
                        className="text-sm bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-dark-600"
                    >
                        {t.logout}
                    </button>
                </div>

                {/* Hamburger button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-dark-700/50 transition-all"
                    aria-label="Menu"
                >
                    <span className={`block w-5 h-0.5 bg-dark-300 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                    <span className={`block w-5 h-0.5 bg-dark-300 mt-1 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-5 h-0.5 bg-dark-300 mt-1 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-dark-700/50 bg-dark-900/95 backdrop-blur-md">
                    <nav className="flex flex-col px-4 py-3 gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${location.pathname === item.path
                                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                                    : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700/50">
                        <div className="flex items-center gap-3">
                            <LanguageSwitcher />
                            <span className="text-sm text-dark-400">
                                {t.hello}, <span className="text-primary-300 font-medium">{user?.name}</span>
                            </span>
                        </div>
                        <button
                            onClick={() => { logout(); setMenuOpen(false); }}
                            className="text-sm bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-dark-600"
                        >
                            {t.logout}
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
