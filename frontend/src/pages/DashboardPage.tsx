import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Prediction, LeaderboardEntry } from '../types';
import { useI18n } from '../i18n';

interface UserStats {
    userId: string;
    name: string;
    totalPredictions: number;
    totalPoints: number;
    exactScores: number;
    correctWinners: number;
    correctWinnerAndGoalDiff: number;
    missedPredictions: number;
    mostPredictedScore: string | null;
    mostPredictedScoreCount: number;
    rankPosition: number;
}

export default function DashboardPage() {
    const { t } = useI18n();
    const [allStats, setAllStats] = useState<UserStats[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [predictions, leaderboard] = await Promise.all([
                    api.get<Prediction[]>('/predictions/all'),
                    api.get<LeaderboardEntry[]>('/leaderboard'),
                ]);

                // Group predictions by user
                const userMap = new Map<string, { name: string; predictions: Prediction[] }>();
                for (const pred of predictions) {
                    const userId = pred.user?.id || 'unknown';
                    const name = pred.user?.name || t.predictionsUnknown;
                    if (!userMap.has(userId)) {
                        userMap.set(userId, { name, predictions: [] });
                    }
                    userMap.get(userId)!.predictions.push(pred);
                }

                // Calculate stats per user
                const stats: UserStats[] = [];
                for (const [userId, data] of userMap.entries()) {
                    let exactScores = 0;
                    let correctWinners = 0;
                    let correctWinnerAndGoalDiff = 0;
                    let missedPredictions = 0;
                    let totalPoints = 0;
                    const scoreCount = new Map<string, number>();

                    for (const pred of data.predictions) {
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

                    const rankPosition = leaderboard.findIndex((e) => e.userId === userId) + 1 || leaderboard.length + 1;

                    stats.push({
                        userId,
                        name: data.name,
                        totalPredictions: data.predictions.length,
                        totalPoints,
                        exactScores,
                        correctWinners,
                        correctWinnerAndGoalDiff,
                        missedPredictions,
                        mostPredictedScore,
                        mostPredictedScoreCount,
                        rankPosition,
                    });
                }

                stats.sort((a, b) => a.rankPosition - b.rankPosition);
                setAllStats(stats);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, []);

    const selectedUser = useMemo(
        () => allStats.find((u) => u.userId === selectedUserId) || null,
        [allStats, selectedUserId]
    );

    if (loading) return <div className="text-center py-12 text-dark-400">{t.loading}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">{t.dashboardTitle}</h1>
                <Link
                    to="/jogos"
                    className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/20"
                >
                    {t.dashboardGoToMatches}
                </Link>
            </div>

            {/* User list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {allStats.map((userStat) => (
                    <button
                        key={userStat.userId}
                        onClick={() => setSelectedUserId(selectedUserId === userStat.userId ? null : userStat.userId)}
                        className={`bg-dark-800 rounded-xl border p-3 text-left transition-all hover:border-primary-500/40 ${selectedUserId === userStat.userId
                            ? 'border-primary-500/60 ring-1 ring-primary-500/30'
                            : 'border-dark-700'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-primary-600/20 rounded-full flex items-center justify-center text-primary-300 font-bold text-sm">
                                {userStat.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-white truncate">{userStat.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-dark-400">{userStat.rankPosition}º {t.dashboardPlace}</span>
                            <span className="text-xs font-bold text-primary-300">{userStat.totalPoints} pts</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Selected user details */}
            {selectedUser && (
                <div className="space-y-4 animate-in fade-in">
                    <h2 className="text-lg font-semibold text-white border-b border-dark-700 pb-2">
                        {t.dashboardDetails} — <span className="text-primary-300">{selectedUser.name}</span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        <StatCard icon="🎯" label={t.dashboardPredictions} value={selectedUser.totalPredictions} />
                        <StatCard icon="⭐" label={t.dashboardPointsStat} value={selectedUser.totalPoints} highlight />
                        <StatCard icon="🏆" label={t.dashboardPosition} value={`${selectedUser.rankPosition}º / ${allStats.length}`} />
                        <StatCard icon="💯" label={t.dashboardExactScores} value={selectedUser.exactScores} subtext={`10 ${t.dashboardEachPts}`} />
                        <StatCard icon="📊" label={t.dashboardWinnerAndDiff} value={selectedUser.correctWinnerAndGoalDiff} subtext={`7 ${t.dashboardEachPts}`} />
                        <StatCard icon="✅" label={t.dashboardCorrectWinner} value={selectedUser.correctWinners} subtext={`5 ${t.dashboardEachPts}`} />
                        <StatCard icon="❌" label={t.dashboardMissed} value={selectedUser.missedPredictions} subtext="0 pts" />
                        <StatCard icon="📈" label={t.dashboardMostPredicted} value={selectedUser.mostPredictedScore || '-'} subtext={selectedUser.mostPredictedScore ? `${selectedUser.mostPredictedScoreCount}${t.dashboardTimesBet}` : ''} />
                    </div>
                </div>
            )}

            {!selectedUser && allStats.length > 0 && (
                <p className="text-center text-dark-500 text-sm py-4">
                    {t.dashboardSelectUser}
                </p>
            )}
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
