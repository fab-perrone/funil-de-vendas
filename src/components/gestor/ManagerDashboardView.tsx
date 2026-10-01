import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpRight,
  Filter,
  BarChart3,
  Layers,
  PhoneCall,
  Download,
} from 'lucide-react';
import { Deal, Seller, Task, ActivityLog, FunnelStage } from '../../types/crm';

interface ManagerDashboardViewProps {
  deals: Deal[];
  sellers: Seller[];
  tasks: Task[];
  logs: ActivityLog[];
  onNavigateToSeller: (sellerId: string) => void;
}

const STAGE_ORDER: { stage: FunnelStage; label: string; color: string }[] = [
  { stage: 'prospeccao', label: 'Prospecção', color: 'bg-sky-500' },
  { stage: 'qualificacao', label: 'Qualificação', color: 'bg-amber-500' },
  { stage: 'proposta', label: 'Proposta', color: 'bg-purple-500' },
  { stage: 'negociacao', label: 'Negociação', color: 'bg-indigo-500' },
  { stage: 'ganho', label: 'Fechado Ganho', color: 'bg-emerald-500' },
];

export const ManagerDashboardView: React.FC<ManagerDashboardViewProps> = ({
  deals,
  sellers,
  tasks,
  logs,
  onNavigateToSeller,
}) => {
  const [period, setPeriod] = useState<'mes' | 'geral'>('mes');

  // Calculations
  const wonDeals = deals.filter((d) => d.stage === 'ganho');
  const lostDeals = deals.filter((d) => d.stage === 'perdido');
  const activeDeals = deals.filter((d) => d.stage !== 'ganho' && d.stage !== 'perdido');

  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const totalWonRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  const completedDealsCount = wonDeals.length + lostDeals.length;
  const teamConversionRate =
    completedDealsCount > 0 ? Math.round((wonDeals.length / completedDealsCount) * 100) : 0;

  const averageTicket = wonDeals.length > 0 ? Math.round(totalWonRevenue / wonDeals.length) : 0;
  const totalTasksCompleted = tasks.filter((t) => t.completed).length;

  // Funnel drop-off analysis
  const maxStageCount = Math.max(...STAGE_ORDER.map((s) => deals.filter((d) => d.stage === s.stage).length), 1);

  // Sellers Performance Ranking
  const sellerRankings = sellers.map((seller) => {
    const sellerDeals = deals.filter((d) => d.sellerId === seller.id);
    const sellerWon = sellerDeals.filter((d) => d.stage === 'ganho');
    const sellerLost = sellerDeals.filter((d) => d.stage === 'perdido');
    const sellerWonRevenue = sellerWon.reduce((sum, d) => sum + d.value, 0);
    const sellerFinished = sellerWon.length + sellerLost.length;
    const sellerConversion =
      sellerFinished > 0 ? Math.round((sellerWon.length / sellerFinished) * 100) : 0;
    const targetProgress =
      seller.monthlyTarget > 0 ? Math.min(Math.round((sellerWonRevenue / seller.monthlyTarget) * 100), 200) : 0;
    const pendingTasks = tasks.filter((t) => t.sellerId === seller.id && !t.completed).length;

    return {
      seller,
      wonRevenue: sellerWonRevenue,
      targetProgress,
      wonCount: sellerWon.length,
      activeCount: sellerDeals.filter((d) => d.stage !== 'ganho' && d.stage !== 'perdido').length,
      conversion: sellerConversion,
      pendingTasks,
    };
  }).sort((a, b) => b.wonRevenue - a.wonRevenue);

  const exportSummaryCsv = () => {
    const rows = [
      ['Vendedor', 'Meta Mensal (R$)', 'Total Vendido (R$)', 'Progresso (%)', 'Negócios Ganhos', 'Taxa Conversão (%)'],
      ...sellerRankings.map((r) => [
        r.seller.name,
        r.seller.monthlyTarget.toString(),
        r.wonRevenue.toString(),
        r.targetProgress.toString(),
        r.wonCount.toString(),
        r.conversion.toString(),
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_desempenho_vendas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">Dashboard de Resultados da Equipe</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Métricas consolidadas de conversão, atingimento de metas e produtividade comercial
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportSummaryCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Exportar Relatório CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Receita Fechada */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Receita Fechada</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900">
            R$ {totalWonRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{wonDeals.length} contratos assinados</span>
          </div>
        </div>

        {/* Pipeline Ativo */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Pipeline em Aberto</span>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900">
            R$ {totalPipelineValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-500 font-medium">
            {activeDeals.length} oportunidades em andamento
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Taxa de Conversão</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900">
            {teamConversionRate}%
          </div>
          <div className="text-[11px] text-neutral-500 font-medium">
            Proporção de negócios ganhos
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Ticket Médio</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900">
            R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-500 font-medium">
            Média por venda concretizada
          </div>
        </div>

        {/* Tarefas Concluídas */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Produtividade da Equipe</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900">
            {totalTasksCompleted}
          </div>
          <div className="text-[11px] text-neutral-500 font-medium">
            Tarefas e contatos realizados
          </div>
        </div>
      </div>

      {/* Main Grid: Funnel Dropoff & Team Performance Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Funnel Conversion Visualizer */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-bold text-neutral-900">Eficiência por Etapa do Funil</h3>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Taxa de Passagem</span>
          </div>

          <div className="space-y-3.5">
            {STAGE_ORDER.map((stageItem) => {
              const stageDeals = deals.filter((d) => d.stage === stageItem.stage);
              const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
              const percentage = Math.max(Math.round((stageDeals.length / maxStageCount) * 100), 8);

              return (
                <div key={stageItem.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800">{stageItem.label}</span>
                    <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
                      <span className="text-neutral-500">{stageDeals.length} negócios</span>
                      <span className="font-semibold text-neutral-900">
                        R$ {stageValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stageItem.color} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 text-[11px] text-neutral-600 space-y-1">
            <span className="font-semibold text-neutral-800 block">Diagnóstico de Gargalos:</span>
            <span>
              A maior concentração de valor está nas etapas de Proposta e Negociação. Incentive a equipe a atualizar o
              número de telefone dos clientes para acelerar follow-ups via ligação e WhatsApp.
            </span>
          </div>
        </div>

        {/* Right: Team Performance Ranking Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-bold text-neutral-900">Ranking & Desempenho dos Vendedores</h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">Meta Mensal</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 text-center">Pos</th>
                  <th className="py-3 px-3.5">Vendedor</th>
                  <th className="py-3 px-3.5 text-right">Vendido</th>
                  <th className="py-3 px-3.5 text-center">Meta Atingida</th>
                  <th className="py-3 px-3.5 text-center">Conversão</th>
                  <th className="py-3 px-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sellerRankings.map((r, index) => (
                  <tr key={r.seller.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* Rank */}
                    <td className="py-3 px-3.5 text-center font-mono font-bold text-neutral-700">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                    </td>

                    {/* Seller */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        {r.seller.avatarUrl ? (
                          <img
                            src={r.seller.avatarUrl}
                            alt={r.seller.name}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {r.seller.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-neutral-900 block">{r.seller.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            Meta: R$ {r.seller.monthlyTarget.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Won Revenue */}
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      R$ {r.wonRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Target Progress Bar */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-mono text-xs font-semibold text-neutral-800">
                          {r.targetProgress}%
                        </span>
                        <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              r.targetProgress >= 100
                                ? 'bg-emerald-600'
                                : r.targetProgress >= 50
                                ? 'bg-amber-500'
                                : 'bg-neutral-400'
                            }`}
                            style={{ width: `${Math.min(r.targetProgress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Conversion */}
                    <td className="py-3 px-3.5 text-center font-mono tabular-nums font-semibold text-neutral-800">
                      {r.conversion}%
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigateToSeller(r.seller.id)}
                        className="px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 rounded border border-neutral-200 transition-colors"
                      >
                        Ver Funil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-700" />
            <h3 className="text-sm font-bold text-neutral-900">Histórico de Atividades Comerciais</h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">Últimas ações da equipe</span>
        </div>

        <div className="divide-y divide-neutral-100 space-y-2">
          {logs.slice(0, 8).map((log) => {
            const timeFormatted = new Date(log.timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateFormatted = new Date(log.timestamp).toLocaleDateString('pt-BR');

            return (
              <div key={log.id} className="pt-2 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-neutral-900 mr-1.5">{log.sellerName}:</span>
                    <span className="text-neutral-700">{log.description}</span>
                  </div>
                </div>

                <span className="text-[11px] font-mono tabular-nums text-neutral-400 shrink-0">
                  {dateFormatted} {timeFormatted}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
