import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  Copy,
  Check,
  ShieldCheck,
  X,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { StorageService } from '../../services/storage';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataMigrated?: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onDataMigrated,
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [migrating, setMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = StorageService.getConnectionConfig();
      setUrl(config.url);
      setKey(config.key);
      setTestResult(null);
      setMigrationLogs([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);
    StorageService.saveConnectionConfig(url, key);

    const result = await StorageService.testConnection();
    setTestResult(result);
    setTesting(false);
  };

  const handleMigrate = async () => {
    setMigrating(true);
    setMigrationLogs(['Iniciando migração dos dados locais para o Supabase...']);

    // Ensure config is saved
    StorageService.saveConnectionConfig(url, key);

    const res = await StorageService.migrateAllToSupabase();
    setMigrationLogs(res.details);
    setMigrating(false);

    if (res.success && onDataMigrated) {
      onDataMigrated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Conexão com Banco de Dados Supabase (PostgreSQL)
              </h3>
              <p className="text-xs text-neutral-500">
                Gerencie credenciais e sincronize clientes, vendedores e oportunidades
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status feedback banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold block">
                  {testResult.success ? 'Conexão Estabelecida' : 'Aviso de Conexão'}
                </span>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}

          {/* Form Credentials */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Supabase Anon / Public API Key
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Encontre em: Supabase Dashboard → Settings → API → Project URL e anon public key
              </p>
            </div>
          </div>

          {/* Migration & Action Panel */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-neutral-900 block flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  Sincronização / Migração Imediata
                </span>
                <span className="text-[11px] text-neutral-500">
                  Transfere todos os vendedores, clientes, propostas e tarefas para o banco
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAndTest}
                  disabled={testing || !url || !key}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleMigrate}
                  disabled={migrating || !url || !key}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{migrating ? 'Migrando...' : 'Migrar Dados Agora'}</span>
                </button>
              </div>
            </div>

            {/* Migration progress logs */}
            {migrationLogs.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-neutral-200 text-xs font-mono space-y-1 max-h-36 overflow-y-auto">
                {migrationLogs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.startsWith('✓')
                        ? 'text-emerald-700 font-semibold'
                        : log.startsWith('✕')
                        ? 'text-rose-600 font-semibold'
                        : 'text-neutral-600'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
          <span className="text-neutral-500">
            Armazenamento híbrido ativo com sincronização em tempo real.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-2xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
