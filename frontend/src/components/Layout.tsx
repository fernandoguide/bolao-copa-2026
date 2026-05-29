import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useI18n } from '../i18n';

export default function Layout() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen flex flex-col bg-dark-900">
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
                <Outlet />
            </main>
            <footer className="bg-dark-950 border-t border-dark-700/50 text-center py-4 text-sm text-dark-500">
                <p>{t.footerTitle}</p>
                <p className="mt-1">{t.footerAuthor}</p>
            </footer>
        </div>
    );
}
