import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Prediction } from '../types';
import { getFlagUrl } from '../utils/flags';

const stageLabels: Record<string, string> = {
    group: 'Fase de Grupos',
    round_of_32: '32avos',
    round_of_16: 'Oitavas',
    quarter_final: 'Quartas',
    semi_final: 'Semifinal',
    third_place: '3º Lugar',
    final: 'Final',
};

function pointsBadge(points: number) {
    if (points === 10) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (points === 7) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (points === 5) return 'bg-green-500/20 text-green-400 border-green-500/30';
    return 'bg-dark-700 text-dark-400 border-dark-600';
}

export default function MyPredictionsPage() {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Prediction[]>('/predictions/my').then((data) => {
            setPredictions(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center py-12 text-dark-400">Carregando...</div>;

    const totalPoints = predictions.reduce((sum, p) => sum + p.points, 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">🎯 Meus Palpites</h1>
                <div className="bg-primary-600/20 text-primary-300 px-4 py-2 rounded-lg font-bold border border-primary-500/20">
                    Total: {totalPoints} pts
                </div>
            </div>

            {predictions.length === 0 ? (
                <p className="text-dark-500 text-center py-12">Você ainda não fez nenhum palpite.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                        <thead>
                            <tr className="bg-dark-900 border-b border-dark-700">
                                <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">Partida</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400">Seu Palpite</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400">Resultado</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400">Fase</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-dark-400">Pontos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {predictions.map((pred) => (
                                <tr key={pred.id} className="border-b border-dark-700 last:border-0 hover:bg-dark-700/50">
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            {pred.match.homeTeam?.code && (
                                                <img src={getFlagUrl(pred.match.homeTeam.code, 24)} alt="" className="w-5 h-3 object-cover rounded" />
                                            )}
                                            <span className="font-medium text-dark-200">{pred.match.homeTeam?.name || 'A definir'}</span>
                                            <span className="text-dark-500">vs</span>
                                            {pred.match.awayTeam?.code && (
                                                <img src={getFlagUrl(pred.match.awayTeam.code, 24)} alt="" className="w-5 h-3 object-cover rounded" />
                                            )}
                                            <span className="font-medium text-dark-200">{pred.match.awayTeam?.name || 'A definir'}</span>
                                        </div>
                                    </td>
                                    <td className="text-center px-4 py-3">
                                        <span className="font-bold text-primary-300">
                                            {pred.homeScore} × {pred.awayScore}
                                        </span>
                                    </td>
                                    <td className="text-center px-4 py-3">
                                        {pred.match.played ? (
                                            <span className="font-bold text-dark-200">
                                                {pred.match.homeScore} × {pred.match.awayScore}
                                            </span>
                                        ) : (
                                            <span className="text-dark-500 text-sm">Aguardando</span>
                                        )}
                                    </td>
                                    <td className="text-center px-4 py-3 text-xs text-dark-500">
                                        {stageLabels[pred.match.stage] || pred.match.stage}
                                    </td>
                                    <td className="text-center px-4 py-3">
                                        {pred.match.played ? (
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${pointsBadge(pred.points)}`}
                                            >
                                                {pred.points} pts
                                            </span>
                                        ) : (
                                            <span className="text-dark-600">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
