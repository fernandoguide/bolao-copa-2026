import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LeaderboardEntry } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<LeaderboardEntry[]>('/leaderboard').then((data) => {
            setLeaderboard(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center py-12 text-dark-400">Carregando classificação...</div>;

    function getMedal(pos: number) {
        if (pos === 0) return '🥇';
        if (pos === 1) return '🥈';
        if (pos === 2) return '🥉';
        return `${pos + 1}º`;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">🏆 Classificação Geral</h1>

            {leaderboard.length === 0 ? (
                <p className="text-dark-500 text-center py-12">Nenhum palpite registrado ainda.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                        <thead>
                            <tr className="bg-dark-900 border-b border-dark-700">
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400 w-16">#</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Participante</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400">Pontos</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400">Palpites</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400">Placares Exatos</th>
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
                                                {isMe && <span className="text-xs ml-2 text-primary-500">(você)</span>}
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
