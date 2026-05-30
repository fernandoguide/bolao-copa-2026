import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Match } from '../types';
import { useI18n } from '../i18n';

export default function AdminPage() {
    const { t } = useI18n();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [scores, setScores] = useState<Record<number, { home: string; away: string }>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadMatches();
    }, []);

    async function loadMatches() {
        try {
            const data = await api.get<Match[]>('/matches');
            setMatches(data);
            const initial: Record<number, { home: string; away: string }> = {};
            for (const m of data) {
                initial[m.id] = {
                    home: m.homeScore !== null ? String(m.homeScore) : '',
                    away: m.awayScore !== null ? String(m.awayScore) : '',
                };
            }
            setScores(initial);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }

    async function saveResult(matchId: number) {
        const score = scores[matchId];
        if (!score || score.home === '' || score.away === '') return;

        setSaving(matchId);
        setMessage(null);
        try {
            await api.patch(`/matches/${matchId}/result`, {
                homeScore: parseInt(score.home),
                awayScore: parseInt(score.away),
            });
            setMessage({ type: 'success', text: `Resultado do jogo #${matchId} salvo!` });
            await loadMatches();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erro ao salvar resultado' });
        } finally {
            setSaving(null);
        }
    }

    if (loading) return <div className="text-center py-12 text-dark-400">{t.loading}</div>;

    const pendingMatches = matches.filter((m) => !m.played);
    const playedMatches = matches.filter((m) => m.played);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">⚙️ Painel Admin</h1>

            {message && (
                <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-900/30 border border-green-500/30 text-green-300' : 'bg-red-900/30 border border-red-500/30 text-red-300'}`}>
                    {message.text}
                </div>
            )}

            {/* Pending matches - set results */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white border-b border-dark-700 pb-2">
                    📝 Definir Resultados ({pendingMatches.length} jogos pendentes)
                </h2>

                {pendingMatches.length === 0 && (
                    <p className="text-dark-400 text-sm">Todos os jogos já têm resultado.</p>
                )}

                <div className="grid gap-3">
                    {pendingMatches.map((match) => (
                        <div key={match.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-dark-400 mb-1">
                                        {new Date(match.matchDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        {' · '}{match.stage}
                                    </div>
                                    <div className="font-medium text-white">
                                        {match.homeTeam?.name || match.matchLabel || '?'} vs {match.awayTeam?.name || '?'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-14 bg-dark-700 border border-dark-600 rounded-lg text-center text-white py-1.5 text-sm"
                                        value={scores[match.id]?.home || ''}
                                        onChange={(e) =>
                                            setScores((prev) => ({
                                                ...prev,
                                                [match.id]: { ...prev[match.id], home: e.target.value },
                                            }))
                                        }
                                    />
                                    <span className="text-dark-400 text-sm font-bold">x</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-14 bg-dark-700 border border-dark-600 rounded-lg text-center text-white py-1.5 text-sm"
                                        value={scores[match.id]?.away || ''}
                                        onChange={(e) =>
                                            setScores((prev) => ({
                                                ...prev,
                                                [match.id]: { ...prev[match.id], away: e.target.value },
                                            }))
                                        }
                                    />
                                    <button
                                        onClick={() => saveResult(match.id)}
                                        disabled={saving === match.id}
                                        className="ml-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-all"
                                    >
                                        {saving === match.id ? '...' : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Already played */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white border-b border-dark-700 pb-2">
                    ✅ Jogos com Resultado ({playedMatches.length})
                </h2>

                <div className="grid gap-2">
                    {playedMatches.map((match) => (
                        <div key={match.id} className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-3 flex items-center justify-between">
                            <div>
                                <span className="text-sm text-white">
                                    {match.homeTeam?.name || '?'} {match.homeScore} x {match.awayScore} {match.awayTeam?.name || '?'}
                                </span>
                            </div>
                            <span className="text-xs text-dark-500">{match.stage}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
