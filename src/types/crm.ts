export type UserRole = 'gestor' | 'vendedor';

export interface UserSession {
  role: UserRole;
  sellerId?: string; // If role is vendedor, points to Seller
  name: string;
  email: string;
  avatar?: string;
  mustChangePassword?: boolean;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  monthlyTarget: number; // Meta mensal em R$
  commissionRate: number; // Porcentagem de comissão, ex: 5%
  active: boolean;
  avatarUrl?: string;
  password?: string; // Senha cadastrada
  temporaryPassword?: string; // Senha provisória gerada pelo gestor
  mustChangePassword?: boolean; // Se precisa alterar no primeiro acesso
  createdAt: string;
}

export interface ClientAddress {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  lat?: number;
  lng?: number;
}

export interface Client {
  id: string;
  cnpj?: string;
  companyName: string; // Razão Social
  tradeName: string; // Nome Fantasia
  contactName: string;
  phone: string; // Telefone do cliente (WhatsApp / fixo)
  email: string;
  segment: string;
  address: ClientAddress;
  notes?: string;
  createdAt: string;
}

export type FunnelStage =
  | 'prospeccao'
  | 'qualificacao'
  | 'proposta'
  | 'negociacao'
  | 'ganho'
  | 'perdido';

export interface FunnelStageConfig {
  id: FunnelStage;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export interface Deal {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  sellerId: string;
  title: string;
  value: number; // Valor em R$
  stage: FunnelStage;
  probability: number; // 0 a 100
  priority: 'baixa' | 'media' | 'alta';
  expectedCloseDate: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskType = 'ligacao' | 'whatsapp' | 'reuniao' | 'email' | 'proposta';

export interface Task {
  id: string;
  dealId?: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  sellerId: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  type: TaskType;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  dealId?: string;
  dealTitle?: string;
  sellerId: string;
  sellerName: string;
  type: 'stage_change' | 'phone_update' | 'task_completed' | 'deal_created' | 'note_added';
  description: string;
  timestamp: string;
}
