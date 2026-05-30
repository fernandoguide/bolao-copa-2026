import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LeaderboardEntry, Pool } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';

export default function LeaderboardPage() {
    const { user } = useAuth();
    const { t } = useI18n();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [pools, setPools] = useState<Pool[]>([]);
    const [selectedPool, setSelectedPool] = useState<string>('all'); // 'all' or pool id

    useEffect(() => {
        api.get<Pool[]>('/pools/my').then(setPools).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        const endpoint = selectedPool === 'all'
            ? '/leaderboard'
            : `/leaderboard/pool/${selectedPool}`;
        api.get<LeaderboardEntry[]>(endpoint).then((data) => {
            setLeaderboard(data);
            setLoading(false);
        });
    }, [selectedPool]);

    if (loading) return <div className="text-center py-12 text-dark-400">{t.leaderboardLoading}</div>;

    function getMedal(pos: number) {
        if (pos === 0) return '🥇';
        if (pos === 1) return '🥈';
        if (pos === 2) return '🥉';
        return `${pos + 1}º`;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-white">{t.leaderboardTitle}</h1>

                {pools.length > 0 && (
                    <select
                        value={selectedPool}
                        onChange={(e) => setSelectedPool(e.target.value)}
                        className="bg-dark-800 border border-dark-700 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                    >
                        <option value="all">🌍 Bolão Livre (Todos)</option>
                        {pools.map((pool) => (
                            <option key={pool.id} value={pool.id}>
                                🔒 {pool.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {leaderboard.length === 0 ? (
                <p className="text-dark-500 text-center py-12">{t.leaderboardEmpty}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                        <thead>
                            <tr className="bg-dark-900 border-b border-dark-700">
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400 w-16">#</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">{t.leaderboardParticipant}</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400">{t.leaderboardPoints}</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400">{t.leaderboardPredictions}</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400">{t.leaderboardExactScores}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry, index) => {
                                const isMe = entry.userId === user?.id;
                                return (
                                    <tr
                                        key={entry.userId}
                                        className={`border-b border-dark-700 last:border-0 ${isMe ? 'bg-primary-900/20' : 'hover:bg-dark-700/50'
                                            }`}
                                    >
                                        <td className="text-center px-4 py-3 text-lg">
                                            {getMedal(index)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={isMe ? 'text-primary-300 font-semibold' : 'text-dark-200'}>
                                                {entry.name}
                                                {isMe && <span className="text-xs ml-2 text-primary-500">({t.leaderboardYou})</span>}
                                            </span>
                                        </td>
                                        <td className="text-center px-4 py-3">
                                            <span className="bg-primary-600/20 text-primary-300 px-3 py-1 rounded-full font-bold text-sm border border-primary-500/20">
                                                {entry.totalPoints}
                                            </span>
                                        </td>
                                        <td className="text-center px-4 py-3 text-dark-400">
                                            {entry.totalPredictions}
                                        </td>
                                        <td className="text-center px-4 py-3">
                                            {entry.exactScores > 0 && (
                                                <span className="bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full text-xs font-bold border border-yellow-500/20">
                                                    🎯 {entry.exactScores}
                                                </span>
                                            )}
                                            {entry.exactScores === 0 && <span className="text-dark-600">0</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
