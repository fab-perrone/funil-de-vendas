import React, { useState } from 'react';
import { X, Briefcase, Calendar, DollarSign, User, Building, Phone, Plus, MessageSquare } from 'lucide-react';
import { Deal, FunnelStage, Seller, Client } from '../../types/crm';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Deal | null;
  sellers: Seller[];
  clients: Client[];
  initialStage?: FunnelStage;
  currentSellerId?: string;
  onSaveDeal: (deal: Deal) => Promise<void>;
  onOpenPhoneModal: (clientId: string, clientName: string, phone: string) => void;
}

const STAGES: { id: FunnelStage; label: string }[] = [
  { id: 'prospeccao', label: 'Prospecção' },
  { id: 'qualificacao', label: 'Qualificação' },
  { id: 'proposta', label: 'Proposta Apresentada' },
  { id: 'negociacao', label: 'Negociação' },
  { id: 'ganho', label: 'Fechado (Ganho)' },
  { id: 'perdido', label: 'Perdido' },
];

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  deal,
  sellers,
  clients,
  initialStage = 'prospeccao',
  currentSellerId,
  onSaveDeal,
  onOpenPhoneModal,
}) => {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [value, setValue] = useState('0');
  const [stage, setStage] = useState<FunnelStage>(initialStage);
  const [probability, setProbability] = useState(50);
  const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>('media');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (deal) {
      setTitle(deal.title);
      setClientId(deal.clientId);
      setSellerId(deal.sellerId);
      setValue(deal.value.toString());
      setStage(deal.stage);
      setProbability(deal.probability);
      setPriority(deal.priority);
      setExpectedCloseDate(deal.expectedCloseDate);
    } else {
      setTitle('');
      setClientId(clients[0]?.id || '');
      setSellerId(currentSellerId || sellers[0]?.id || '');
      setValue('25000');
      setStage(initialStage);
      setProbability(40);
      setPriority('media');
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setExpectedCloseDate(d.toISOString().split('T')[0]);
    }
  }, [deal, clients, sellers, initialStage, currentSellerId, isOpen]);

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.id === clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId || !sellerId) return;

    setSaving(true);
    try {
      const dealData: Deal = {
        id: deal?.id || 'deal_' + Date.now(),
        clientId,
        clientName: selectedClient?.tradeName || selectedClient?.companyName || 'Cliente',
        clientPhone: selectedClient?.phone || '',
        sellerId,
        title: title.trim(),
        value: parseFloat(value) || 0,
        stage,
        probability,
        priority,
        expectedCloseDate,
        createdAt: deal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await onSaveDeal(dealData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const cleanNum = selectedClient?.phone?.replace(/\D/g, '') || '';
  const waUrl = cleanNum.length >= 10 ? `https://wa.me/55${cleanNum}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                {deal ? 'Detalhes do Negócio' : 'Novo Negócio no Funil'}
              </h3>
              <p className="text-xs text-neutral-500">
                {deal ? 'Gerencie o andamento da negociação' : 'Cadastre uma nova oportunidade de venda'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Título da Oportunidade</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Fornecimento Anual de Software ou Licenciamento"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Cliente Vinculado</label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 bg-white"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.tradeName || c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Vendedor Responsável</label>
              <select
                required
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 bg-white"
              >
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Client Contact Card with direct phone update button */}
          {selectedClient && (
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                  <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{selectedClient.companyName}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono tabular-nums">{selectedClient.phone || 'Sem telefone'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                    title="Chamar no WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onOpenPhoneModal(
                      selectedClient.id,
                      selectedClient.tradeName || selectedClient.companyName,
                      selectedClient.phone
                    )
                  }
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/80"
                >
                  Alterar Telefone
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Valor do Negócio (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono">
                  R$
                </span>
                <input
                  type="number"
                  step="100"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Etapa do Funil</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as FunnelStage)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 bg-white"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Probabilidade ({probability}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="w-full accent-neutral-900 h-2 bg-neutral-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'baixa' | 'media' | 'alta')}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 bg-white"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Previsão Fechamento</label>
              <input
                type="date"
                required
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-neutral-100">
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
              {saving ? 'Salvando...' : deal ? 'Salvar Alterações' : 'Criar Negócio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
