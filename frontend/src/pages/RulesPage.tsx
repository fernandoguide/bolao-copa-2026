import { Link } from 'react-router-dom';

export default function RulesPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-white">📋 Regras do Bolão</h1>
                <Link
                    to="/jogos"
                    className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/20"
                >
                    ⚽ Ir para os Jogos
                </Link>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 space-y-6">
                {/* Como funciona */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                        📋 Como funciona
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-dark-300">
                        <li>Cada participante palpita o placar de todas as partidas da Copa do Mundo 2026.</li>
                        <li>Os palpites devem ser feitos <strong className="text-white">antes do início de cada partida</strong>.</li>
                        <li>Após o fim de cada jogo, os pontos são calculados automaticamente.</li>
                        <li>Você pode alterar seu palpite quantas vezes quiser antes do jogo começar.</li>
                    </ul>
                </section>

                {/* Pontuação */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                        🏆 Sistema de Pontuação
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full rounded-lg overflow-hidden border border-dark-600">
                            <thead>
                                <tr className="bg-dark-900">
                                    <th className="text-left px-4 py-3 font-medium text-dark-300">Resultado</th>
                                    <th className="text-center px-4 py-3 font-medium text-dark-300">Pontos</th>
                                    <th className="text-left px-4 py-3 font-medium text-dark-300">Exemplo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700">
                                <tr className="bg-yellow-900/10">
                                    <td className="px-4 py-3 font-medium text-yellow-400">Placar exato</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-bold border border-yellow-500/30">10</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-dark-400">
                                        Palpite: 2×1 — Real: 2×1
                                    </td>
                                </tr>
                                <tr className="bg-blue-900/10">
                                    <td className="px-4 py-3 font-medium text-blue-400">Vencedor + saldo correto</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold border border-blue-500/30">7</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-dark-400">
                                        Palpite: 3×1 — Real: 2×0 (ambos +2)
                                    </td>
                                </tr>
                                <tr className="bg-green-900/10">
                                    <td className="px-4 py-3 font-medium text-green-400">Apenas vencedor correto</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold border border-green-500/30">5</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-dark-400">
                                        Palpite: 1×0 — Real: 3×2 (ambos mandante)
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-dark-500">Errou</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-dark-700 text-dark-400 px-3 py-1 rounded-full font-bold border border-dark-600">0</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-dark-400">
                                        Palpite: 2×0 — Real: 0×1
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Detalhamento */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                        📐 Detalhamento das Regras
                    </h2>
                    <div className="bg-dark-900 rounded-lg p-4 space-y-3 text-sm text-dark-300 border border-dark-700">
                        <p>
                            <strong className="text-yellow-400">Placar exato (10 pts):</strong> Você acertou exatamente o número de gols de ambas as equipes.
                        </p>
                        <p>
                            <strong className="text-blue-400">Vencedor + saldo correto (7 pts):</strong> Você acertou quem venceu (ou empate) E a diferença
                            de gols é a mesma, mas os placares não são idênticos.
                        </p>
                        <p>
                            <strong className="text-green-400">Vencedor correto (5 pts):</strong> Você acertou quem venceu (ou que empatou), mas a diferença
                            de gols está errada.
                        </p>
                        <p>
                            <strong className="text-dark-400">Errou (0 pts):</strong> Você errou o resultado — apontou vencedor diferente ou palpitou empate
                            quando houve vencedor (e vice-versa).
                        </p>
                    </div>
                </section>

                {/* Fases */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                        📅 Fases da Copa 2026
                    </h2>
                    <ul className="list-disc list-inside space-y-1 text-dark-300">
                        <li><strong className="text-white">Fase de Grupos:</strong> 48 seleções divididas em 12 grupos de 4.</li>
                        <li><strong className="text-white">Oitavas de Final (32 avos):</strong> Classificados avançam para o mata-mata.</li>
                        <li><strong className="text-white">Oitavas, Quartas, Semifinais, Final.</strong></li>
                    </ul>
                    <p className="text-sm text-dark-500 mt-2">
                        Todos os jogos de todas as fases valem palpite. A pontuação é a mesma independente da fase.
                    </p>
                </section>

                {/* Regras gerais */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-300 mb-3 flex items-center gap-2">
                        ⚠️ Regras Gerais
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-dark-300">
                        <li>O palpite deve ser enviado <strong className="text-white">antes do horário de início</strong> da partida.</li>
                        <li>Após o início, o palpite é bloqueado e não pode mais ser alterado.</li>
                        <li>Em caso de empate na classificação, o critério de desempate é o número de placares exatos.</li>
                        <li>O resultado considerado é o do tempo regulamentar (90 min + acréscimos). Prorrogação e pênaltis não alteram o placar para fins de pontuação.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
