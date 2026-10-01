import React, { useState } from 'react';
import { X, Phone, MessageSquare, Check, User } from 'lucide-react';
import { formatPhone } from '../../services/brasilApi';

interface EditPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  contactName?: string;
  currentPhone: string;
  onSavePhone: (clientId: string, newPhone: string) => Promise<void>;
}

export const EditPhoneModal: React.FC<EditPhoneModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  contactName,
  currentPhone,
  onSavePhone,
}) => {
  const [phone, setPhone] = useState(currentPhone);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    setPhone(currentPhone);
    setSuccess(false);
  }, [currentPhone, isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setSaving(true);
    try {
      await onSavePhone(clientId, phone);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const cleanNum = phone.replace(/\D/g, '');
  const waUrl = cleanNum.length >= 10 ? `https://wa.me/55${cleanNum}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Atualizar Telefone do Cliente</h3>
              <p className="text-xs text-neutral-500">Sincroniza automaticamente em negócios e tarefas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200/70 text-xs space-y-1">
            <div className="font-semibold text-neutral-900">{clientName}</div>
            {contactName && (
              <div className="text-neutral-600 flex items-center gap-1.5">
                <User className="w-3 h-3 text-neutral-400" />
                <span>Contato: {contactName}</span>
              </div>
            )}
            <div className="text-neutral-500">
              Telefone atual: <span className="font-mono text-neutral-700">{currentPhone || 'Não cadastrado'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Novo Número de Telefone / WhatsApp
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(11) 98765-4321"
                maxLength={15}
                required
                className="w-full px-3.5 py-2.5 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                autoFocus
              />
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                  title="Testar conversa no WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Inclua o DDD. Aceita telefone fixo (10 dígitos) ou celular (11 dígitos).
            </p>
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
              disabled={saving || !phone.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <>
                  <Phone className="w-3.5 h-3.5" />
                  <span>{saving ? 'Atualizando...' : 'Atualizar Telefone'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
