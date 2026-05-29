import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Prediction, LeaderboardEntry } from '../types';

interface DashboardStats {
    totalPredictions: number;
    totalPoints: number;
    exactScores: number;
    correctWinners: number;
    correctWinnerAndGoalDiff: number;
    missedPredictions: number;
    mostPredictedScore: string | null;
    mostPredictedScoreCount: number;
    rankPosition: number | null;
    totalPlayers: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [predictions, leaderboard] = await Promise.all([
                    api.get<Prediction[]>('/predictions/all'),
                    api.get<LeaderboardEntry[]>('/leaderboard'),
                ]);

                const myPredictions = predictions.filter((p) => p.user?.id === user?.id);

                // Calcular estatísticas
                let exactScores = 0;
                let correctWinners = 0;
                let correctWinnerAndGoalDiff = 0;
                let missedPredictions = 0;
                let totalPoints = 0;
                const scoreCount = new Map<string, number>();

                for (const pred of myPredictions) {
                    totalPoints += pred.points;
                    if (pred.points === 10) exactScores++;
                    else if (pred.points === 7) correctWinnerAndGoalDiff++;
                    else if (pred.points === 5) correctWinners++;
                    else if (pred.match.played) missedPredictions++;

                    const scoreKey = `${pred.homeScore}x${pred.awayScore}`;
                    scoreCount.set(scoreKey, (scoreCount.get(scoreKey) || 0) + 1);
                }

                let mostPredictedScore: string | null = null;
                let mostPredictedScoreCount = 0;
                for (const [score, count] of scoreCount.entries()) {
                    if (count > mostPredictedScoreCount) {
                        mostPredictedScore = score;
                        mostPredictedScoreCount = count;
                    }
                }

                const rankPosition = leaderboard.findIndex((e) => e.userId === user?.id) + 1 || null;

                setStats({
                    totalPredictions: myPredictions.length,
                    totalPoints,
                    exactScores,
                    correctWinners,
                    correctWinnerAndGoalDiff,
                    missedPredictions,
                    mostPredictedScore,
                    mostPredictedScoreCount,
                    rankPosition,
                    totalPlayers: leaderboard.length,
                });
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, [user?.id]);

    if (loading) return <div className="text-center py-12 text-dark-400">Carregando...</div>;

    if (!stats) return <div className="text-center py-12 text-dark-400">Erro ao carregar dados.</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">
                    👋 Olá, <span className="text-primary-300">{user?.name}</span>!
                </h1>
                <Link
                    to="/jogos"
                    className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/20"
                >
                    ⚽ Ver Jogos e Palpitar
                </Link>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    icon="🎯"
                    label="Palpites"
                    value={stats.totalPredictions}
                />
                <StatCard
                    icon="⭐"
                    label="Pontos"
                    value={stats.totalPoints}
                    highlight
                />
                <StatCard
                    icon="🏆"
                    label="Posição no Ranking"
                    value={stats.rankPosition ? `${stats.rankPosition}º / ${stats.totalPlayers}` : '-'}
                />
                <StatCard
                    icon="💯"
                    label="Placares Exatos"
                    value={stats.exactScores}
                    subtext="10 pts cada"
                />
                <StatCard
                    icon="📊"
                    label="Vencedor + Saldo"
                    value={stats.correctWinnerAndGoalDiff}
                    subtext="7 pts cada"
                />
                <StatCard
                    icon="✅"
                    label="Vencedor Correto"
                    value={stats.correctWinners}
                    subtext="5 pts cada"
                />
                <StatCard
                    icon="❌"
                    label="Errados"
                    value={stats.missedPredictions}
                    subtext="0 pts"
                />
                <StatCard
                    icon="📈"
                    label="Placar Mais Apostado"
                    value={stats.mostPredictedScore || '-'}
                    subtext={stats.mostPredictedScore ? `${stats.mostPredictedScoreCount}x apostado` : ''}
                />
            </div>

            {/* Acesso rápido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <QuickLink
                    to="/jogos"
                    icon="⚽"
                    title="Jogos"
                    description="Veja os próximos jogos e faça seus palpites"
                />
                <QuickLink
                    to="/meus-palpites"
                    icon="🎯"
                    title="Palpites"
                    description="Confira todos os palpites dos participantes"
                />
                <QuickLink
                    to="/classificacao"
                    icon="🏆"
                    title="Ranking"
                    description="Acompanhe a classificação geral"
                />
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subtext, highlight }: {
    icon: string;
    label: string;
    value: string | number;
    subtext?: string;
    highlight?: boolean;
}) {
    return (
        <div className={`bg-dark-800 rounded-xl border p-4 ${highlight ? 'border-primary-500/30 bg-primary-900/10' : 'border-dark-700'}`}>
            <div className="text-xl mb-1">{icon}</div>
            <div className={`text-2xl font-bold ${highlight ? 'text-primary-300' : 'text-white'}`}>
                {value}
            </div>
            <div className="text-xs text-dark-400 mt-0.5">{label}</div>
            {subtext && <div className="text-xs text-dark-500 mt-0.5">{subtext}</div>}
        </div>
    );
}

function QuickLink({ to, icon, title, description }: {
    to: string;
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <Link
            to={to}
            className="bg-dark-800 hover:bg-dark-750 rounded-xl border border-dark-700 hover:border-dark-600 p-4 transition-all group"
        >
            <div className="text-2xl mb-2">{icon}</div>
            <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">{title}</h3>
            <p className="text-sm text-dark-400 mt-1">{description}</p>
        </Link>
    );
}
