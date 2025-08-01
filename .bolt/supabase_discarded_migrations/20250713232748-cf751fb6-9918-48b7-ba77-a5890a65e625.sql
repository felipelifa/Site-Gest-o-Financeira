-- Limpar dados das tabelas recorrentes e fixas para o usuário
DELETE FROM recurring_income WHERE user_id = '7c8d54d7-d3b6-421b-a65a-8024c1aa556b';
DELETE FROM fixed_expenses WHERE user_id = '7c8d54d7-d3b6-421b-a65a-8024c1aa556b';