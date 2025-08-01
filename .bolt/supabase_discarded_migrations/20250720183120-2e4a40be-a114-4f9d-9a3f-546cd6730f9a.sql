-- Atualizar a função create-payment para suportar orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  mercadopago_preference_id TEXT,
  amount NUMERIC NOT NULL DEFAULT 29.90,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending',
  product_name TEXT DEFAULT 'DinDin Mágico - Acesso Vitalício',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies - orders são públicas para permitir criação sem autenticação
CREATE POLICY IF NOT EXISTS "allow_all_orders" ON public.orders
  FOR ALL
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();