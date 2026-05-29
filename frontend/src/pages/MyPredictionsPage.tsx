import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Prediction } from '../types';
import { getFlagUrl } from '../utils/flags';
import { useI18n } from '../i18n';

function pointsBadge(points: number) {
    if (points === 10) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (points === 7) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (points === 5) return 'bg-green-500/20 text-green-400 border-green-500/30';
    return 'bg-dark-700 text-dark-400 border-dark-600';
}

interface GroupedUser {
    userId: string;
    name: string;
    predictions: Prediction[];
    totalPoints: number;
}

export default function MyPredictionsPage() {
    const { t } = useI18n();
    const [groups, setGroups] = useState<GroupedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    const stageLabels: Record<string, string> = {
        group: t.stageGroup,
        round_of_32: t.stageRoundOf32,
        round_of_16: t.stageRoundOf16,
        quarter_final: t.stageQuarterFinal,
        semi_final: t.stageSemiFinal,
        third_place: t.stageThirdPlace,
        final: t.stageFinal,
    };

    useEffect(() => {
        api.get<Prediction[]>('/predictions/all').then((data) => {
            const map = new Map<string, GroupedUser>();
            for (const pred of data) {
                const userId = pred.user?.id || 'unknown';
                const name = pred.user?.name || t.predictionsUnknown;
                if (!map.has(userId)) {
                    map.set(userId, { userId, name, predictions: [], totalPoints: 0 });
                }
                const group = map.get(userId)!;
                group.predictions.push(pred);
                group.totalPoints += pred.points;
            }
            const sorted = Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints);
            setGroups(sorted);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center py-12 text-dark-400">{t.predictionsLoading}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">{t.predictionsTitle}</h1>

            {groups.length === 0 ? (
                <p className="text-dark-500 text-center py-12">{t.predictionsEmpty}</p>
            ) : (
                <div className="space-y-3">
                    {groups.map((group) => (
                        <div key={group.userId} className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                            <button
                                onClick={() => setExpandedUser(expandedUser === group.userId ? null : group.userId)}
                                className="w-full flex items-center justify-between px-5 py-4 hover:bg-dark-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-primary-600/20 rounded-full flex items-center justify-center text-primary-300 font-bold text-sm">
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-white">{group.name}</span>
                                    <span className="text-dark-500 text-sm">({group.predictions.length} {t.predictionsPredictions})</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="bg-primary-600/20 text-primary-300 px-3 py-1 rounded-lg text-sm font-bold border border-primary-500/20">
                                        {group.totalPoints} pts
                                    </span>
                                    <span className={`text-dark-400 transition-transform ${expandedUser === group.userId ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            </button>

                            {expandedUser === group.userId && (
                                <div className="border-t border-dark-700">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-dark-900/50">
                                                <th className="text-left px-4 py-2 text-xs font-medium text-dark-400">{t.predictionsMatch}</th>
                                                <th className="text-center px-4 py-2 text-xs font-medium text-dark-400">{t.predictionsPrediction}</th>
                                                <th className="text-center px-4 py-2 text-xs font-medium text-dark-400">{t.predictionsResult}</th>
                                                <th className="text-center px-4 py-2 text-xs font-medium text-dark-400">{t.predictionsStage}</th>
                                                <th className="text-center px-4 py-2 text-xs font-medium text-dark-400">{t.predictionsPoints}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.predictions.map((pred) => (
                                                <tr key={pred.id} className="border-b border-dark-700/50 last:border-0 hover:bg-dark-700/30">
                                                    <td className="px-4 py-2.5 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            {pred.match.homeTeam?.code && (
                                                                <img src={getFlagUrl(pred.match.homeTeam.code, 24)} alt="" className="w-5 h-3 object-cover rounded" />
                                                            )}
                                                            <span className="font-medium text-dark-200">{pred.match.homeTeam?.name || t.matchesToDefine}</span>
                                                            <span className="text-dark-500">×</span>
                                                            {pred.match.awayTeam?.code && (
                                                                <img src={getFlagUrl(pred.match.awayTeam.code, 24)} alt="" className="w-5 h-3 object-cover rounded" />
                                                            )}
                                                            <span className="font-medium text-dark-200">{pred.match.awayTeam?.name || t.matchesToDefine}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center px-4 py-2.5">
                                                        <span className="font-bold text-primary-300">
                                                            {pred.homeScore} × {pred.awayScore}
                                                        </span>
                                                    </td>
                                                    <td className="text-center px-4 py-2.5">
                                                        {pred.match.played ? (
                                                            <span className="font-bold text-dark-200">
                                                                {pred.match.homeScore} × {pred.match.awayScore}
                                                            </span>
                                                        ) : (
                                                            <span className="text-dark-500 text-xs">{t.predictionsWaiting}</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center px-4 py-2.5 text-xs text-dark-500">
                                                        {stageLabels[pred.match.stage] || pred.match.stage}
                                                    </td>
                                                    <td className="text-center px-4 py-2.5">
                                                        {pred.match.played ? (
                                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${pointsBadge(pred.points)}`}>
                                                                {pred.points}
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
                    ))}
                </div>
            )}
        </div>
    );
}
