import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function RegisterPage() {
    const { register } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email);
            navigate('/regras');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t.registerError);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
            <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl w-full max-w-md p-8">
                <div className="flex justify-end mb-4">
                    <LanguageSwitcher />
                </div>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">{t.registerTitle}</h1>
                    <p className="text-dark-400 mt-2">{t.registerSubtitle}</p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1">{t.registerName}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder-dark-500"
                            placeholder={t.registerNamePlaceholder}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1">{t.registerEmail}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder-dark-500"
                            placeholder={t.registerEmailPlaceholder}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-primary-600/20"
                    >
                        {loading ? t.registerLoading : t.registerSubmit}
                    </button>
                </form>

                <p className="text-center text-sm text-dark-400 mt-6">
                    {t.registerHasAccount}{' '}
                    <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                        {t.registerLogin}
                    </Link>
                </p>
            </div>
        </div>
    );
}
