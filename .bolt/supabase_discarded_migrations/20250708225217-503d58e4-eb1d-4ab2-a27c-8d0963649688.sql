-- Criar tabela de gastos fixos recorrentes
CREATE TABLE public.fixed_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  due_date INTEGER NOT NULL, -- dia do mês (1-31)
  recurrence TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  is_paid BOOLEAN NOT NULL DEFAULT false,
  last_paid_date DATE,
  next_due_date DATE NOT NULL,
  emoji TEXT DEFAULT '💳',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de entradas recorrentes
CREATE TABLE public.recurring_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly', -- monthly, weekly, biweekly, yearly
  receive_date INTEGER NOT NULL, -- dia do mês ou da semana
  next_receive_date DATE NOT NULL,
  emoji TEXT DEFAULT '💰',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de lembretes e notificações
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL, -- expense_due, goal_progress, budget_limit, etc
  reference_id UUID, -- ID da despesa, meta, etc que gerou o lembrete
  remind_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de transcrições de voz
CREATE TABLE public.voice_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_audio_url TEXT,
  transcribed_text TEXT,
  parsed_amount NUMERIC,
  parsed_category TEXT,
  parsed_description TEXT,
  expense_id UUID, -- ID da despesa criada a partir desta nota
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para fixed_expenses
CREATE POLICY "Users can view their own fixed expenses" 
ON public.fixed_expenses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fixed expenses" 
ON public.fixed_expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fixed expenses" 
ON public.fixed_expenses FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fixed expenses" 
ON public.fixed_expenses FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para recurring_income
CREATE POLICY "Users can view their own recurring income" 
ON public.recurring_income FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring income" 
ON public.recurring_income FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring income" 
ON public.recurring_income FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring income" 
ON public.recurring_income FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para reminders
CREATE POLICY "Users can view their own reminders" 
ON public.reminders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
ON public.reminders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
ON public.reminders FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
ON public.reminders FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para voice_notes
CREATE POLICY "Users can view their own voice notes" 
ON public.voice_notes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice notes" 
ON public.voice_notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice notes" 
ON public.voice_notes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice notes" 
ON public.voice_notes FOR DELETE 
USING (auth.uid() = user_id);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_fixed_expenses_updated_at
  BEFORE UPDATE ON public.fixed_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_income_updated_at
  BEFORE UPDATE ON public.recurring_income
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar próximas datas de vencimento
CREATE OR REPLACE FUNCTION public.calculate_next_due_date(
  current_date DATE,
  due_day INTEGER,
  recurrence TEXT
) RETURNS DATE AS $$
DECLARE
  next_date DATE;
BEGIN
  IF recurrence = 'monthly' THEN
    -- Se já passou do dia no mês atual, vai para o próximo mês
    next_date := DATE(EXTRACT(YEAR FROM current_date) || '-' || EXTRACT(MONTH FROM current_date) || '-' || due_day);
    IF next_date <= current_date THEN
      next_date := next_date + INTERVAL '1 month';
    END IF;
  ELSIF recurrence = 'yearly' THEN
    next_date := DATE(EXTRACT(YEAR FROM current_date) || '-' || EXTRACT(MONTH FROM current_date) || '-' || due_day);
    IF next_date <= current_date THEN
      next_date := next_date + INTERVAL '1 year';
    END IF;
  END IF;
  
  RETURN next_date;
END;
$$ LANGUAGE plpgsql;