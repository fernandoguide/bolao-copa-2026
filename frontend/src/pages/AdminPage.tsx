import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Match } from '../types';
import { useI18n } from '../i18n';
import { isValidScore } from '../utils/security';

const STAGE_LABELS: Record<string, string> = {
    group: '🏟️ Grupos',
    round_of_32: '⚔️ 16 avos',
    round_of_16: '⚔️ Oitavas',
    quarter_final: '🔥 Quartas',
    semi_final: '🏆 Semi',
    third_place: '🥉 3º Lugar',
    final: '🏆 Final',
};

function isKnockout(stage: string): boolean {
    return stage !== 'group';
}

export default function AdminPage() {
    const { t } = useI18n();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [scores, setScores] = useState<Record<number, { home: string; away: string; homePen: string; awayPen: string }>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadMatches();
    }, []);

    async function loadMatches() {
        try {
            const data = await api.get<Match[]>('/matches');
            setMatches(data);
            const initial: Record<number, { home: string; away: string; homePen: string; awayPen: string }> = {};
            for (const m of data) {
                initial[m.id] = {
                    home: m.homeScore !== null ? String(m.homeScore) : '',
                    away: m.awayScore !== null ? String(m.awayScore) : '',
                    homePen: m.homePenalty !== null ? String(m.homePenalty) : '',
                    awayPen: m.awayPenalty !== null ? String(m.awayPenalty) : '',
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
        const match = matches.find((m) => m.id === matchId);
        const score = scores[matchId];
        if (!score || score.home === '' || score.away === '') return;

        if (!isValidScore(score.home) || !isValidScore(score.away)) {
            setMessage({ type: 'error', text: 'Score inválido (0-99, números inteiros)' });
            return;
        }

        const homeScore = parseInt(score.home);
        const awayScore = parseInt(score.away);

        const knockout = match && isKnockout(match.stage);
        const isDraw = homeScore === awayScore;

        if (knockout && isDraw) {
            if (score.homePen === '' || score.awayPen === '') {
                setMessage({ type: 'error', text: t.adminPenaltyRequired });
                return;
            }
            if (!isValidScore(score.homePen) || !isValidScore(score.awayPen)) {
                setMessage({ type: 'error', text: 'Score de pênaltis inválido (0-99, números inteiros)' });
                return;
            }
            if (parseInt(score.homePen) === parseInt(score.awayPen)) {
                setMessage({ type: 'error', text: t.adminPenaltyNoDraw });
                return;
            }
        }

        setSaving(matchId);
        setMessage(null);
        try {
            const body: Record<string, number> = { homeScore, awayScore };
            if (knockout && isDraw) {
                body.homePenalty = parseInt(score.homePen);
                body.awayPenalty = parseInt(score.awayPen);
            }
            await api.patch(`/matches/${matchId}/result`, body);
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
                    {pendingMatches.map((match) => {
                        const score = scores[match.id];
                        const knockout = isKnockout(match.stage);
                        const isDraw = score && score.home !== '' && score.away !== '' && parseInt(score.home) === parseInt(score.away);
                        const showPenalty = knockout && isDraw;

                        return (
                            <div key={match.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-dark-400 mb-1">
                                                {new Date(match.matchDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                {' · '}
                                                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-dark-700 text-dark-300">
                                                    {STAGE_LABELS[match.stage] || match.stage}
                                                </span>
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
                                                value={score?.home || ''}
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
                                                value={score?.away || ''}
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

                                    {/* Penalty inputs - shown when knockout match is a draw */}
                                    {showPenalty && (
                                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                                            <p className="text-yellow-300 text-xs font-semibold mb-2">
                                                ⚽ {t.adminPenaltyLabel}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-dark-300 min-w-0 truncate">
                                                    {match.homeTeam?.name || '?'}
                                                </span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-14 bg-dark-700 border border-yellow-500/50 rounded-lg text-center text-yellow-300 py-1.5 text-sm"
                                                    value={score?.homePen || ''}
                                                    onChange={(e) =>
                                                        setScores((prev) => ({
                                                            ...prev,
                                                            [match.id]: { ...prev[match.id], homePen: e.target.value },
                                                        }))
                                                    }
                                                />
                                                <span className="text-yellow-400 text-sm font-bold">x</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-14 bg-dark-700 border border-yellow-500/50 rounded-lg text-center text-yellow-300 py-1.5 text-sm"
                                                    value={score?.awayPen || ''}
                                                    onChange={(e) =>
                                                        setScores((prev) => ({
                                                            ...prev,
                                                            [match.id]: { ...prev[match.id], awayPen: e.target.value },
                                                        }))
                                                    }
                                                />
                                                <span className="text-sm text-dark-300 min-w-0 truncate">
                                                    {match.awayTeam?.name || '?'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Already played */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white border-b border-dark-700 pb-2">
                    ✅ Jogos com Resultado ({playedMatches.length})
                </h2>

                <div className="grid gap-2">
                    {playedMatches.map((match) => {
                        const hasPenalty = match.homePenalty !== null && match.awayPenalty !== null;
                        return (
                            <div key={match.id} className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-3 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm text-white">
                                            {match.homeTeam?.name || '?'} {match.homeScore} x {match.awayScore} {match.awayTeam?.name || '?'}
                                        </span>
                                        {hasPenalty && (
                                            <span className="ml-2 text-xs text-yellow-400">
                                                (pen: {match.homePenalty} x {match.awayPenalty})
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-dark-500">
                                        {STAGE_LABELS[match.stage] || match.stage}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
