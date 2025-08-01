/*
  # Integração com Kiwify

  1. Nova tabela
    - `kiwify_customers` - Armazena dados dos clientes do Kiwify
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `kiwify_customer_id` (text)
      - `name` (text)
      - `last_order_id` (text)
      - `last_purchase_date` (timestamp)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Atualizações na tabela profiles
    - Adicionar `kiwify_customer_id` (text)
    - Adicionar `kiwify_order_id` (text)

  3. Atualizações na tabela subscriptions
    - Adicionar `kiwify_order_id` (text)

  4. Segurança
    - Enable RLS na nova tabela
    - Políticas para acesso aos dados
*/

-- Criar tabela para clientes do Kiwify
CREATE TABLE IF NOT EXISTS public.kiwify_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  kiwify_customer_id TEXT,
  name TEXT,
  last_order_id TEXT,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar campos do Kiwify na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kiwify_customer_id TEXT,
ADD COLUMN IF NOT EXISTS kiwify_order_id TEXT;

-- Adicionar campo do Kiwify na tabela subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS kiwify_order_id TEXT;

-- Enable RLS
ALTER TABLE public.kiwify_customers ENABLE ROW LEVEL SECURITY;

-- Políticas para kiwify_customers (acesso público para webhooks)
CREATE POLICY IF NOT EXISTS "Allow public read access to kiwify_customers" 
ON public.kiwify_customers 
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Allow public insert access to kiwify_customers" 
ON public.kiwify_customers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public update access to kiwify_customers" 
ON public.kiwify_customers 
FOR UPDATE 
USING (true);

-- Trigger para updated_at
CREATE TRIGGER IF NOT EXISTS update_kiwify_customers_updated_at
  BEFORE UPDATE ON public.kiwify_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_kiwify_customers_email ON public.kiwify_customers(email);
CREATE INDEX IF NOT EXISTS idx_kiwify_customers_kiwify_id ON public.kiwify_customers(kiwify_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_kiwify_customer_id ON public.profiles(kiwify_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_kiwify_order_id ON public.subscriptions(kiwify_order_id);