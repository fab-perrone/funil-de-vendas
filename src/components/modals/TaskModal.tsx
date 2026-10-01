import React, { useState } from 'react';
import { X, CheckSquare, Calendar, Phone, MessageSquare, Users, Mail, FileText } from 'lucide-react';
import { Task, TaskType, Deal, Seller } from '../../types/crm';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  sellers: Seller[];
  currentSellerId?: string;
  defaultDealId?: string;
  onSaveTask: (task: Task) => Promise<void>;
}

const TASK_TYPES: { id: TaskType; label: string; icon: React.ElementType }[] = [
  { id: 'ligacao', label: 'Ligação Telefônica', icon: Phone },
  { id: 'whatsapp', label: 'Mensagem WhatsApp', icon: MessageSquare },
  { id: 'reuniao', label: 'Reunião / Demo', icon: Users },
  { id: 'email', label: 'E-mail Comercial', icon: Mail },
  { id: 'proposta', label: 'Envio de Proposta', icon: FileText },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  deals,
  sellers,
  currentSellerId,
  defaultDealId,
  onSaveTask,
}) => {
  const [dealId, setDealId] = useState(defaultDealId || deals[0]?.id || '');
  const [sellerId, setSellerId] = useState(currentSellerId || sellers[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('ligacao');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (defaultDealId) setDealId(defaultDealId);
    if (currentSellerId) setSellerId(currentSellerId);
  }, [defaultDealId, currentSellerId, isOpen]);

  if (!isOpen) return null;

  const selectedDeal = deals.find((d) => d.id === dealId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sellerId) return;

    setSaving(true);
    try {
      const task: Task = {
        id: 'tsk_' + Date.now(),
        dealId: selectedDeal?.id,
        clientId: selectedDeal?.clientId,
        clientName: selectedDeal?.clientName,
        clientPhone: selectedDeal?.clientPhone,
        sellerId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        type,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      await onSaveTask(task);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Agendar Nova Tarefa</h3>
              <p className="text-xs text-neutral-500">Acompanhamento e compromisso comercial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Título da Atividade</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ligar para confirmar recebimento da proposta"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Tipo de Ação</label>
            <div className="grid grid-cols-2 gap-2">
              {TASK_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Data Limite</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Responsável</label>
              <select
                required
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              >
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Negócio / Cliente Vinculado</label>
            <select
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            >
              <option value="">Sem negócio específico (Geral)</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.clientName} - {d.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Observações ou Pauta (Opcional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instruções sobre o que abordar no contato..."
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors"
            >
              {saving ? 'Agendando...' : 'Agendar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
