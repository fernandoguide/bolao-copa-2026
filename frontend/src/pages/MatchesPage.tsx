import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Match } from '../types';

const stageLabels: Record<string, string> = {
    group: 'Fase de Grupos',
    round_of_32: 'Oitavas (32avos)',
    round_of_16: 'Oitavas de Final',
    quarter_final: 'Quartas de Final',
    semi_final: 'Semifinal',
    third_place: 'Disputa 3º Lugar',
    final: 'Final',
};

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [predictions, setPredictions] = useState<Record<number, { home: string; away: string }>>({});
    const [saving, setSaving] = useState<number | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        api.get<Match[]>('/matches').then((data) => {
            setMatches(data);
            setLoading(false);
        });
    }, []);

    function handleScoreChange(matchId: number, side: 'home' | 'away', value: string) {
        setPredictions((prev) => ({
            ...prev,
            [matchId]: {
                home: prev[matchId]?.home || '',
                away: prev[matchId]?.away || '',
                [side]: value,
            },
        }));
    }

    async function submitPrediction(matchId: number) {
        const pred = predictions[matchId];
        if (!pred || pred.home === '' || pred.away === '') return;

        setSaving(matchId);
        setMessage('');
        try {
            await api.post('/predictions', {
                matchId,
                homeScore: Number(pred.home),
                awayScore: Number(pred.away),
            });
            setMessage(`Palpite salvo!`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : 'Erro ao salvar');
        } finally {
            setSaving(null);
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    if (loading) return <div className="text-center py-12">Carregando jogos...</div>;

    const grouped = matches.reduce<Record<string, Match[]>>((acc, match) => {
        const key = match.stage;
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
    }, {});

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Jogos & Palpites</h1>

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">
                    {message}
                </div>
            )}

            {Object.entries(grouped).map(([stage, stageMatches]) => (
                <div key={stage} className="mb-8">
                    <h2 className="text-lg font-semibold text-primary-800 mb-3 border-b pb-2">
                        {stageLabels[stage] || stage}
                    </h2>

                    <div className="grid gap-3">
                        {stageMatches.map((match) => {
                            const isPast = new Date(match.matchDate) <= new Date() || match.played;
                            return (
                                <div
                                    key={match.id}
                                    className={`bg-white rounded-lg shadow-sm border p-4 ${match.played ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <span className="text-xs text-gray-500">{formatDate(match.matchDate)}</span>
                                        {match.played && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                Encerrado
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center gap-3 mt-2">
                                        <div className="flex-1 text-right">
                                            <span className="font-semibold text-gray-800">{match.homeTeam.name}</span>
                                            <span className="text-xs text-gray-400 ml-1">({match.homeTeam.code})</span>
                                        </div>

                                        {match.played ? (
                                            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
                                                <span className="text-xl font-bold text-gray-800">{match.homeScore}</span>
                                                <span className="text-gray-400 mx-1">×</span>
                                                <span className="text-xl font-bold text-gray-800">{match.awayScore}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="20"
                                                    value={predictions[match.id]?.home || ''}
                                                    onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                                    disabled={isPast}
                                                    className="w-12 text-center border border-gray-300 rounded-md py-1 text-lg font-bold focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100"
                                                />
                                                <span className="text-gray-400 mx-1">×</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="20"
                                                    value={predictions[match.id]?.away || ''}
                                                    onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                                    disabled={isPast}
                                                    className="w-12 text-center border border-gray-300 rounded-md py-1 text-lg font-bold focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <span className="text-xs text-gray-400 mr-1">({match.awayTeam.code})</span>
                                            <span className="font-semibold text-gray-800">{match.awayTeam.name}</span>
                                        </div>
                                    </div>

                                    {!isPast && (
                                        <div className="text-center mt-3">
                                            <button
                                                onClick={() => submitPrediction(match.id)}
                                                disabled={saving === match.id}
                                                className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-1.5 rounded-md transition-colors disabled:opacity-50"
                                            >
                                                {saving === match.id ? 'Salvando...' : 'Salvar Palpite'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {matches.length === 0 && (
                <p className="text-gray-500 text-center py-12">Nenhum jogo cadastrado ainda.</p>
            )}
        </div>
    );
}
