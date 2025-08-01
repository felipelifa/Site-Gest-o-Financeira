-- Ativar premium para assinaturas com pagamentos aprovados
-- Baseado nos logs, sabemos que houve pagamentos aprovados

-- Atualizar as assinaturas mais recentes para approved
UPDATE subscriptions 
SET status = 'approved', 
    expires_at = CASE 
        WHEN plan_type = 'yearly' THEN NOW() + INTERVAL '1 year'
        ELSE NOW() + INTERVAL '1 month'
    END,
    updated_at = NOW()
WHERE user_id = 'a81b222a-08d5-4506-bfb4-6b3b5eab72dc' 
  AND status = 'pending'
  AND created_at >= '2025-07-16'::date;

-- Ativar premium no perfil do usuário
UPDATE profiles 
SET is_premium = TRUE,
    subscription_status = 'active'
WHERE id = 'a81b222a-08d5-4506-bfb4-6b3b5eab72dc';