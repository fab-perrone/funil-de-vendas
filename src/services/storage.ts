import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Seller, Client, Deal, Task, ActivityLog, FunnelStage, UserSession } from '../types/crm';
import {
  sellerToDb,
  dbToSeller,
  clientToDb,
  dbToClient,
  dealToDb,
  dbToDeal,
  taskToDb,
  dbToTask,
  logToDb,
  dbToLog,
} from './dbMappers';

// Initial Seed Data with realistic Brazilian B2B leads and sellers
const INITIAL_SELLERS: Seller[] = [
  {
    id: 'sel_1',
    name: 'Mariana Souza',
    email: 'mariana.souza@vortexvendas.com.br',
    phone: '(11) 98765-4321',
    monthlyTarget: 150000,
    commissionRate: 4.5,
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    temporaryPassword: 'Vendedor@2026',
    mustChangePassword: true,
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'sel_2',
    name: 'Rodrigo Lima',
    email: 'rodrigo.lima@vortexvendas.com.br',
    phone: '(11) 97654-3210',
    monthlyTarget: 180000,
    commissionRate: 5.0,
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    password: 'senha123',
    mustChangePassword: false,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'sel_3',
    name: 'Camila Duarte',
    email: 'camila.duarte@vortexvendas.com.br',
    phone: '(21) 99876-5432',
    monthlyTarget: 120000,
    commissionRate: 4.0,
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    temporaryPassword: 'Vendedor@2026',
    mustChangePassword: true,
    createdAt: '2026-02-01T14:00:00.000Z',
  },
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_1',
    cnpj: '06.990.590/0001-23',
    companyName: 'TechLog Soluções em Logística S.A.',
    tradeName: 'TechLog Brasil',
    contactName: 'Eduardo Martins (Diretor de Operações)',
    phone: '(11) 98112-3344',
    email: 'eduardo.martins@techlog.com.br',
    segment: 'Logística & Transportes',
    address: {
      logradouro: 'Avenida das Nações Unidas',
      numero: '14401',
      complemento: 'Torre Sucupira, 18º Andar',
      bairro: 'Chácara Santo Antônio',
      municipio: 'São Paulo',
      uf: 'SP',
      cep: '04794-000',
      lat: -23.6267,
      lng: -46.7081,
    },
    notes: 'Cliente interessado na automação da frota de 45 carretas para o corredor Sudeste.',
    createdAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'cli_2',
    cnpj: '12.345.678/0001-90',
    companyName: 'InovaHealth Serviços Hospitalares Ltda',
    tradeName: 'InovaHealth Diagnósticos',
    contactName: 'Dra. Beatriz Fontana (Superintendente Médica)',
    phone: '(11) 97223-4455',
    email: 'beatriz.fontana@inovahealth.med.br',
    segment: 'Saúde & Medicina',
    address: {
      logradouro: 'Rua Bela Cintra',
      numero: '2150',
      bairro: 'Consolação',
      municipio: 'São Paulo',
      uf: 'SP',
      cep: '01415-002',
      lat: -23.5583,
      lng: -46.6631,
    },
    notes: 'Rede de 6 clínicas laboratoriais. Busca modernização de prontuários e agendamento via API.',
    createdAt: '2026-01-20T14:30:00.000Z',
  },
  {
    id: 'cli_3',
    cnpj: '33.444.555/0001-01',
    companyName: 'Metalúrgica Paulista de Precisão S.A.',
    tradeName: 'MetalPaulista',
    contactName: 'Carlos Silveira (Gerente de Suprimentos)',
    phone: '(19) 98877-6655',
    email: 'carlos.silveira@metalpaulista.ind.br',
    segment: 'Indústria Metalmecânica',
    address: {
      logradouro: 'Rodovia Dom Pedro I',
      numero: 'KM 132',
      bairro: 'Distrito Industrial',
      municipio: 'Campinas',
      uf: 'SP',
      cep: '13080-970',
      lat: -22.8423,
      lng: -47.0398,
    },
    notes: 'Fornecedora de peças usinadas para o setor automotivo e agrícola.',
    createdAt: '2026-02-05T11:00:00.000Z',
  },
  {
    id: 'cli_4',
    cnpj: '44.555.666/0001-88',
    companyName: 'AgroSul Cooperativa Agroindustrial',
    tradeName: 'AgroSul',
    contactName: 'Fernando Albuquerque (Diretor Comercial)',
    phone: '(41) 99122-8899',
    email: 'fernando.albuquerque@agrosul.coop.br',
    segment: 'Agronegócio',
    address: {
      logradouro: 'Avenida Cândido de Abreu',
      numero: '776',
      bairro: 'Centro Cívico',
      municipio: 'Curitiba',
      uf: 'PR',
      cep: '80530-000',
      lat: -25.4194,
      lng: -49.2685,
    },
    notes: 'Cooperativa com mais de 1.200 cooperados de grãos e silagem.',
    createdAt: '2026-02-15T09:15:00.000Z',
  },
];

const INITIAL_DEALS: Deal[] = [
  {
    id: 'deal_1',
    clientId: 'cli_1',
    clientName: 'TechLog Brasil',
    clientPhone: '(11) 98112-3344',
    sellerId: 'sel_1',
    title: 'Implantação Plataforma de Gestão de Frotas V1',
    value: 85000,
    stage: 'proposta',
    probability: 60,
    priority: 'alta',
    expectedCloseDate: '2026-10-15',
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-09-20T14:00:00.000Z',
  },
  {
    id: 'deal_2',
    clientId: 'cli_2',
    clientName: 'InovaHealth',
    clientPhone: '(11) 97223-4455',
    sellerId: 'sel_2',
    title: 'Licenciamento Anual de Sistema de Diagnóstico Cloud',
    value: 120000,
    stage: 'negociacao',
    probability: 80,
    priority: 'alta',
    expectedCloseDate: '2026-10-05',
    createdAt: '2026-08-25T11:30:00.000Z',
    updatedAt: '2026-09-28T16:00:00.000Z',
  },
  {
    id: 'deal_3',
    clientId: 'cli_3',
    clientName: 'MetalPaulista',
    clientPhone: '(19) 98877-6655',
    sellerId: 'sel_3',
    title: 'Consultoria de Automação de Processos Industriais',
    value: 45000,
    stage: 'qualificacao',
    probability: 40,
    priority: 'media',
    expectedCloseDate: '2026-10-30',
    createdAt: '2026-09-02T09:00:00.000Z',
    updatedAt: '2026-09-15T08:30:00.000Z',
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk_1',
    dealId: 'deal_1',
    clientId: 'cli_1',
    clientName: 'TechLog Brasil',
    clientPhone: '(11) 98112-3344',
    sellerId: 'sel_1',
    title: 'Ligar para Eduardo Martins para alinhar minuta contratual',
    description: 'Ajustar cláusula 4.2 sobre tempo de implantação e SLA de atendimento.',
    dueDate: '2026-10-02',
    type: 'ligacao',
    completed: false,
    createdAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'tsk_2',
    dealId: 'deal_2',
    clientId: 'cli_2',
    clientName: 'InovaHealth',
    clientPhone: '(11) 97223-4455',
    sellerId: 'sel_2',
    title: 'Enviar proposta técnica revisada via WhatsApp',
    description: 'Incluir desconto progressivo de 5% no pagamento à vista acordado.',
    dueDate: '2026-10-01',
    type: 'whatsapp',
    completed: false,
    createdAt: '2026-09-29T11:30:00.000Z',
  },
  {
    id: 'tsk_3',
    dealId: 'deal_3',
    clientId: 'cli_3',
    clientName: 'MetalPaulista',
    clientPhone: '(19) 98877-6655',
    sellerId: 'sel_3',
    title: 'Reunião de alinhamento com equipe de engenharia',
    description: 'Apresentar escopo da consultoria com cases do setor automotivo.',
    dueDate: '2026-10-04',
    type: 'reuniao',
    completed: false,
    createdAt: '2026-09-30T14:00:00.000Z',
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    dealId: 'deal_1',
    dealTitle: 'Implantação Plataforma de Gestão de Frotas V1',
    sellerId: 'sel_1',
    sellerName: 'Mariana Souza',
    type: 'phone_update',
    description: 'Telefone do cliente atualizado para (11) 98112-3344',
    timestamp: '2026-09-28T09:15:00.000Z',
  },
];

const STORAGE_KEYS = {
  SELLERS: 'vortex_crm_sellers',
  CLIENTS: 'vortex_crm_clients',
  DEALS: 'vortex_crm_deals',
  TASKS: 'vortex_crm_tasks',
  LOGS: 'vortex_crm_activity_logs',
  SUPABASE_URL: 'vortex_crm_supabase_url',
  SUPABASE_KEY: 'vortex_crm_supabase_anon_key',
};

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Local storage save error:', e);
  }
}

// Global cached client instance
let cachedSupabase: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL);
  const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY);

  const url = (localUrl || envUrl || '').trim();
  const key = (localKey || envKey || '').trim();

  if (!url || !key || !url.startsWith('http') || key === 'your-anon-key') {
    return null;
  }

  if (cachedSupabase && lastUrl === url && lastKey === key) {
    return cachedSupabase;
  }

  try {
    cachedSupabase = createClient(url, key, {
      auth: { persistSession: true },
    });
    lastUrl = url;
    lastKey = key;
    return cachedSupabase;
  } catch (e) {
    console.warn('Supabase client creation error:', e);
    return null;
  }
}

export class StorageService {
  // Connection Config
  static getConnectionConfig(): { url: string; key: string; isConfigured: boolean } {
    const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
    const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';

    const url = localUrl || envUrl;
    const key = localKey || envKey;
    const isConfigured = Boolean(url && key && url.startsWith('http') && key !== 'your-anon-key');

    return { url, key, isConfigured };
  }

  static saveConnectionConfig(url: string, key: string): void {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
    cachedSupabase = null; // force re-create
  }

  static async testConnection(): Promise<{ success: boolean; message: string }> {
    const sb = getSupabaseClient();
    if (!sb) {
      return {
        success: false,
        message: 'Credenciais do Supabase não configuradas (URL ou Anon Key ausentes).',
      };
    }

    try {
      const { data, error } = await sb.from('sellers').select('id').limit(1);
      if (error) {
        return {
          success: false,
          message: `Falha na conexão: ${error.message} (Código ${error.code})`,
        };
      }
      return {
        success: true,
        message: 'Conectado com sucesso ao Supabase! Tabelas acessíveis.',
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Erro ao conectar: ${e?.message || 'Erro desconhecido'}`,
      };
    }
  }

  // ==========================================
  // MIGRAÇÃO TOTAL PARA O SUPABASE
  // ==========================================
  static async migrateAllToSupabase(): Promise<{ success: boolean; details: string[] }> {
    const sb = getSupabaseClient();
    if (!sb) {
      return {
        success: false,
        details: ['Supabase não configurado. Insira a URL e a Anon Key.'],
      };
    }

    const details: string[] = [];

    try {
      // 1. Migrate Sellers
      const sellers = await this.getSellers();
      if (sellers.length > 0) {
        const dbSellers = sellers.map(sellerToDb);
        const { error: sErr } = await sb.from('sellers').upsert(dbSellers);
        if (sErr) throw new Error(`Erro ao migrar Vendedores: ${sErr.message}`);
        details.push(`✓ ${sellers.length} vendedores migrados com sucesso.`);
      }

      // 2. Migrate Clients
      const clients = await this.getClients();
      if (clients.length > 0) {
        const dbClients = clients.map(clientToDb);
        const { error: cErr } = await sb.from('clients').upsert(dbClients);
        if (cErr) throw new Error(`Erro ao migrar Clientes: ${cErr.message}`);
        details.push(`✓ ${clients.length} clientes migrados com sucesso.`);
      }

      // 3. Migrate Deals
      const deals = await this.getDeals();
      if (deals.length > 0) {
        const dbDeals = deals.map(dealToDb);
        const { error: dErr } = await sb.from('deals').upsert(dbDeals);
        if (dErr) throw new Error(`Erro ao migrar Oportunidades: ${dErr.message}`);
        details.push(`✓ ${deals.length} oportunidades migradas com sucesso.`);
      }

      // 4. Migrate Tasks
      const tasks = await this.getTasks();
      if (tasks.length > 0) {
        const dbTasks = tasks.map(taskToDb);
        const { error: tErr } = await sb.from('tasks').upsert(dbTasks);
        if (tErr) throw new Error(`Erro ao migrar Tarefas: ${tErr.message}`);
        details.push(`✓ ${tasks.length} tarefas migradas com sucesso.`);
      }

      // 5. Migrate Activity Logs
      const logs = await this.getActivityLogs();
      if (logs.length > 0) {
        const dbLogs = logs.map(logToDb);
        const { error: lErr } = await sb.from('activity_logs').upsert(dbLogs);
        if (lErr) throw new Error(`Erro ao migrar Logs: ${lErr.message}`);
        details.push(`✓ ${logs.length} logs de atividades sincronizados.`);
      }

      return { success: true, details };
    } catch (err: any) {
      return {
        success: false,
        details: [...details, `✕ Falha: ${err?.message || 'Erro durante a migração'}`],
      };
    }
  }

  // ==========================================
  // SELLERS CRUD
  // ==========================================
  static async getSellers(): Promise<Seller[]> {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('sellers').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped = data.map(dbToSeller);
          saveLocal(STORAGE_KEYS.SELLERS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getSellers fallback:', err);
      }
    }
    return loadLocal<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
  }

  static async saveSeller(seller: Seller): Promise<Seller[]> {
    const current = await this.getSellers();
    const index = current.findIndex((s) => s.id === seller.id);
    let updated: Seller[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = seller;
    } else {
      updated = [seller, ...current];
    }
    saveLocal(STORAGE_KEYS.SELLERS, updated);

    const sb = getSupabaseClient();
    if (sb) {
      try {
        const dbRow = sellerToDb(seller);
        await sb.from('sellers').upsert([dbRow]);
      } catch (err) {
        console.warn('Supabase saveSeller sync:', err);
      }
    }
    return updated;
  }

  static async updateSellerPassword(sellerId: string, newPassword: string): Promise<Seller[]> {
    const current = await this.getSellers();
    const updated = current.map((s) =>
      s.id === sellerId
        ? {
            ...s,
            password: newPassword,
            temporaryPassword: undefined,
            mustChangePassword: false,
          }
        : s
    );
    saveLocal(STORAGE_KEYS.SELLERS, updated);

    const sb = getSupabaseClient();
    if (sb) {
      try {
        await sb
          .from('sellers')
          .update({ password: newPassword, temporary_password: null, must_change_password: false })
          .eq('id', sellerId);
      } catch (err) {
        console.warn('Supabase updateSellerPassword sync:', err);
      }
    }
    return updated;
  }

  static async resetSellerProvisionalPassword(
    sellerId: string,
    provisionalPassword: string
  ): Promise<Seller[]> {
    const current = await this.getSellers();
    const updated = current.map((s) =>
      s.id === sellerId
        ? {
            ...s,
            temporaryPassword: provisionalPassword,
            mustChangePassword: true,
          }
        : s
    );
    saveLocal(STORAGE_KEYS.SELLERS, updated);

    const sb = getSupabaseClient();
    if (sb) {
      try {
        await sb
          .from('sellers')
          .update({ temporary_password: provisionalPassword, must_change_password: true })
          .eq('id', sellerId);
      } catch (err) {
        console.warn('Supabase resetSellerProvisionalPassword sync:', err);
      }
    }
    return updated;
  }

  // Gestor credentials
  static getGestorPassword(): string {
    return loadLocal<string>('vortex_crm_gestor_pwd', 'gestor123');
  }

  static saveGestorPassword(pwd: string): void {
    saveLocal('vortex_crm_gestor_pwd', pwd);
  }

  // Active session persistence
  static getPersistedSession(): UserSession | null {
    return loadLocal<UserSession | null>('vortex_crm_active_session', null);
  }

  static savePersistedSession(session: UserSession | null): void {
    saveLocal('vortex_crm_active_session', session);
  }

  // ==========================================
  // CLIENTS CRUD
  // ==========================================
  static async getClients(): Promise<Client[]> {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('clients').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped = data.map(dbToClient);
          saveLocal(STORAGE_KEYS.CLIENTS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getClients fallback:', err);
      }
    }
    return loadLocal<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  }

  static async saveClient(client: Client): Promise<Client[]> {
    const current = await this.getClients();
    const index = current.findIndex((c) => c.id === client.id);
    let updated: Client[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = client;
    } else {
      updated = [client, ...current];
    }
    saveLocal(STORAGE_KEYS.CLIENTS, updated);

    const sb = getSupabaseClient();
    if (sb) {
      try {
        const dbRow = clientToDb(client);
        await sb.from('clients').upsert([dbRow]);
      } catch (err) {
        console.warn('Supabase saveClient sync:', err);
      }
    }
    return updated;
  }

  static async updateClientPhone(
    clientId: string,
    newPhone: string,
    sellerId: string,
    sellerName: string
  ): Promise<{ clients: Client[]; deals: Deal[]; tasks: Task[] }> {
    // 1. Update client
    const clients = await this.getClients();
    const client = clients.find((c) => c.id === clientId);
    const updatedClients = clients.map((c) => (c.id === clientId ? { ...c, phone: newPhone } : c));
    saveLocal(STORAGE_KEYS.CLIENTS, updatedClients);

    // 2. Update all deals associated with this client
    const deals = await this.getDeals();
    const updatedDeals = deals.map((d) =>
      d.clientId === clientId ? { ...d, clientPhone: newPhone, updatedAt: new Date().toISOString() } : d
    );
    saveLocal(STORAGE_KEYS.DEALS, updatedDeals);

    // 3. Update all tasks associated with this client
    const tasks = await this.getTasks();
    const updatedTasks = tasks.map((t) => (t.clientId === clientId ? { ...t, clientPhone: newPhone } : t));
    saveLocal(STORAGE_KEYS.TASKS, updatedTasks);

    // 4. Log the activity
    await this.logActivity({
      id: 'log_' + Date.now(),
      sellerId,
      sellerName,
      type: 'phone_update',
      description: `Telefone do cliente ${client?.tradeName || client?.companyName || ''} atualizado para ${newPhone}`,
      timestamp: new Date().toISOString(),
    });

    const sb = getSupabaseClient();
    if (sb) {
      try {
        await sb.from('clients').update({ phone: newPhone }).eq('id', clientId);
        await sb.from('deals').update({ client_phone: newPhone }).eq('client_id', clientId);
        await sb.from('tasks').update({ client_phone: newPhone }).eq('client_id', clientId);
      } catch (err) {
        console.warn('Supabase updateClientPhone sync:', err);
      }
    }

    return { clients: updatedClients, deals: updatedDeals, tasks: updatedTasks };
  }

  // ==========================================
  // DEALS CRUD
  // ==========================================
  static async getDeals(): Promise<Deal[]> {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('deals').select('*').order('updated_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped = data.map(dbToDeal);
          saveLocal(STORAGE_KEYS.DEALS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getDeals fallback:', err);
      }
    }
    return loadLocal<Deal[]>(STORAGE_KEYS.DEALS, INITIAL_DEALS);
  }

  static async saveDeal(deal: Deal, sellerName?: string): Promise<Deal[]> {
    const current = await this.getDeals();
    const index = current.findIndex((d) => d.id === deal.id);
    const isNew = index === -1;
    let updated: Deal[];
    if (!isNew) {
      updated = [...current];
      updated[index] = { ...deal, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...deal, updatedAt: new Date().toISOString() }, ...current];
    }
    saveLocal(STORAGE_KEYS.DEALS, updated);

    if (isNew && sellerName) {
      await this.logActivity({
        id: 'log_' + Date.now(),
        dealId: deal.id,
        dealTitle: deal.title,
        sellerId: deal.sellerId,
        sellerName,
        type: 'deal_created',
        description: `Novo negócio "${deal.title}" criado no funil (R$ ${deal.value.toLocaleString('pt-BR')})`,
        timestamp: new Date().toISOString(),
      });
    }

    const sb = getSupabaseClient();
    if (sb) {
      try {
        const dbRow = dealToDb(deal);
        await sb.from('deals').upsert([dbRow]);
      } catch (err) {
        console.warn('Supabase saveDeal sync:', err);
      }
    }
    return updated;
  }

  static async updateDealStage(
    dealId: string,
    newStage: FunnelStage,
    sellerId: string,
    sellerName: string
  ): Promise<Deal[]> {
    const current = await this.getDeals();
    const deal = current.find((d) => d.id === dealId);
    if (!deal) return current;

    const oldStage = deal.stage;
    const updated = current.map((d) =>
      d.id === dealId ? { ...d, stage: newStage, updatedAt: new Date().toISOString() } : d
    );
    saveLocal(STORAGE_KEYS.DEALS, updated);

    const stageNames: Record<FunnelStage, string> = {
      prospeccao: 'Prospecção',
      qualificacao: 'Qualificação',
      proposta: 'Proposta',
      negociacao: 'Negociação',
      ganho: 'Ganho',
      perdido: 'Perdido',
    };

    await this.logActivity({
      id: 'log_' + Date.now(),
      dealId: deal.id,
      dealTitle: deal.title,
      sellerId,
      sellerName,
      type: 'stage_change',
      description: `Negócio "${deal.title}" movido de ${stageNames[oldStage]} para ${stageNames[newStage]}`,
      timestamp: new Date().toISOString(),
    });

    const sb = getSupabaseClient();
    if (sb) {
      try {
        await sb
          .from('deals')
          .update({ stage: newStage, updated_at: new Date().toISOString() })
          .eq('id', dealId);
      } catch (err) {
        console.warn('Supabase updateDealStage sync:', err);
      }
    }

    return updated;
  }

  // ==========================================
  // TASKS CRUD
  // ==========================================
  static async getTasks(): Promise<Task[]> {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('tasks').select('*').order('due_date', { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped = data.map(dbToTask);
          saveLocal(STORAGE_KEYS.TASKS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getTasks fallback:', err);
      }
    }
    return loadLocal<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }

  static async saveTask(task: Task): Promise<Task[]> {
    const current = await this.getTasks();
    const index = current.findIndex((t) => t.id === task.id);
    let updated: Task[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = task;
    } else {
      updated = [task, ...current];
    }
    saveLocal(STORAGE_KEYS.TASKS, updated);

    const sb = getSupabaseClient();
    if (sb) {
      try {
        const dbRow = taskToDb(task);
        await sb.from('tasks').upsert([dbRow]);
      } catch (err) {
        console.warn('Supabase saveTask sync:', err);
      }
    }
    return updated;
  }

  static async toggleTaskCompleted(
    taskId: string,
    sellerId: string,
    sellerName: string
  ): Promise<Task[]> {
    const current = await this.getTasks();
    const task = current.find((t) => t.id === taskId);
    if (!task) return current;

    const newCompleted = !task.completed;
    const completedAt = newCompleted ? new Date().toISOString() : undefined;
    const updated = current.map((t) => (t.id === taskId ? { ...t, completed: newCompleted, completedAt } : t));
    saveLocal(STORAGE_KEYS.TASKS, updated);

    if (newCompleted) {
      await this.logActivity({
        id: 'log_' + Date.now(),
        dealId: task.dealId,
        sellerId,
        sellerName,
        type: 'task_completed',
        description: `Tarefa concluída: "${task.title}"`,
        timestamp: new Date().toISOString(),
      });
    }

    const sb = getSupabaseClient();
    if (sb) {
      try {
        await sb.from('tasks').update({ completed: newCompleted, completed_at: completedAt }).eq('id', taskId);
      } catch (err) {
        console.warn('Supabase toggleTask sync:', err);
      }
    }

    return updated;
  }

  static async deleteTask(taskId: string): Promise<Task[]> {
    const current = await this.getTasks();
    const updated = current.filter((t) => t.id !== taskId);
    saveLocal(STORAGE_KEYS.TASKS, updated);

    const sb = getSupabaseClient();
    if (sb) {
      try {
        await sb.from('tasks').delete().eq('id', taskId);
      } catch (err) {
        console.warn('Supabase deleteTask sync:', err);
      }
    }
    return updated;
  }

  // ==========================================
  // ACTIVITY LOGS CRUD
  // ==========================================
  static async getActivityLogs(): Promise<ActivityLog[]> {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);
        if (!error && data && data.length > 0) {
          const mapped = data.map(dbToLog);
          saveLocal(STORAGE_KEYS.LOGS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getActivityLogs fallback:', err);
      }
    }
    return loadLocal<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  }

  static async logActivity(log: ActivityLog): Promise<ActivityLog[]> {
    const current = await this.getActivityLogs();
    const updated = [log, ...current].slice(0, 100);
    saveLocal(STORAGE_KEYS.LOGS, updated);

    const sb = getSupabaseClient();
    if (sb) {
      try {
        const dbRow = logToDb(log);
        await sb.from('activity_logs').insert([dbRow]);
      } catch (err) {
        console.warn('Supabase logActivity sync:', err);
      }
    }
    return updated;
  }
}
