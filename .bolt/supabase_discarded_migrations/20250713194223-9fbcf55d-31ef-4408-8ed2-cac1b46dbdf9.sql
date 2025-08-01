-- Adicionar secret para OpenAI API
-- Esta migração apenas documenta que precisamos configurar o secret OPENAI_API_KEY
-- Execute no painel do Supabase: Configurações > Edge Functions > Secrets
-- Nome: OPENAI_API_KEY
-- Valor: sua_chave_da_openai

-- A chave será necessária para a funcionalidade de transcrição de voz
SELECT 'Secret OPENAI_API_KEY deve ser configurada no painel do Supabase' as mensagem;