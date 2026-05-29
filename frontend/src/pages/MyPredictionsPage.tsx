import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Prediction } from '../types';

const stageLabels: Record<string, string> = {
    group: 'Fase de Grupos',
    round_of_32: 'Oitavas (32avos)',
    round_of_16: 'Oitavas de Final',
    quarter_final: 'Quartas de Final',
    semi_final: 'Semifinal',
    third_place: 'Disputa 3º Lugar',
    final: 'Final',
};

function pointsBadge(points: number) {
    if (points === 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (points === 7) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (points === 5) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-600 border-gray-300';
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

    if (loading) return <div className="text-center py-12">Carregando...</div>;

    const totalPoints = predictions.reduce((sum, p) => sum + p.points, 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Meus Palpites</h1>
                <div className="bg-primary-100 text-primary-800 px-4 py-2 rounded-lg font-bold">
                    Total: {totalPoints} pts
                </div>
            </div>

            {predictions.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Você ainda não fez nenhum palpite.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow-sm border">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Partida</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Seu Palpite</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Resultado</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Fase</th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Pontos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {predictions.map((pred) => (
                                <tr key={pred.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">
                                        <span className="font-medium">{pred.match.homeTeam.name}</span>
                                        {' vs '}
                                        <span className="font-medium">{pred.match.awayTeam.name}</span>
                                    </td>
                                    <td className="text-center px-4 py-3">
                                        <span className="font-bold text-primary-700">
                                            {pred.homeScore} × {pred.awayScore}
                                        </span>
                                    </td>
                                    <td className="text-center px-4 py-3">
                                        {pred.match.played ? (
                                            <span className="font-bold text-gray-700">
                                                {pred.match.homeScore} × {pred.match.awayScore}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Aguardando</span>
                                        )}
                                    </td>
                                    <td className="text-center px-4 py-3 text-xs text-gray-500">
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
                                            <span className="text-gray-300">—</span>
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
