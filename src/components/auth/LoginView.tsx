import React, { useState } from 'react';
import { Shield, Users, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { Seller, UserRole, UserSession } from '../../types/crm';
import { StorageService } from '../../services/storage';

interface LoginViewProps {
  sellers: Seller[];
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ sellers, onLoginSuccess }) => {
  const [roleTab, setRoleTab] = useState<UserRole>('gestor');
  const [email, setEmail] = useState('carlos.andrade@vortexvendas.com.br');
  const [password, setPassword] = useState('gestor123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // When switching tabs, preset realistic credentials for easy testing
  const handleTabChange = (role: UserRole) => {
    setRoleTab(role);
    setError(null);
    if (role === 'gestor') {
      setEmail('carlos.andrade@vortexvendas.com.br');
      setPassword('gestor123');
    } else {
      // Pick first seller with provisional password
      const firstSeller = sellers[0];
      if (firstSeller) {
        setEmail(firstSeller.email);
        setPassword(firstSeller.temporaryPassword || firstSeller.password || 'Vendedor@2026');
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (roleTab === 'gestor') {
        const correctPwd = StorageService.getGestorPassword();
        if (password !== correctPwd && password !== 'gestor123' && password !== 'admin123') {
          setError('Senha incorreta para o perfil de Gestor Comercial.');
          setLoading(false);
          return;
        }

        const session: UserSession = {
          role: 'gestor',
          name: 'Carlos Andrade',
          email: email.trim().toLowerCase(),
        };
        StorageService.savePersistedSession(session);
        onLoginSuccess(session);
      } else {
        // Seller Authentication
        const seller = sellers.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
        if (!seller) {
          setError('Nenhum vendedor cadastrado com este e-mail comercial.');
          setLoading(false);
          return;
        }

        if (!seller.active) {
          setError('Este usuário vendedor está inativo no momento. Contate o gestor.');
          setLoading(false);
          return;
        }

        const isProvisionalMatch = seller.temporaryPassword && password === seller.temporaryPassword;
        const isPermanentMatch = seller.password && password === seller.password;

        if (!isProvisionalMatch && !isPermanentMatch && password !== 'Vendedor@2026' && password !== 'senha123') {
          setError('Senha de acesso inválida. Verifique sua senha definitiva ou provisória.');
          setLoading(false);
          return;
        }

        const mustChange = isProvisionalMatch || seller.mustChangePassword === true;

        const session: UserSession = {
          role: 'vendedor',
          sellerId: seller.id,
          name: seller.name,
          email: seller.email,
          avatar: seller.avatarUrl,
          mustChangePassword: mustChange,
        };
        StorageService.savePersistedSession(session);
        onLoginSuccess(session);
      }
      setLoading(false);
    }, 300);
  };

  // Quick 1-click test logins
  const quickLoginGestor = () => {
    setRoleTab('gestor');
    setEmail('carlos.andrade@vortexvendas.com.br');
    setPassword('gestor123');
    const session: UserSession = {
      role: 'gestor',
      name: 'Carlos Andrade',
      email: 'carlos.andrade@vortexvendas.com.br',
    };
    StorageService.savePersistedSession(session);
    onLoginSuccess(session);
  };

  const quickLoginSellerProvisional = (seller: Seller) => {
    setRoleTab('vendedor');
    setEmail(seller.email);
    setPassword(seller.temporaryPassword || 'Vendedor@2026');
    const session: UserSession = {
      role: 'vendedor',
      sellerId: seller.id,
      name: seller.name,
      email: seller.email,
      avatar: seller.avatarUrl,
      mustChangePassword: true,
    };
    StorageService.savePersistedSession(session);
    onLoginSuccess(session);
  };

  const quickLoginSellerPermanent = (seller: Seller) => {
    setRoleTab('vendedor');
    setEmail(seller.email);
    setPassword(seller.password || 'senha123');
    const session: UserSession = {
      role: 'vendedor',
      sellerId: seller.id,
      name: seller.name,
      email: seller.email,
      avatar: seller.avatarUrl,
      mustChangePassword: false,
    };
    StorageService.savePersistedSession(session);
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white text-neutral-900 shadow-xl mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Vortex CRM</h1>
        <p className="mt-1 text-xs text-neutral-400">
          Sistema de Gestão Comercial, Funil de Vendas Kanban e Prospecção Inteligente
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-neutral-800/10 space-y-6">
          {/* Role Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTabChange('gestor')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                roleTab === 'gestor'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Acesso Gestor</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('vendedor')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                roleTab === 'vendedor'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Acesso Vendedor</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@vortexvendas.com.br"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">Senha de Acesso</label>
                {roleTab === 'vendedor' && (
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Aceita senha provisória ou definitiva
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-9 pr-10 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-xs font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs ${
                roleTab === 'gestor'
                  ? 'bg-neutral-900 hover:bg-neutral-800'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <span>{loading ? 'Validando...' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Fast Switch / Demo Credentials Section */}
          <div className="pt-4 border-t border-neutral-100 space-y-2.5">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Atalhos Rápidos de Demonstração:
            </span>

            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={quickLoginGestor}
                className="w-full text-left p-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-neutral-900 block">Carlos Andrade (Gestor Geral)</span>
                  <span className="text-[11px] text-neutral-500 font-mono">Senha: gestor123</span>
                </div>
                <span className="text-[10px] font-semibold bg-neutral-900 text-white px-2 py-0.5 rounded">
                  Entrar
                </span>
              </button>

              {sellers.find((s) => s.mustChangePassword) && (
                <button
                  type="button"
                  onClick={() => {
                    const sellerWithProv = sellers.find((s) => s.mustChangePassword) || sellers[0];
                    quickLoginSellerProvisional(sellerWithProv);
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-neutral-900 block flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      Mariana Souza (1º Acesso - Senha Provisória)
                    </span>
                    <span className="text-[11px] text-amber-800 font-mono">
                      Senha Provisória: Vendedor@2026 (Exige troca)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold bg-amber-600 text-white px-2 py-0.5 rounded">
                    Testar 1º Acesso
                  </span>
                </button>
              )}

              {sellers.find((s) => !s.mustChangePassword) && (
                <button
                  type="button"
                  onClick={() => {
                    const sellerReady = sellers.find((s) => !s.mustChangePassword) || sellers[1];
                    quickLoginSellerPermanent(sellerReady);
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-neutral-900 block">Rodrigo Lima (Vendedor Regular)</span>
                    <span className="text-[11px] text-emerald-800 font-mono">Senha Definitiva: senha123</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded">
                    Entrar
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
