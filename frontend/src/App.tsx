import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useI18n } from './i18n';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MatchesPage from './pages/MatchesPage';
import MyPredictionsPage from './pages/MyPredictionsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import TeamsPage from './pages/TeamsPage';
import RulesPage from './pages/RulesPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import PoolsPage from './pages/PoolsPage';
import BracketPage from './pages/BracketPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { signed, loading } = useAuth();
    const { t } = useI18n();
    if (loading) return <div className="p-8 text-center">{t.loading}</div>;
    return signed ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, signed, loading } = useAuth();
    const { t } = useI18n();
    if (loading) return <div className="p-8 text-center">{t.loading}</div>;
    if (!signed) return <Navigate to="/login" />;
    if (user?.role !== 'admin') return <Navigate to="/regras" />;
    return <>{children}</>;
}

export default function App() {
    const { signed, loading } = useAuth();
    const { t } = useI18n();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-lg">{t.loading}</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={signed ? <Navigate to="/regras" /> : <LoginPage />} />
            <Route path="/registro" element={signed ? <Navigate to="/regras" /> : <RegisterPage />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Navigate to="/regras" />} />
                <Route path="regras" element={<RulesPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="jogos" element={<MatchesPage />} />
                <Route path="meus-palpites" element={<MyPredictionsPage />} />
                <Route path="classificacao" element={<LeaderboardPage />} />
                <Route path="selecoes" element={<TeamsPage />} />
                <Route path="boloes" element={<PoolsPage />} />
                <Route path="simulador" element={<BracketPage />} />
                <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            </Route>
        </Routes>
    );
}
