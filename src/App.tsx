/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Kanban,
  CheckSquare,
  Users,
  Building2,
  TrendingUp,
  UserCheck,
  Shield,
  Briefcase,
  ChevronDown,
  LogOut,
  Phone,
  Sparkles,
  Compass,
  Database,
} from 'lucide-react';
import {
  UserRole,
  UserSession,
  Seller,
  Client,
  Deal,
  Task,
  ActivityLog,
  FunnelStage,
} from './types/crm';
import { StorageService } from './services/storage';
import { FunnelKanban } from './components/kanban/FunnelKanban';
import { SellerTasksView } from './components/tasks/SellerTasksView';
import { SellerManagementView } from './components/gestor/SellerManagementView';
import { ClientRegistrationView } from './components/gestor/ClientRegistrationView';
import { ManagerDashboardView } from './components/gestor/ManagerDashboardView';
import { CnaeRadiusSearch } from './components/maps/CnaeRadiusSearch';
import { EditPhoneModal } from './components/modals/EditPhoneModal';
import { DealModal } from './components/modals/DealModal';
import { TaskModal } from './components/modals/TaskModal';
import { LoginView } from './components/auth/LoginView';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { DatabaseConfigModal } from './components/modals/DatabaseConfigModal';

type NavTab = 'kanban' | 'tasks' | 'radius_search' | 'sellers' | 'clients' | 'dashboard';

export default function App() {
  // State
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('kanban');
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Authentication & Role Session
  const [currentSession, setCurrentSession] = useState<UserSession | null>(() => {
    return (
      StorageService.getPersistedSession() || {
        role: 'gestor',
        name: 'Carlos Andrade',
        email: 'carlos.andrade@vortexvendas.com.br',
      }
    );
  });
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Modals
  const [phoneModalState, setPhoneModalState] = useState<{
    isOpen: boolean;
    clientId: string;
    clientName: string;
    phone: string;
  }>({
    isOpen: false,
    clientId: '',
    clientName: '',
    phone: '',
  });

  const [dealModalState, setDealModalState] = useState<{
    isOpen: boolean;
    deal: Deal | null;
    initialStage: FunnelStage;
  }>({
    isOpen: false,
    deal: null,
    initialStage: 'prospeccao',
  });

  const [taskModalState, setTaskModalState] = useState<{
    isOpen: boolean;
    dealId?: string;
  }>({
    isOpen: false,
  });

  const [showDbModal, setShowDbModal] = useState(false);

  // Initial Data Load & Refresh
  const loadData = async () => {
    const [s, c, d, t, l] = await Promise.all([
      StorageService.getSellers(),
      StorageService.getClients(),
      StorageService.getDeals(),
      StorageService.getTasks(),
      StorageService.getActivityLogs(),
    ]);
    setSellers(s);
    setClients(c);
    setDeals(d);
    setTasks(t);
    setLogs(l);
  };

  useEffect(() => {
    loadData();

    // Quota defense listener
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Handlers for data updates
  const handleUpdateDealStage = async (dealId: string, newStage: FunnelStage) => {
    const updated = await StorageService.updateDealStage(
      dealId,
      newStage,
      currentSession?.sellerId || 'gestor',
      currentSession?.name || 'Gestor'
    );
    setDeals(updated);
    const updatedLogs = await StorageService.getActivityLogs();
    setLogs(updatedLogs);
  };

  const handleSaveDeal = async (deal: Deal) => {
    const updated = await StorageService.saveDeal(deal, currentSession?.name || 'Gestor');
    setDeals(updated);
    const updatedLogs = await StorageService.getActivityLogs();
    setLogs(updatedLogs);
  };

  const handleSavePhone = async (clientId: string, newPhone: string) => {
    const res = await StorageService.updateClientPhone(
      clientId,
      newPhone,
      currentSession?.sellerId || 'gestor',
      currentSession?.name || 'Gestor'
    );
    setClients(res.clients);
    setDeals(res.deals);
    setTasks(res.tasks);
    const updatedLogs = await StorageService.getActivityLogs();
    setLogs(updatedLogs);
  };

  const handleSaveSeller = async (seller: Seller) => {
    const updated = await StorageService.saveSeller(seller);
    setSellers(updated);
  };

  const handleSaveClient = async (
    client: Client,
    initialDeal?: { title: string; value: number; sellerId: string }
  ) => {
    const updatedClients = await StorageService.saveClient(client);
    setClients(updatedClients);

    if (initialDeal) {
      const dealData: Deal = {
        id: 'deal_' + Date.now(),
        clientId: client.id,
        clientName: client.tradeName || client.companyName,
        clientPhone: client.phone,
        sellerId: initialDeal.sellerId,
        title: initialDeal.title,
        value: initialDeal.value,
        stage: 'prospeccao',
        probability: 30,
        priority: 'media',
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedDeals = await StorageService.saveDeal(dealData, currentSession?.name || 'Gestor');
      setDeals(updatedDeals);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const updated = await StorageService.toggleTaskCompleted(
      taskId,
      currentSession?.sellerId || 'gestor',
      currentSession?.name || 'Gestor'
    );
    setTasks(updated);
    const updatedLogs = await StorageService.getActivityLogs();
    setLogs(updatedLogs);
  };

  const handleDeleteTask = async (taskId: string) => {
    const updated = await StorageService.deleteTask(taskId);
    setTasks(updated);
  };

  const handleSaveTask = async (task: Task) => {
    const updated = await StorageService.saveTask(task);
    setTasks(updated);
  };

  const handleImportFromRadiusSearch = async (
    clientData: Omit<Client, 'id' | 'createdAt'>,
    createDeal?: { title: string; value: number; sellerId: string }
  ) => {
    const newClient: Client = {
      ...clientData,
      id: 'cli_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    await handleSaveClient(newClient, createDeal);
  };

  const handlePasswordChanged = async (newPassword: string) => {
    if (!currentSession?.sellerId) return;
    const updated = await StorageService.updateSellerPassword(currentSession.sellerId, newPassword);
    setSellers(updated);
    const updatedSession: UserSession = { ...currentSession, mustChangePassword: false };
    StorageService.savePersistedSession(updatedSession);
    setCurrentSession(updatedSession);
  };

  const handleResetSellerPassword = async (sellerId: string, newProvisional: string) => {
    const updated = await StorageService.resetSellerProvisionalPassword(sellerId, newProvisional);
    setSellers(updated);
  };

  const handleLogout = () => {
    StorageService.savePersistedSession(null);
    setCurrentSession(null);
    setShowRoleModal(false);
  };

  // Switch role session
  const selectRoleSession = (role: UserRole, seller?: Seller) => {
    let session: UserSession;
    if (role === 'gestor') {
      session = {
        role: 'gestor',
        name: 'Carlos Andrade',
        email: 'carlos.andrade@vortexvendas.com.br',
      };
    } else if (seller) {
      session = {
        role: 'vendedor',
        sellerId: seller.id,
        name: seller.name,
        email: seller.email,
        avatar: seller.avatarUrl,
        mustChangePassword: seller.mustChangePassword,
      };
    } else {
      return;
    }
    StorageService.savePersistedSession(session);
    setCurrentSession(session);
    setShowRoleModal(false);
  };

  // Pending tasks count
  const pendingTasksCount = currentSession
    ? tasks.filter(
        (t) => !t.completed && (currentSession.role === 'gestor' || t.sellerId === currentSession.sellerId)
      ).length
    : 0;

  if (!currentSession) {
    return (
      <LoginView
        sellers={sellers}
        onLoginSuccess={(session) => {
          StorageService.savePersistedSession(session);
          setCurrentSession(session);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* GMP Quota Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-xs">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Bar Contract: 3 Zones */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap">
              Vortex CRM
            </span>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded tracking-wide ${
                currentSession.role === 'gestor'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {currentSession.role === 'gestor' ? 'Acesso Gestor' : 'Acesso Vendedor'}
            </span>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean hover) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'kanban'
                  ? 'bg-neutral-100 text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Funil Kanban</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-neutral-100 text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tarefas</span>
              {pendingTasksCount > 0 && (
                <span className="font-mono text-[10px] bg-neutral-900 text-white px-1.5 py-0.2 rounded-full">
                  {pendingTasksCount}
                </span>
              )}
            </button>

            {/* Radius Propecting with Google Maps */}
            <button
              onClick={() => setActiveTab('radius_search')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'radius_search'
                  ? 'bg-neutral-100 text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Prospecção por Raio</span>
            </button>

            {/* Gestor Exclusive Menus */}
            {currentSession.role === 'gestor' && (
              <>
                <button
                  onClick={() => setActiveTab('sellers')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'sellers'
                      ? 'bg-neutral-100 text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Vendedores</span>
                </button>

                <button
                  onClick={() => setActiveTab('clients')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'clients'
                      ? 'bg-neutral-100 text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Clientes</span>
                </button>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'dashboard'
                      ? 'bg-neutral-100 text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: 1-2 Primary Actions (User/Role Switcher) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRoleModal(true)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-xs text-left"
              title="Trocar perfil entre Gestor e Vendedores"
            >
              {currentSession.role === 'gestor' ? (
                <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
              ) : currentSession.avatar ? (
                <img
                  src={currentSession.avatar}
                  alt={currentSession.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentSession.name.charAt(0)}
                </div>
              )}

              <div className="hidden sm:block leading-tight">
                <span className="font-semibold text-neutral-900 block truncate max-w-[120px]">
                  {currentSession.name}
                </span>
                <span className="text-[10px] text-neutral-400 capitalize">
                  {currentSession.role === 'gestor' ? 'Gestor Comercial' : 'Vendedor'}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </button>

            {/* Supabase Database Connection Modal Trigger */}
            <button
              onClick={() => setShowDbModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-xs font-semibold text-neutral-700"
              title="Configurações e Sincronização do Banco de Dados Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Banco Supabase</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Sair do sistema (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-neutral-100 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'kanban' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600'
            }`}
          >
            Funil Kanban
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'tasks' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600'
            }`}
          >
            Tarefas ({pendingTasksCount})
          </button>
          <button
            onClick={() => setActiveTab('radius_search')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'radius_search' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600'
            }`}
          >
            Prospecção Raio
          </button>
          {currentSession.role === 'gestor' && (
            <>
              <button
                onClick={() => setActiveTab('sellers')}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
                  activeTab === 'sellers' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600'
                }`}
              >
                Vendedores
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
                  activeTab === 'clients' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600'
                }`}
              >
                Clientes
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
                  activeTab === 'dashboard' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600'
                }`}
              >
                Dashboard
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'kanban' && (
          <FunnelKanban
            deals={deals}
            sellers={sellers}
            clients={clients}
            currentSession={currentSession}
            onUpdateStage={handleUpdateDealStage}
            onOpenDealModal={(deal, initialStage) =>
              setDealModalState({ isOpen: true, deal: deal || null, initialStage: initialStage || 'prospeccao' })
            }
            onOpenPhoneModal={(clientId, clientName, currentPhone) =>
              setPhoneModalState({ isOpen: true, clientId, clientName, phone: currentPhone })
            }
            onOpenTaskModal={(dealId) => setTaskModalState({ isOpen: true, dealId })}
          />
        )}

        {activeTab === 'tasks' && (
          <SellerTasksView
            tasks={tasks}
            deals={deals}
            clients={clients}
            sellers={sellers}
            currentSession={currentSession}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onOpenTaskModal={() => setTaskModalState({ isOpen: true })}
            onOpenPhoneModal={(clientId, clientName, currentPhone) =>
              setPhoneModalState({ isOpen: true, clientId, clientName, phone: currentPhone })
            }
          />
        )}

        {activeTab === 'radius_search' && (
          <CnaeRadiusSearch
            sellers={sellers}
            onImportCompany={handleImportFromRadiusSearch}
          />
        )}

        {activeTab === 'sellers' && currentSession.role === 'gestor' && (
          <SellerManagementView
            sellers={sellers}
            deals={deals}
            onSaveSeller={handleSaveSeller}
            onNavigateToSellerKanban={(sellerId) => {
              setActiveTab('kanban');
            }}
            onResetPassword={handleResetSellerPassword}
          />
        )}

        {activeTab === 'clients' && currentSession.role === 'gestor' && (
          <ClientRegistrationView
            clients={clients}
            sellers={sellers}
            onSaveClient={handleSaveClient}
            onOpenPhoneModal={(clientId, clientName, currentPhone) =>
              setPhoneModalState({ isOpen: true, clientId, clientName, phone: currentPhone })
            }
            onNavigateToRadiusSearch={() => setActiveTab('radius_search')}
          />
        )}

        {activeTab === 'dashboard' && currentSession.role === 'gestor' && (
          <ManagerDashboardView
            deals={deals}
            sellers={sellers}
            tasks={tasks}
            logs={logs}
            onNavigateToSeller={() => setActiveTab('kanban')}
          />
        )}
      </main>

      {/* Role / Login Switcher Modal (Two Logins: Gestor & Vendedor) */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Alternar Acesso / Login</h3>
                <p className="text-xs text-neutral-500">Selecione o perfil para navegar no CRM</p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Option 1: Gestor */}
              <div
                onClick={() => selectRoleSession('gestor')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  currentSession.role === 'gestor'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      currentSession.role === 'gestor'
                        ? 'bg-white/10 text-white'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Carlos Andrade</div>
                    <div
                      className={`text-xs ${
                        currentSession.role === 'gestor' ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      Gestor Comercial (Diretoria)
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    currentSession.role === 'gestor'
                      ? 'bg-white/20 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  Acesso Total
                </span>
              </div>

              {/* Option 2: Vendedores */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Ou entrar como Vendedor:
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {sellers.map((seller) => {
                    const isSelected =
                      currentSession.role === 'vendedor' && currentSession.sellerId === seller.id;

                    return (
                      <div
                        key={seller.id}
                        onClick={() => selectRoleSession('vendedor', seller)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-2xs'
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {seller.avatarUrl ? (
                            <img
                              src={seller.avatarUrl}
                              alt={seller.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {seller.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-xs text-neutral-900">{seller.name}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">
                              Meta: R$ {seller.monthlyTarget.toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {isSelected ? 'Ativo' : 'Acessar'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Phone Modal (Required Feature) */}
      <EditPhoneModal
        isOpen={phoneModalState.isOpen}
        onClose={() => setPhoneModalState((prev) => ({ ...prev, isOpen: false }))}
        clientId={phoneModalState.clientId}
        clientName={phoneModalState.clientName}
        currentPhone={phoneModalState.phone}
        onSavePhone={handleSavePhone}
      />

      {/* Deal Modal */}
      <DealModal
        isOpen={dealModalState.isOpen}
        onClose={() => setDealModalState((prev) => ({ ...prev, isOpen: false }))}
        deal={dealModalState.deal}
        initialStage={dealModalState.initialStage}
        sellers={sellers}
        clients={clients}
        currentSellerId={currentSession.sellerId}
        onSaveDeal={handleSaveDeal}
        onOpenPhoneModal={(clientId, clientName, phone) => {
          setDealModalState((prev) => ({ ...prev, isOpen: false }));
          setPhoneModalState({ isOpen: true, clientId, clientName, phone });
        }}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalState.isOpen}
        onClose={() => setTaskModalState({ isOpen: false })}
        deals={deals}
        sellers={sellers}
        currentSellerId={currentSession.sellerId}
        defaultDealId={taskModalState.dealId}
        onSaveTask={handleSaveTask}
      />

      {/* Mandatory First Access Password Change Modal */}
      <ChangePasswordModal
        isOpen={Boolean(currentSession.mustChangePassword)}
        session={currentSession}
        onPasswordChanged={handlePasswordChanged}
      />

      {/* Database Connection & Migration Modal */}
      <DatabaseConfigModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
        onDataMigrated={loadData}
      />
    </div>
  );
}
