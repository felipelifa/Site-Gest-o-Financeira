# Scripts de Build para DinDin Mágico Standalone

## Para usar localmente:

1. **Build da versão standalone (sem login):**
```bash
npm run build:standalone
```

2. **Para testar localmente:**
```bash
npm run preview:standalone
```

3. **Para mobile (após fazer o build):**
```bash
# Primeira vez
npx cap init
npx cap add android
npx cap add ios

# Sempre após mudanças
npm run build:standalone
npx cap sync
npx cap run android
# ou
npx cap run ios
```

## Arquivos importantes:

- `src/standalone.tsx` - Entry point da versão standalone
- `src/StandaloneApp.tsx` - App principal sem autenticação
- `src/contexts/LocalDataContext.tsx` - Gerenciamento de dados local
- `standalone.html` - HTML da versão standalone
- `vite.standalone.config.ts` - Configuração do Vite para standalone

## Scripts a adicionar no package.json:

```json
{
  "scripts": {
    "build:standalone": "vite build --config vite.standalone.config.ts",
    "preview:standalone": "vite preview --config vite.standalone.config.ts",
    "cap:sync": "npm run build:standalone && npx cap sync",
    "cap:android": "npm run cap:sync && npx cap run android",
    "cap:ios": "npm run cap:sync && npx cap run ios"
  }
}
```

## Funcionalidades incluídas na versão standalone:

✅ Controle de gastos
✅ Categorização automática  
✅ Histórico de transações
✅ Metas financeiras
✅ Orçamento mensal
✅ Gastos fixos/recorrentes
✅ Renda recorrente
✅ Calendário financeiro
✅ Sistema de conquistas
✅ Comandos de voz
✅ Interface responsiva
✅ Dados salvos no localStorage
✅ PWA (Progressive Web App)
✅ Funcionamento offline

❌ Login/autenticação
❌ Sincronização na nuvem
❌ Backup automático