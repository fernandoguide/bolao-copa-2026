import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function RulesPage() {
    const { t } = useI18n();

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-white">{t.rulesTitle}</h1>
                <Link
                    to="/jogos"
                    className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/20"
                >
                    {t.rulesGoToMatches}
                </Link>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 space-y-6">
                {/* Como funciona */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                        {t.rulesHowItWorks}
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-dark-300">
                        {t.rulesHowItWorksItems.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ul>
                </section>

                {/* Pontuação */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                        {t.rulesScoringTitle}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full rounded-lg overflow-hidden border border-dark-600">
                            <thead>
                                <tr className="bg-dark-900">
                                    <th className="text-left px-4 py-3 font-medium text-dark-300">{t.rulesResult}</th>
                                    <th className="text-center px-4 py-3 font-medium text-dark-300">{t.rulesPoints}</th>
                                    <th className="text-left px-4 py-3 font-medium text-dark-300">{t.rulesExample}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700">
                                <tr className="bg-yellow-900/10">
                                    <td className="px-4 py-3 font-medium text-yellow-400">{t.rulesScoringExactScore}</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-bold border border-yellow-500/30">10</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-dark-400">{t.rulesScoringExampleExact}</td>
                                </tr>
                                <tr className="bg-blue-900/10">
                                    <td className="px-4 py-3 font-medium text-blue-400">{t.rulesScoringWinnerAndDiff}</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold border border-blue-500/30">7</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-dark-400">{t.rulesScoringExampleDiff}</td>
                                </tr>
                                <tr className="bg-green-900/10">
                                    <td className="px-4 py-3 font-medium text-green-400">{t.rulesScoringCorrectWinner}</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold border border-green-500/30">5</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-dark-400">{t.rulesScoringExampleWinner}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-dark-500">{t.rulesScoringMissed}</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-dark-700 text-dark-400 px-3 py-1 rounded-full font-bold border border-dark-600">0</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-dark-400">{t.rulesScoringExampleMissed}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Detalhamento */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                        {t.rulesDetailTitle}
                    </h2>
                    <div className="bg-dark-900 rounded-lg p-4 space-y-3 text-sm text-dark-300 border border-dark-700">
                        <p dangerouslySetInnerHTML={{ __html: `<strong class="text-yellow-400">${t.rulesDetailExact}</strong>` }} />
                        <p dangerouslySetInnerHTML={{ __html: `<strong class="text-blue-400">${t.rulesDetailWinnerDiff}</strong>` }} />
                        <p dangerouslySetInnerHTML={{ __html: `<strong class="text-green-400">${t.rulesDetailWinner}</strong>` }} />
                        <p dangerouslySetInnerHTML={{ __html: `<strong class="text-dark-400">${t.rulesDetailMissed}</strong>` }} />
                    </div>
                </section>

                {/* Fases */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                        {t.rulesPhasesTitle}
                    </h2>
                    <ul className="list-disc list-inside space-y-1 text-dark-300">
                        {t.rulesPhasesItems.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ul>
                    <p className="text-sm text-dark-500 mt-2">{t.rulesPhasesNote}</p>
                </section>

                {/* Regras gerais */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                        {t.rulesGeneralTitle}
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-dark-300">
                        {t.rulesGeneralItems.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
