import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  User,
  Clock,
} from 'lucide-react';
import { Deal, FunnelStage, FunnelStageConfig, Seller, Client, UserSession } from '../../types/crm';

interface FunnelKanbanProps {
  deals: Deal[];
  sellers: Seller[];
  clients: Client[];
  currentSession: UserSession;
  onUpdateStage: (dealId: string, newStage: FunnelStage) => Promise<void>;
  onOpenDealModal: (deal?: Deal | null, initialStage?: FunnelStage) => void;
  onOpenPhoneModal: (clientId: string, clientName: string, currentPhone: string) => void;
  onOpenTaskModal: (dealId?: string) => void;
}

const STAGES: FunnelStageConfig[] = [
  {
    id: 'prospeccao',
    label: 'Prospecção',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50/60',
    borderColor: 'border-sky-200',
    description: 'Novos leads identificados',
  },
  {
    id: 'qualificacao',
    label: 'Qualificação',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50/60',
    borderColor: 'border-amber-200',
    description: 'Diagnóstico e fit comercial',
  },
  {
    id: 'proposta',
    label: 'Proposta Enviada',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50/60',
    borderColor: 'border-purple-200',
    description: 'Apresentação comercial e escopo',
  },
  {
    id: 'negociacao',
    label: 'Negociação',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50/60',
    borderColor: 'border-indigo-200',
    description: 'Alinhamento contratual e valores',
  },
  {
    id: 'ganho',
    label: 'Fechado (Ganho)',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50/60',
    borderColor: 'border-emerald-200',
    description: 'Contrato assinado / Venda realizada',
  },
  {
    id: 'perdido',
    label: 'Perdido',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50/60',
    borderColor: 'border-rose-200',
    description: 'Sem fechamento no ciclo',
  },
];

export const FunnelKanban: React.FC<FunnelKanbanProps> = ({
  deals,
  sellers,
  clients,
  currentSession,
  onUpdateStage,
  onOpenDealModal,
  onOpenPhoneModal,
  onOpenTaskModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSellerFilter, setSelectedSellerFilter] = useState<string>(
    currentSession.role === 'vendedor' && currentSession.sellerId ? currentSession.sellerId : 'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filter deals
  const filteredDeals = deals.filter((d) => {
    if (selectedSellerFilter !== 'all' && d.sellerId !== selectedSellerFilter) return false;
    if (priorityFilter !== 'all' && d.priority !== priorityFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(term);
      const matchClient = d.clientName.toLowerCase().includes(term);
      const matchPhone = d.clientPhone.toLowerCase().includes(term);
      if (!matchTitle && !matchClient && !matchPhone) return false;
    }
    return true;
  });

  // Calculate pipeline metrics
  const activeDeals = filteredDeals.filter((d) => d.stage !== 'ganho' && d.stage !== 'perdido');
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const totalWonValue = filteredDeals.filter((d) => d.stage === 'ganho').reduce((sum, d) => sum + d.value, 0);

  const getStageIndex = (stage: FunnelStage) => STAGES.findIndex((s) => s.id === stage);

  const moveStage = async (e: React.MouseEvent, dealId: string, currentStage: FunnelStage, direction: 1 | -1) => {
    e.stopPropagation();
    const currIdx = getStageIndex(currentStage);
    const newIdx = currIdx + direction;
    if (newIdx >= 0 && newIdx < STAGES.length) {
      await onUpdateStage(dealId, STAGES[newIdx].id);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar negócio, empresa ou telefone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          {/* Seller Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <User className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedSellerFilter}
              onChange={(e) => setSelectedSellerFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            >
              <option value="all">Todos os Vendedores</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {currentSession.sellerId === s.id ? '(Você)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-neutral-600"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="alta">Prioridade Alta</option>
            <option value="media">Prioridade Média</option>
            <option value="baixa">Prioridade Baixa</option>
          </select>
        </div>

        {/* Quick Metrics & Add Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono tabular-nums text-neutral-600 border-r border-neutral-200 pr-4">
            <div>
              <span className="text-neutral-400 block text-[10px] font-sans">Pipeline Ativo</span>
              <span className="font-semibold text-neutral-900">
                R$ {totalPipelineValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-sans">Fechado Ganho</span>
              <span className="font-semibold text-emerald-700">
                R$ {totalWonValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenDealModal(null, 'prospeccao')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Negócio</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex items-start gap-3.5 min-w-[1300px] h-full">
          {STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 bg-neutral-100/70 border border-neutral-200/80 rounded-xl flex flex-col max-h-[calc(100vh-210px)]"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-neutral-200/80 bg-white/70 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                      {stage.label}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-neutral-500 mt-1 font-medium">
                    R$ {stageTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Cards List */}
                <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-lg">
                      Nenhum negócio nesta etapa
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const seller = sellers.find((s) => s.id === deal.sellerId);
                      const client = clients.find((c) => c.id === deal.clientId);
                      const cleanPhone = deal.clientPhone.replace(/\D/g, '');
                      const waUrl = cleanPhone.length >= 10 ? `https://wa.me/55${cleanPhone}` : null;
                      const stageIdx = getStageIndex(deal.stage);

                      return (
                        <div
                          key={deal.id}
                          onClick={() => onOpenDealModal(deal)}
                          className="bg-white p-3.5 rounded-lg border border-neutral-200 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all cursor-pointer space-y-2.5 group"
                        >
                          {/* Card Top: Client & Priority */}
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-xs font-semibold text-neutral-900 group-hover:text-blue-900 line-clamp-1">
                              {deal.clientName}
                            </span>
                            <span
                              className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                deal.priority === 'alta'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : deal.priority === 'media'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {deal.priority}
                            </span>
                          </div>

                          {/* Deal Title */}
                          <p className="text-xs text-neutral-600 line-clamp-2">{deal.title}</p>

                          {/* Value */}
                          <div className="text-sm font-bold font-mono tabular-nums text-neutral-900">
                            R$ {deal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>

                          {/* Phone & Direct Update Section (Key Requirement) */}
                          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs gap-1">
                            <div className="flex items-center gap-1.5 text-neutral-600 min-w-0">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-mono text-[11px] tabular-nums truncate">
                                {deal.clientPhone || 'Sem telefone'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {waUrl && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                  title="Abrir WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenPhoneModal(deal.clientId, deal.clientName, deal.clientPhone);
                                }}
                                className="px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors"
                                title="Editar telefone do cliente"
                              >
                                Editar Tel
                              </button>
                            </div>
                          </div>

                          {/* Seller & Action Footer */}
                          <div className="pt-1.5 flex items-center justify-between text-[11px] text-neutral-500">
                            <div className="flex items-center gap-1.5 truncate">
                              {seller?.avatarUrl ? (
                                <img
                                  src={seller.avatarUrl}
                                  alt={seller.name}
                                  className="w-4 h-4 rounded-full object-cover shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                                  {seller?.name.charAt(0) || 'V'}
                                </div>
                              )}
                              <span className="truncate">{seller?.name.split(' ')[0] || 'Vendedor'}</span>
                            </div>

                            {/* Stage Transition Controls */}
                            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                              {stageIdx > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => moveStage(e, deal.id, deal.stage, -1)}
                                  className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                                  title="Voltar etapa"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {stageIdx < STAGES.length - 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => moveStage(e, deal.id, deal.stage, 1)}
                                  className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                                  title="Avançar etapa"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Column Footer: Quick Add Deal */}
                <div className="p-2 border-t border-neutral-200/80 bg-white/40">
                  <button
                    onClick={() => onOpenDealModal(null, stage.id)}
                    className="w-full py-1 text-xs text-neutral-500 hover:text-neutral-900 hover:bg-white rounded-md transition-colors flex items-center justify-center gap-1 font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
