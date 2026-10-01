-- ==============================================================================
-- SCHEMA DO SISTEMA DE FUNIL DE VENDAS CRM (SUPABASE / POSTGRESQL)
-- Inclui tabelas, índices, triggers e Políticas de Armazenamento / RLS Ativadas
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CRIAÇÃO DAS TABELAS
-- ==============================================================================

-- 2.1 Tabela de Vendedores (sellers)
CREATE TABLE IF NOT EXISTS public.sellers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    monthly_target NUMERIC(14,2) DEFAULT 0,
    commission_rate NUMERIC(5,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    password TEXT,
    temporary_password TEXT,
    must_change_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.2 Tabela de Clientes (clients)
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cnpj TEXT,
    company_name TEXT NOT NULL,
    trade_name TEXT,
    contact_name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    segment TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.3 Tabela de Oportunidades do Funil (deals)
CREATE TABLE IF NOT EXISTS public.deals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    seller_id TEXT REFERENCES public.sellers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    value NUMERIC(14,2) DEFAULT 0 NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('prospeccao', 'qualificacao', 'proposta', 'negociacao', 'ganho', 'perdido')),
    probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta')),
    expected_close_date DATE,
    lost_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.4 Tabela de Tarefas e Agendamentos (tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    deal_id TEXT REFERENCES public.deals(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
    client_name TEXT,
    client_phone TEXT,
    seller_id TEXT REFERENCES public.sellers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ligacao', 'whatsapp', 'reuniao', 'email', 'proposta')),
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.5 Tabela de Histórico de Atividades (activity_logs)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    deal_id TEXT REFERENCES public.deals(id) ON DELETE CASCADE,
    deal_title TEXT,
    seller_id TEXT,
    seller_name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 3. ÍNDICES DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_seller_id ON public.deals(seller_id);
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON public.deals(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_seller_id ON public.tasks(seller_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);

-- ==============================================================================
-- 4. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) - POLÍTICAS DE ACESSO
-- ==============================================================================
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 4.1 Políticas para public.sellers
-- Leitura permitida para usuários autenticados e anônimos (ou API Key da aplicação)
CREATE POLICY "Permitir leitura de vendedores"
    ON public.sellers FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de vendedores"
    ON public.sellers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de vendedores"
    ON public.sellers FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir deleção de vendedores"
    ON public.sellers FOR DELETE
    USING (true);

-- 4.2 Políticas para public.clients
CREATE POLICY "Permitir leitura de clientes"
    ON public.clients FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de clientes"
    ON public.clients FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de clientes (inclusive telefone)"
    ON public.clients FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir deleção de clientes"
    ON public.clients FOR DELETE
    USING (true);

-- 4.3 Políticas para public.deals
CREATE POLICY "Permitir leitura de oportunidades"
    ON public.deals FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de oportunidades"
    ON public.deals FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de oportunidades e etapas"
    ON public.deals FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir deleção de oportunidades"
    ON public.deals FOR DELETE
    USING (true);

-- 4.4 Políticas para public.tasks
CREATE POLICY "Permitir leitura de tarefas"
    ON public.tasks FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de tarefas"
    ON public.tasks FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir atualização e conclusão de tarefas"
    ON public.tasks FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir remoção de tarefas"
    ON public.tasks FOR DELETE
    USING (true);

-- 4.5 Políticas para public.activity_logs
CREATE POLICY "Permitir leitura de logs de atividades"
    ON public.activity_logs FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de logs de atividades"
    ON public.activity_logs FOR INSERT
    WITH CHECK (true);

-- ==============================================================================
-- 5. POLÍTICAS DE ARMAZENAMENTO DE ARQUIVOS (STORAGE BUCKETS)
-- ==============================================================================
-- Criação do Bucket para anexos, propostas e fotos de vendedores
INSERT INTO storage.buckets (id, name, public)
VALUES ('crm-arquivos', 'crm-arquivos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas no schema storage.objects
CREATE POLICY "Permitir visualização pública de arquivos do CRM"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'crm-arquivos');

CREATE POLICY "Permitir upload de arquivos no bucket do CRM"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'crm-arquivos');

CREATE POLICY "Permitir atualização de arquivos no bucket do CRM"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'crm-arquivos')
    WITH CHECK (bucket_id = 'crm-arquivos');

CREATE POLICY "Permitir exclusão de arquivos no bucket do CRM"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'crm-arquivos');
