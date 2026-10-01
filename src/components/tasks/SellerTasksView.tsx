import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Calendar,
  Phone,
  MessageSquare,
  Users,
  Mail,
  FileText,
  Clock,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Building,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Task, TaskType, Seller, Client, Deal, UserSession } from '../../types/crm';

interface SellerTasksViewProps {
  tasks: Task[];
  deals: Deal[];
  clients: Client[];
  sellers: Seller[];
  currentSession: UserSession;
  onToggleTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenTaskModal: () => void;
  onOpenPhoneModal: (clientId: string, clientName: string, currentPhone: string) => void;
}

const TYPE_ICONS: Record<TaskType, React.ElementType> = {
  ligacao: Phone,
  whatsapp: MessageSquare,
  reuniao: Users,
  email: Mail,
  proposta: FileText,
};

const TYPE_LABELS: Record<TaskType, string> = {
  ligacao: 'Ligação',
  whatsapp: 'WhatsApp',
  reuniao: 'Reunião',
  email: 'E-mail',
  proposta: 'Proposta',
};

export const SellerTasksView: React.FC<SellerTasksViewProps> = ({
  tasks,
  deals,
  clients,
  sellers,
  currentSession,
  onToggleTask,
  onDeleteTask,
  onOpenTaskModal,
  onOpenPhoneModal,
}) => {
  const [filterTab, setFilterTab] = useState<'pending' | 'today' | 'overdue' | 'completed' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<string>(
    currentSession.role === 'vendedor' && currentSession.sellerId ? currentSession.sellerId : 'all'
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    if (selectedSeller !== 'all' && t.sellerId !== selectedSeller) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(term);
      const matchClient = (t.clientName || '').toLowerCase().includes(term);
      const matchPhone = (t.clientPhone || '').toLowerCase().includes(term);
      if (!matchTitle && !matchClient && !matchPhone) return false;
    }

    if (filterTab === 'pending') return !t.completed;
    if (filterTab === 'today') return !t.completed && t.dueDate === todayStr;
    if (filterTab === 'overdue') return !t.completed && t.dueDate < todayStr;
    if (filterTab === 'completed') return t.completed;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const todayCount = tasks.filter((t) => !t.completed && t.dueDate === todayStr).length;
  const overdueCount = tasks.filter((t) => !t.completed && t.dueDate < todayStr).length;

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Agenda & Tarefas do Vendedor</h2>
            <p className="text-xs text-neutral-500">
              Controle de ligações, retornos e reuniões com atualização rápida de telefone
            </p>
          </div>

          <button
            onClick={onOpenTaskModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agendar Tarefa</span>
          </button>
        </div>

        {/* Filters and Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-neutral-100 rounded-lg text-xs font-medium text-neutral-600">
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterTab === 'pending' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'hover:text-neutral-900'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('today')}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterTab === 'today' ? 'bg-white text-amber-700 shadow-2xs font-semibold' : 'hover:text-neutral-900'
              }`}
            >
              Hoje ({todayCount})
            </button>
            <button
              onClick={() => setFilterTab('overdue')}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterTab === 'overdue' ? 'bg-white text-rose-700 shadow-2xs font-semibold' : 'hover:text-neutral-900'
              }`}
            >
              Atrasadas ({overdueCount})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterTab === 'completed' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'hover:text-neutral-900'
              }`}
            >
              Concluídas
            </button>
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterTab === 'all' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'hover:text-neutral-900'
              }`}
            >
              Todas
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar tarefa..."
                className="w-full pl-8 pr-3 py-1 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              />
            </div>

            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="py-1 px-2.5 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-neutral-700"
            >
              <option value="all">Todos os Vendedores</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {currentSession.sellerId === s.id ? '(Você)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-800">Nenhuma tarefa encontrada</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Não há tarefas registradas com os filtros selecionados. Crie uma nova tarefa para organizar o seu dia.
            </p>
            <button
              onClick={onOpenTaskModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar Nova Tarefa</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const Icon = TYPE_ICONS[task.type] || Phone;
            const seller = sellers.find((s) => s.id === task.sellerId);
            const client = clients.find((c) => c.id === task.clientId);
            const deal = deals.find((d) => d.id === task.dealId);

            const isOverdue = !task.completed && task.dueDate < todayStr;
            const isToday = !task.completed && task.dueDate === todayStr;

            const clientPhone = client?.phone || task.clientPhone || deal?.clientPhone || '';
            const cleanPhone = clientPhone.replace(/\D/g, '');
            const waUrl = cleanPhone.length >= 10
              ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                  `Olá ${client?.contactName || task.clientName || ''}, tudo bem? Sou ${
                    seller?.name || 'da equipe comercial'
                  }, estou entrando em contato sobre a nossa negociação.`
                )}`
              : null;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border transition-all p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  task.completed
                    ? 'border-neutral-200 bg-neutral-50/50 opacity-70'
                    : isOverdue
                    ? 'border-rose-200/90 shadow-2xs hover:border-rose-300'
                    : isToday
                    ? 'border-amber-200/90 shadow-2xs hover:border-amber-300'
                    : 'border-neutral-200 shadow-2xs hover:border-neutral-300'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-neutral-400 hover:text-neutral-900 transition-colors shrink-0"
                    title={task.completed ? 'Marcar como não concluída' : 'Marcar como concluída'}
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                        <Icon className="w-3 h-3 text-neutral-500" />
                        <span>{TYPE_LABELS[task.type]}</span>
                      </span>

                      <span
                        className={`text-sm font-semibold ${
                          task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-neutral-500 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 pt-1">
                      {task.clientName && (
                        <div className="flex items-center gap-1 text-neutral-700 font-medium">
                          <Building className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{task.clientName}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        <span
                          className={
                            isOverdue
                              ? 'text-rose-600 font-semibold'
                              : isToday
                              ? 'text-amber-600 font-semibold'
                              : 'text-neutral-600'
                          }
                        >
                          {isOverdue ? 'Atrasada: ' : isToday ? 'Hoje: ' : ''}
                          {task.dueDate.split('-').reverse().join('/')}
                        </span>
                      </div>

                      {seller && (
                        <span className="text-[11px] text-neutral-400">
                          Resp: <span className="text-neutral-600">{seller.name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Phone & Direct Update Actions (KEY REQUIREMENT) */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 shrink-0">
                  <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200/80">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono text-xs tabular-nums font-medium text-neutral-800">
                      {clientPhone || 'Sem número'}
                    </span>

                    {/* WhatsApp Quick Link */}
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded transition-colors"
                        title="Enviar WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Direct Update Phone Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = client?.id || task.clientId || deal?.clientId || '';
                        const targetName = client?.tradeName || client?.companyName || task.clientName || 'Cliente';
                        onOpenPhoneModal(targetId, targetName, clientPhone);
                      }}
                      className="px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 bg-white rounded border border-emerald-300 transition-colors shadow-2xs"
                      title="Atualizar número de telefone do cliente"
                    >
                      Atualizar Tel
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir tarefa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
