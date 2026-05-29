export default function RulesPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Regras do Bolão</h1>

            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                {/* Como funciona */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-800 mb-3 flex items-center gap-2">
                        📋 Como funciona
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Cada participante palpita o placar de todas as partidas da Copa do Mundo 2026.</li>
                        <li>Os palpites devem ser feitos <strong>antes do início de cada partida</strong>.</li>
                        <li>Após o fim de cada jogo, os pontos são calculados automaticamente.</li>
                        <li>Você pode alterar seu palpite quantas vezes quiser antes do jogo começar.</li>
                    </ul>
                </section>

                {/* Pontuação */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-800 mb-3 flex items-center gap-2">
                        🏆 Sistema de Pontuação
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-primary-50">
                                    <th className="text-left px-4 py-3 font-medium text-primary-800">Resultado</th>
                                    <th className="text-center px-4 py-3 font-medium text-primary-800">Pontos</th>
                                    <th className="text-left px-4 py-3 font-medium text-primary-800">Exemplo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr className="bg-yellow-50">
                                    <td className="px-4 py-3 font-medium text-yellow-800">Placar exato</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full font-bold">10</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        Palpite: 2×1 — Real: 2×1
                                    </td>
                                </tr>
                                <tr className="bg-blue-50">
                                    <td className="px-4 py-3 font-medium text-blue-800">Vencedor + saldo de gols correto</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full font-bold">7</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        Palpite: 3×1 — Real: 2×0 (ambos +2)
                                    </td>
                                </tr>
                                <tr className="bg-green-50">
                                    <td className="px-4 py-3 font-medium text-green-800">Apenas vencedor correto</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full font-bold">5</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        Palpite: 1×0 — Real: 3×2 (ambos mandante)
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-600">Errou</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold">0</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        Palpite: 2×0 — Real: 0×1
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Detalhamento */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-800 mb-3 flex items-center gap-2">
                        📐 Detalhamento das Regras
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm text-gray-700">
                        <p>
                            <strong>Placar exato (10 pts):</strong> Você acertou exatamente o número de gols de ambas as equipes.
                        </p>
                        <p>
                            <strong>Vencedor + saldo correto (7 pts):</strong> Você acertou quem venceu (ou empate) E a diferença
                            de gols é a mesma, mas os placares não são idênticos.
                        </p>
                        <p>
                            <strong>Vencedor correto (5 pts):</strong> Você acertou quem venceu (ou que empatou), mas a diferença
                            de gols está errada.
                        </p>
                        <p>
                            <strong>Errou (0 pts):</strong> Você errou o resultado — apontou vencedor diferente ou palpitou empate
                            quando houve vencedor (e vice-versa).
                        </p>
                    </div>
                </section>

                {/* Fases */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-800 mb-3 flex items-center gap-2">
                        📅 Fases da Copa 2026
                    </h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li><strong>Fase de Grupos:</strong> 48 seleções divididas em 12 grupos de 4.</li>
                        <li><strong>Oitavas de Final (32 avos):</strong> Classificados avançam para o mata-mata.</li>
                        <li><strong>Oitavas, Quartas, Semifinais, Final.</strong></li>
                    </ul>
                    <p className="text-sm text-gray-500 mt-2">
                        Todos os jogos de todas as fases valem palpite. A pontuação é a mesma independente da fase.
                    </p>
                </section>

                {/* Regras gerais */}
                <section>
                    <h2 className="text-lg font-semibold text-primary-800 mb-3 flex items-center gap-2">
                        ⚠️ Regras Gerais
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>O palpite deve ser enviado <strong>antes do horário de início</strong> da partida.</li>
                        <li>Após o início, o palpite é bloqueado e não pode mais ser alterado.</li>
                        <li>Em caso de empate na classificação, o critério de desempate é o número de placares exatos.</li>
                        <li>O resultado considerado é o do tempo regulamentar (90 min + acréscimos). Prorrogação e pênaltis não alteram o placar para fins de pontuação.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
