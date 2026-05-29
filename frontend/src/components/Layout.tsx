import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
                <Outlet />
            </main>
            <footer className="bg-gray-100 border-t text-center py-4 text-sm text-gray-500">
                Bolão Copa do Mundo 2026 — Feito com ⚽ e ❤️
            </footer>
        </div>
    );
}
