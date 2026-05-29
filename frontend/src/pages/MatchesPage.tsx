import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Match, Prediction } from '../types';
import { getFlagUrl } from '../utils/flags';

const stageLabels: Record<string, string> = {
    group: '🏟️ Fase de Grupos',
    round_of_32: '⚔️ 32avos de Final',
    round_of_16: '⚔️ Oitavas de Final',
    quarter_final: '🔥 Quartas de Final',
    semi_final: '🏆 Semifinal',
    third_place: '🥉 Disputa 3º Lugar',
    final: '🏆 Final',
};

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [predictions, setPredictions] = useState<Record<number, { home: string; away: string }>>({});
    const [saving, setSaving] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [toast, setToast] = useState('');
    const [currentWeek, setCurrentWeek] = useState(0);

    useEffect(() => {
        Promise.all([
            api.get<Match[]>('/matches'),
            api.get<Prediction[]>('/predictions/my'),
        ]).then(([matchesData, predictionsData]) => {
            setMatches(matchesData);
            // Pre-fill inputs with existing predictions
            const predMap: Record<number, { home: string; away: string }> = {};
            for (const p of predictionsData) {
                predMap[p.match.id] = {
                    home: String(p.homeScore),
                    away: String(p.awayScore),
                };
            }
            setPredictions(predMap);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    function handleScoreChange(matchId: number, side: 'home' | 'away', value: string) {
        const num = Number(value);
        if (value !== '' && (num < 0 || num > 99)) {
            setToast('⚠️ Placar deve ser entre 0 e 99');
            setTimeout(() => setToast(''), 3000);
            return;
        }
        setPredictions((prev) => ({
            ...prev,
            [matchId]: {
                home: prev[matchId]?.home || '',
                away: prev[matchId]?.away || '',
                [side]: value,
            },
        }));

        // Auto-save when both scores are filled
        const current = predictions[matchId] || { home: '', away: '' };
        const updated = { ...current, [side]: value };
        if (updated.home !== '' && updated.away !== '') {
            autoSave(matchId, updated.home, updated.away);
        }
    }

    async function autoSave(matchId: number, home: string, away: string) {
        setSaving(matchId);
        setMessage('');
        try {
            await api.post('/predictions', {
                matchId,
                homeScore: Number(home),
                awayScore: Number(away),
            });
            setMessage('✓ Palpite salvo!');
            setTimeout(() => setMessage(''), 2500);
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : 'Erro ao salvar');
        } finally {
            setSaving(null);
        }
    }

    if (loading) return <div className="text-center py-12 text-dark-400">Carregando jogos...</div>;

    // Group matches by week
    const sortedMatches = [...matches].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
    const firstDate = sortedMatches.length > 0 ? new Date(sortedMatches[0].matchDate) : new Date();
    const weekStart = new Date(firstDate);
    weekStart.setHours(0, 0, 0, 0);
    // Align to Monday
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));

    const weeks: { start: Date; end: Date; matches: Match[] }[] = [];
    for (const match of sortedMatches) {
        const matchTime = new Date(match.matchDate).getTime();
        const weeksSinceStart = Math.floor((matchTime - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (!weeks[weeksSinceStart]) {
            const wStart = new Date(weekStart.getTime() + weeksSinceStart * 7 * 24 * 60 * 60 * 1000);
            const wEnd = new Date(wStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            weeks[weeksSinceStart] = { start: wStart, end: wEnd, matches: [] };
        }
        weeks[weeksSinceStart].matches.push(match);
    }
    // Filter out empty slots
    const filledWeeks = weeks.filter(Boolean);
    const totalWeeks = filledWeeks.length;
    const safeWeek = Math.min(currentWeek, totalWeeks - 1);
    const weekData = filledWeeks[safeWeek];

    const formatWeekRange = (start: Date, end: Date) => {
        const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return `${fmt(start)} — ${fmt(end)}`;
    };

    // Group current week's matches by day
    const weekMatches = weekData?.matches || [];
    const groupedByDay = weekMatches.reduce<Record<string, Match[]>>((acc, match) => {
        const key = new Date(match.matchDate).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
        });
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
    }, {});

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Jogos & Palpites</h1>

            {/* Week pagination */}
            {totalWeeks > 0 && (
                <div className="flex items-center justify-between mb-6 bg-dark-800/95 backdrop-blur-md rounded-xl border border-dark-700 p-3 sticky top-[60px] z-40">
                    <button
                        onClick={() => setCurrentWeek(Math.max(0, safeWeek - 1))}
                        disabled={safeWeek === 0}
                        className="px-3 py-1.5 rounded-lg bg-dark-700 text-dark-200 text-sm font-medium hover:bg-dark-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Anterior
                    </button>
                    <div className="text-center">
                        <span className="text-white font-semibold text-sm sm:text-base">
                            Semana {safeWeek + 1} de {totalWeeks}
                        </span>
                        {weekData && (
                            <p className="text-xs text-dark-400 mt-0.5">
                                {formatWeekRange(weekData.start, weekData.end)} • {weekMatches.length} {weekMatches.length === 1 ? 'jogo' : 'jogos'}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setCurrentWeek(Math.min(totalWeeks - 1, safeWeek + 1))}
                        disabled={safeWeek >= totalWeeks - 1}
                        className="px-3 py-1.5 rounded-lg bg-dark-700 text-dark-200 text-sm font-medium hover:bg-dark-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Próxima →
                    </button>
                </div>
            )}

            {/* Toast notification */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-red-900/90 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl shadow-2xl text-sm animate-pulse">
                    {toast}
                </div>
            )}

            {message && (
                <div className="fixed bottom-4 right-4 z-50 bg-green-900/90 border border-green-500/40 text-green-300 px-4 py-2.5 rounded-xl shadow-2xl text-sm">
                    {message}
                </div>
            )}

            {Object.entries(groupedByDay).map(([dayLabel, dayMatches]) => (
                <div key={dayLabel} className="mb-6">
                    <h2 className="text-base font-semibold text-primary-300 mb-3 border-b border-dark-700 pb-2 capitalize">
                        📅 {dayLabel}
                    </h2>

                    <div className="grid gap-3">
                        {dayMatches.map((match) => {
                            const matchStart = new Date(match.matchDate).getTime();
                            const now = Date.now();
                            const isLocked = now >= matchStart || match.played;
                            return (
                                <div
                                    key={match.id}
                                    className={`bg-dark-800 rounded-xl border p-4 transition-all hover:border-primary-500/30 ${match.played
                                        ? 'border-green-500/20'
                                        : 'border-dark-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-dark-400">🕐 {new Date(match.matchDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="text-xs bg-dark-700 text-dark-300 px-1.5 py-0.5 rounded">
                                                {stageLabels[match.stage] || match.stage}
                                            </span>
                                        </div>
                                        {match.played && (
                                            <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-medium border border-green-500/20">
                                                ✓ Encerrado
                                            </span>
                                        )}
                                        {!match.played && isLocked && (
                                            <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full font-medium border border-yellow-500/20">
                                                🔒 Bloqueado
                                            </span>
                                        )}
                                        {saving === match.id && (
                                            <span className="text-xs text-primary-400 animate-pulse">Salvando...</span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center gap-4 mt-3">
                                        {/* Home Team */}
                                        <div className="flex-1 flex items-center justify-end gap-2">
                                            <span className="font-semibold text-dark-100 text-sm sm:text-base">
                                                {match.homeTeam?.name || 'A definir'}
                                            </span>
                                            {match.homeTeam?.code ? (
                                                <img
                                                    src={getFlagUrl(match.homeTeam.code)}
                                                    alt={match.homeTeam.code}
                                                    className="w-8 h-5 object-cover rounded shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-8 h-5 bg-dark-700 rounded flex items-center justify-center text-xs text-dark-500">?</div>
                                            )}
                                        </div>

                                        {/* Score / Input */}
                                        {match.played ? (
                                            <div className="flex items-center gap-2 bg-dark-900 px-4 py-2 rounded-xl border border-dark-600">
                                                <span className="text-xl font-bold text-white">{match.homeScore}</span>
                                                <span className="text-dark-500 mx-1">×</span>
                                                <span className="text-xl font-bold text-white">{match.awayScore}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-0 bg-dark-900/80 rounded-xl border border-dark-600 overflow-hidden">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={2}
                                                    value={predictions[match.id]?.home || ''}
                                                    onChange={(e) => {
                                                        const v = e.target.value.replace(/[^0-9]/g, '');
                                                        handleScoreChange(match.id, 'home', v);
                                                    }}
                                                    disabled={isLocked}
                                                    placeholder="-"
                                                    className="w-10 h-10 text-center bg-transparent text-lg font-bold text-white outline-none placeholder-dark-600 disabled:opacity-30"
                                                />
                                                <span className="text-dark-500 font-bold px-1">×</span>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={2}
                                                    value={predictions[match.id]?.away || ''}
                                                    onChange={(e) => {
                                                        const v = e.target.value.replace(/[^0-9]/g, '');
                                                        handleScoreChange(match.id, 'away', v);
                                                    }}
                                                    disabled={isLocked}
                                                    placeholder="-"
                                                    className="w-10 h-10 text-center bg-transparent text-lg font-bold text-white outline-none placeholder-dark-600 disabled:opacity-30"
                                                />
                                            </div>
                                        )}

                                        {/* Away Team */}
                                        <div className="flex-1 flex items-center gap-2">
                                            {match.awayTeam?.code ? (
                                                <img
                                                    src={getFlagUrl(match.awayTeam.code)}
                                                    alt={match.awayTeam.code}
                                                    className="w-8 h-5 object-cover rounded shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-8 h-5 bg-dark-700 rounded flex items-center justify-center text-xs text-dark-500">?</div>
                                            )}
                                            <span className="font-semibold text-dark-100 text-sm sm:text-base">
                                                {match.awayTeam?.name || 'A definir'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {matches.length === 0 && (
                <p className="text-dark-500 text-center py-12">Nenhum jogo cadastrado ainda.</p>
            )}

            {/* Week quick nav dots */}
            {totalWeeks > 1 && (
                <div className="flex justify-center gap-1.5 mt-6">
                    {filledWeeks.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentWeek(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${i === safeWeek ? 'bg-primary-500' : 'bg-dark-600 hover:bg-dark-500'}`}
                            title={`Semana ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
