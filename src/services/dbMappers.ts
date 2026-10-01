import { Seller, Client, Deal, Task, ActivityLog } from '../types/crm';

// Database row interfaces matching PostgreSQL tables exactly
export interface DbSeller {
  id: string;
  name: string;
  email: string;
  phone: string;
  monthly_target: number;
  commission_rate: number;
  active: boolean;
  avatar_url?: string;
  password?: string;
  temporary_password?: string;
  must_change_password?: boolean;
  created_at?: string;
}

export interface DbClient {
  id: string;
  cnpj?: string;
  company_name: string;
  trade_name: string;
  contact_name: string;
  phone: string;
  email?: string;
  segment?: string;
  address?: Record<string, unknown>;
  notes?: string;
  created_at?: string;
}

export interface DbDeal {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  seller_id?: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  priority: string;
  expected_close_date?: string;
  lost_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbTask {
  id: string;
  deal_id?: string;
  client_id?: string;
  client_name?: string;
  client_phone?: string;
  seller_id: string;
  title: string;
  description?: string;
  due_date: string;
  type: string;
  completed: boolean;
  completed_at?: string;
  created_at?: string;
}

export interface DbActivityLog {
  id: string;
  deal_id?: string;
  deal_title?: string;
  seller_id?: string;
  seller_name: string;
  type: string;
  description: string;
  timestamp: string;
}

// ==========================================
// SELLERS MAPPERS
// ==========================================
export function sellerToDb(s: Seller): DbSeller {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    monthly_target: s.monthlyTarget ?? 0,
    commission_rate: s.commissionRate ?? 0,
    active: s.active ?? true,
    avatar_url: s.avatarUrl || undefined,
    password: s.password || undefined,
    temporary_password: s.temporaryPassword || undefined,
    must_change_password: s.mustChangePassword ?? false,
    created_at: s.createdAt || new Date().toISOString(),
  };
}

export function dbToSeller(r: Record<string, any>): Seller {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone || '',
    monthlyTarget: Number(r.monthly_target ?? 0),
    commissionRate: Number(r.commission_rate ?? 0),
    active: Boolean(r.active),
    avatarUrl: r.avatar_url || undefined,
    password: r.password || undefined,
    temporaryPassword: r.temporary_password || undefined,
    mustChangePassword: Boolean(r.must_change_password),
    createdAt: r.created_at || new Date().toISOString(),
  };
}

// ==========================================
// CLIENTS MAPPERS
// ==========================================
export function clientToDb(c: Client): DbClient {
  return {
    id: c.id,
    cnpj: c.cnpj || undefined,
    company_name: c.companyName || c.tradeName || 'Cliente sem nome',
    trade_name: c.tradeName || c.companyName || 'Cliente',
    contact_name: c.contactName || '',
    phone: c.phone || '',
    email: c.email || undefined,
    segment: c.segment || undefined,
    address: (c.address as unknown as Record<string, unknown>) || {},
    notes: c.notes || undefined,
    created_at: c.createdAt || new Date().toISOString(),
  };
}

export function dbToClient(r: Record<string, any>): Client {
  return {
    id: r.id,
    cnpj: r.cnpj || undefined,
    companyName: r.company_name || r.trade_name || '',
    tradeName: r.trade_name || r.company_name || '',
    contactName: r.contact_name || '',
    phone: r.phone || '',
    email: r.email || '',
    segment: r.segment || 'Geral',
    address: (r.address as any) || undefined,
    notes: r.notes || '',
    createdAt: r.created_at || new Date().toISOString(),
  };
}

// ==========================================
// DEALS MAPPERS
// ==========================================
export function dealToDb(d: Deal): DbDeal {
  return {
    id: d.id,
    client_id: d.clientId,
    client_name: d.clientName,
    client_phone: d.clientPhone,
    seller_id: d.sellerId || undefined,
    title: d.title,
    value: Number(d.value) || 0,
    stage: d.stage,
    probability: Number(d.probability) || 50,
    priority: d.priority || 'media',
    expected_close_date: d.expectedCloseDate || undefined,
    lost_reason: d.lostReason || undefined,
    created_at: d.createdAt || new Date().toISOString(),
    updated_at: d.updatedAt || new Date().toISOString(),
  };
}

export function dbToDeal(r: Record<string, any>): Deal {
  return {
    id: r.id,
    clientId: r.client_id,
    clientName: r.client_name,
    clientPhone: r.client_phone,
    sellerId: r.seller_id,
    title: r.title,
    value: Number(r.value) || 0,
    stage: r.stage,
    probability: Number(r.probability) || 50,
    priority: r.priority || 'media',
    expectedCloseDate: r.expected_close_date || undefined,
    lostReason: r.lost_reason || undefined,
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  };
}

// ==========================================
// TASKS MAPPERS
// ==========================================
export function taskToDb(t: Task): DbTask {
  return {
    id: t.id,
    deal_id: t.dealId || undefined,
    client_id: t.clientId || undefined,
    client_name: t.clientName || undefined,
    client_phone: t.clientPhone || undefined,
    seller_id: t.sellerId,
    title: t.title,
    description: t.description || undefined,
    due_date: t.dueDate,
    type: t.type,
    completed: Boolean(t.completed),
    completed_at: t.completedAt || undefined,
    created_at: t.createdAt || new Date().toISOString(),
  };
}

export function dbToTask(r: Record<string, any>): Task {
  return {
    id: r.id,
    dealId: r.deal_id || undefined,
    clientId: r.client_id || undefined,
    clientName: r.client_name || undefined,
    clientPhone: r.client_phone || undefined,
    sellerId: r.seller_id,
    title: r.title,
    description: r.description || '',
    dueDate: r.due_date,
    type: r.type,
    completed: Boolean(r.completed),
    completedAt: r.completed_at || undefined,
    createdAt: r.created_at || new Date().toISOString(),
  };
}

// ==========================================
// ACTIVITY LOGS MAPPERS
// ==========================================
export function logToDb(l: ActivityLog): DbActivityLog {
  return {
    id: l.id,
    deal_id: l.dealId || undefined,
    deal_title: l.dealTitle || undefined,
    seller_id: l.sellerId || undefined,
    seller_name: l.sellerName,
    type: l.type,
    description: l.description,
    timestamp: l.timestamp || new Date().toISOString(),
  };
}

export function dbToLog(r: Record<string, any>): ActivityLog {
  return {
    id: r.id,
    dealId: r.deal_id || undefined,
    dealTitle: r.deal_title || undefined,
    sellerId: r.seller_id || undefined,
    sellerName: r.seller_name,
    type: r.type,
    description: r.description,
    timestamp: r.timestamp || new Date().toISOString(),
  };
}
