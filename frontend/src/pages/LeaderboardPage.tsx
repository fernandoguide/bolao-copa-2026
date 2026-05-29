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

    if (loading) return <div className="text-center py-12">Carregando classificação...</div>;

    function getMedal(pos: number) {
        if (pos === 0) return '🥇';
        if (pos === 1) return '🥈';
        if (pos === 2) return '🥉';
        return `${pos + 1}º`;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Classificação Geral</h1>

            {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Nenhum palpite registrado ainda.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow-sm border">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-16">#</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Participante</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Pontos</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Palpites</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Placares Exatos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry, index) => {
                                const isMe = entry.userId === user?.id;
                                return (
                                    <tr
                                        key={entry.userId}
                                        className={`border-b last:border-0 ${isMe ? 'bg-primary-50 font-semibold' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <td className="text-center px-4 py-3 text-lg">
                                            {getMedal(index)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={isMe ? 'text-primary-700' : 'text-gray-800'}>
                                                {entry.name}
                                                {isMe && <span className="text-xs ml-2 text-primary-500">(você)</span>}
                                            </span>
                                        </td>
                                        <td className="text-center px-4 py-3">
                                            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-bold text-sm">
                                                {entry.totalPoints}
                                            </span>
                                        </td>
                                        <td className="text-center px-4 py-3 text-gray-600">
                                            {entry.totalPredictions}
                                        </td>
                                        <td className="text-center px-4 py-3">
                                            {entry.exactScores > 0 && (
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                    🎯 {entry.exactScores}
                                                </span>
                                            )}
                                            {entry.exactScores === 0 && <span className="text-gray-400">0</span>}
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
