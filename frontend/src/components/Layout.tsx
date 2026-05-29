import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col bg-dark-900">
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
                <Outlet />
            </main>
            <footer className="bg-dark-950 border-t border-dark-700/50 text-center py-4 text-sm text-dark-500">
                <p>Bolão Copa do Mundo 2026 </p>
                <p className="mt-1">Feito por Fernando Oliveira — Senior Software Engineer</p>
            </footer>
        </div>
    );
}
