import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Target,
  Percent,
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  DollarSign,
  Briefcase,
  AlertCircle,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { Seller, Deal } from '../../types/crm';
import { formatPhone } from '../../services/brasilApi';

interface SellerManagementViewProps {
  sellers: Seller[];
  deals: Deal[];
  onSaveSeller: (seller: Seller) => Promise<void>;
  onNavigateToSellerKanban: (sellerId: string) => void;
  onResetPassword?: (sellerId: string, newProvisional: string) => Promise<void>;
}

export const SellerManagementView: React.FC<SellerManagementViewProps> = ({
  sellers,
  deals,
  onSaveSeller,
  onNavigateToSellerKanban,
  onResetPassword,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('150000');
  const [commissionRate, setCommissionRate] = useState('5.0');
  const [active, setActive] = useState(true);

  // Password / Provisional Access states
  const [temporaryPassword, setTemporaryPassword] = useState('Vendedor@2026');
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resetModalSeller, setResetModalSeller] = useState<Seller | null>(null);
  const [newProvisionalInput, setNewProvisionalInput] = useState('');

  const [saving, setSaving] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const nums = '23456789';
    const randCode =
      chars.charAt(Math.floor(Math.random() * chars.length)) +
      chars.charAt(Math.floor(Math.random() * chars.length)).toLowerCase() +
      nums.charAt(Math.floor(Math.random() * nums.length)) +
      nums.charAt(Math.floor(Math.random() * nums.length));
    return `Vendedor@${randCode}!`;
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setMonthlyTarget('150000');
    setCommissionRate('5.0');
    setActive(true);
    setTemporaryPassword(generateRandomPassword());
    setMustChangePassword(true);
    setEditingSeller(null);
    setShowAddForm(false);
  };

  const startEdit = (seller: Seller) => {
    setEditingSeller(seller);
    setName(seller.name);
    setEmail(seller.email);
    setPhone(seller.phone);
    setMonthlyTarget(seller.monthlyTarget.toString());
    setCommissionRate(seller.commissionRate.toString());
    setActive(seller.active);
    setTemporaryPassword(seller.temporaryPassword || generateRandomPassword());
    setMustChangePassword(seller.mustChangePassword ?? true);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSaving(true);
    try {
      const sellerData: Seller = {
        id: editingSeller?.id || 'sel_' + Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        monthlyTarget: parseFloat(monthlyTarget) || 0,
        commissionRate: parseFloat(commissionRate) || 0,
        active,
        temporaryPassword: mustChangePassword ? temporaryPassword.trim() : undefined,
        password: !mustChangePassword ? editingSeller?.password || 'senha123' : undefined,
        mustChangePassword,
        createdAt: editingSeller?.createdAt || new Date().toISOString(),
      };
      await onSaveSeller(sellerData);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleConfirmResetPassword = async () => {
    if (!resetModalSeller || !newProvisionalInput.trim() || !onResetPassword) return;
    await onResetPassword(resetModalSeller.id, newProvisionalInput.trim());
    setResetModalSeller(null);
  };

  const filteredSellers = sellers.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || s.phone.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">Gestão e Cadastro de Vendedores</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Cadastre vendedores, defina senhas provisórias de primeiro acesso, metas e acompanhe o desempenho
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!showAddForm && (
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo Vendedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Registration/Edit Form Drawer */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-150 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>{editingSeller ? 'Editar Vendedor' : 'Novo Vendedor da Equipe'}</span>
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-800"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lucas Guimarães"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="lucas@empresa.com.br"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Meta Mensal de Vendas (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono">
                    R$
                  </span>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={monthlyTarget}
                    onChange={(e) => setMonthlyTarget(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Comissão (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Status na Equipe</label>
                <select
                  value={active ? 'active' : 'inactive'}
                  onChange={(e) => setActive(e.target.value === 'active')}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                >
                  <option value="active">Ativo (Pode receber leads)</option>
                  <option value="inactive">Inativo / Afastado</option>
                </select>
              </div>
            </div>

            {/* Espaço para Criar Senha Provisória (REQUISITO EXPLÍCITO) */}
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  Credencial de Acesso Provisória
                </span>
                <span className="text-[11px] text-amber-800 font-medium">Troca no 1º Acesso</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs text-neutral-700 font-semibold mb-1">
                    Senha Provisória de Acesso
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={temporaryPassword}
                        onChange={(e) => setTemporaryPassword(e.target.value)}
                        placeholder="Ex: Vendedor@2026"
                        className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-bold text-neutral-900"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setTemporaryPassword(generateRandomPassword())}
                      className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 flex items-center gap-1 shrink-0"
                      title="Gerar nova senha aleatória"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Gerar</span>
                    </button>
                  </div>
                </div>

                <div className="pb-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mustChangePassword}
                      onChange={(e) => setMustChangePassword(e.target.checked)}
                      className="accent-amber-600 w-4 h-4 rounded"
                    />
                    <span>Obrigar vendedor a cadastrar nova senha no primeiro login</span>
                  </label>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500">
                O vendedor usará esta senha para o primeiro login e será direcionado automaticamente para a tela de troca obrigatória.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors"
              >
                {saving ? 'Gravando...' : editingSeller ? 'Atualizar Vendedor' : 'Concluir Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sellers List Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nome, email ou telefone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          <div className="text-xs text-neutral-500 font-mono tabular-nums">
            Total de vendedores cadastrados: <span className="font-semibold text-neutral-900">{sellers.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Vendedor</th>
                <th className="py-3 px-4">Contato</th>
                <th className="py-3 px-4 text-center">Status de Acesso / Senha</th>
                <th className="py-3 px-4 text-right">Meta Mensal</th>
                <th className="py-3 px-4 text-right">Vendido no Mês</th>
                <th className="py-3 px-4 text-center">Atingimento</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {filteredSellers.map((seller) => {
                const sellerDeals = deals.filter((d) => d.sellerId === seller.id);
                const wonDeals = sellerDeals.filter((d) => d.stage === 'ganho');
                const totalWon = wonDeals.reduce((sum, d) => sum + d.value, 0);
                const targetPercent =
                  seller.monthlyTarget > 0 ? Math.min(Math.round((totalWon / seller.monthlyTarget) * 100), 200) : 0;

                const hasProvisional = Boolean(seller.mustChangePassword && seller.temporaryPassword);

                return (
                  <tr key={seller.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {seller.avatarUrl ? (
                          <img
                            src={seller.avatarUrl}
                            alt={seller.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {seller.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-neutral-900 block">{seller.name}</span>
                          <span className="text-[11px] text-neutral-400">Comissão: {seller.commissionRate}%</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">
                      <div>{seller.email}</div>
                      <div className="text-neutral-500">{seller.phone || '-'}</div>
                    </td>

                    {/* Status de Acesso / Senha Provisória */}
                    <td className="py-3 px-4 text-center">
                      {hasProvisional ? (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            <span>Provisória: {seller.temporaryPassword}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(seller.temporaryPassword!, seller.id)}
                              className="p-0.5 hover:text-amber-950"
                              title="Copiar senha provisória"
                            >
                              {copiedId === seller.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </span>
                          <span className="text-[9px] text-neutral-400 font-medium">Troca obrigatória no 1º login</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>Senha Cadastrada</span>
                        </span>
                      )}
                    </td>

                    {/* Monthly Target */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-neutral-900">
                      R$ {seller.monthlyTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Won Sales */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      R$ {totalWon.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Target Progress */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-mono text-xs font-semibold text-neutral-800">{targetPercent}%</span>
                        <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              targetPercent >= 100
                                ? 'bg-emerald-600'
                                : targetPercent >= 50
                                ? 'bg-amber-500'
                                : 'bg-neutral-400'
                            }`}
                            style={{ width: `${Math.min(targetPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Active */}
                    <td className="py-3 px-4 text-center">
                      {seller.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          <span>Ativo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" />
                          <span>Inativo</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setResetModalSeller(seller);
                            setNewProvisionalInput(generateRandomPassword());
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-50 rounded border border-amber-200 transition-colors"
                          title="Gerar nova senha provisória de acesso para este vendedor"
                        >
                          Redefinir Senha
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigateToSellerKanban(seller.id)}
                          className="px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded border border-neutral-200 transition-colors"
                          title="Ver negócios deste vendedor no funil"
                        >
                          Ver Funil
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(seller)}
                          className="px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded border border-neutral-200 transition-colors"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Redefinir Senha Provisória do Vendedor */}
      {resetModalSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-amber-50/60">
              <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Redefinir Senha Provisória
              </span>
              <button
                onClick={() => setResetModalSeller(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <p className="text-xs text-neutral-600">
                Uma nova senha provisória será definida para <strong>{resetModalSeller.name}</strong>. Ele precisará cadastrar uma nova senha assim que fizer o próximo login.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Nova Senha Provisória
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newProvisionalInput}
                    onChange={(e) => setNewProvisionalInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-neutral-300 rounded-lg bg-neutral-50"
                  />
                  <button
                    type="button"
                    onClick={() => setNewProvisionalInput(generateRandomPassword())}
                    className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700"
                    title="Gerar outra"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setResetModalSeller(null)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetPassword}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs"
                >
                  Confirmar Redefinição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
