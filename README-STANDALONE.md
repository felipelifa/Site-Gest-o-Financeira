# DinDin Mágico - Versão Standalone

> 🎯 **Versão completa e funcional sem necessidade de login ou internet**

## ✨ O que é esta versão?

Esta é uma versão standalone (independente) do DinDin Mágico que funciona completamente offline, sem necessidade de cadastro, login ou conexão com internet. Todos os dados são salvos localmente no seu dispositivo.

## 🚀 Funcionalidades Incluídas

✅ **Controle de Gastos**
- Adicionar gastos manualmente ou por voz
- Categorização automática inteligente
- Emojis automáticos por categoria

✅ **Histórico Completo**
- Visualizar todas as transações
- Filtrar por categoria e data
- Editar e excluir gastos

✅ **Metas Financeiras**
- Criar metas de economia
- Acompanhar progresso visual
- Adicionar valores às metas

✅ **Orçamento Mensal**
- Definir orçamento por mês
- Acompanhar gastos vs orçamento
- Alertas visuais de limite

✅ **Gastos Fixos/Recorrentes**
- Cadastrar contas fixas (luz, internet, etc.)
- Controlar pagamentos mensais
- Lembrete de vencimentos

✅ **Renda Recorrente**
- Cadastrar salários e rendas
- Controle de recebimentos
- Projeções financeiras

✅ **Calendário Financeiro**
- Visualizar gastos por data
- Planejamento mensal
- Histórico visual

✅ **Sistema de Conquistas**
- Badges por marcos alcançados
- Gamificação do controle financeiro
- Motivação para economia

✅ **Interface Responsiva**
- Funciona em celular, tablet e desktop
- Design moderno e intuitivo
- Modo escuro/claro automático

## 📱 Como Instalar

### 💻 **Para Desktop (Windows/Mac/Linux)**

1. Baixe os arquivos do projeto
2. Abra o terminal na pasta do projeto
3. Execute os comandos:
```bash
npm install
npm run build:standalone
npm run preview:standalone
```
4. Acesse http://localhost:4173 no navegador
5. Para criar um atalho: vá em "Mais ferramentas" > "Criar atalho" no Chrome

### 📱 **Para Mobile (Android/iOS)**

#### Android:
1. Faça o build: `npm run build:standalone`
2. Instale o Android Studio
3. Execute: `npx cap add android`
4. Execute: `npx cap sync`
5. Execute: `npx cap run android`

#### iOS:
1. Faça o build: `npm run build:standalone`
2. Instale o Xcode (apenas Mac)
3. Execute: `npx cap add ios`
4. Execute: `npx cap sync`
5. Execute: `npx cap run ios`

### 🌐 **Como PWA (Progressive Web App)**

1. Acesse a versão web do app
2. No Chrome/Edge: clique no ícone de "instalar" na barra de endereços
3. No Safari: vá em "Compartilhar" > "Adicionar à Tela de Início"

## 🗂️ Estrutura dos Dados

Todos os dados são salvos no **localStorage** do navegador com as seguintes chaves:

- `dindin_profile` - Perfil do usuário
- `dindin_expenses` - Lista de gastos
- `dindin_goals` - Metas financeiras
- `dindin_fixed_expenses` - Gastos fixos
- `dindin_recurring_incomes` - Rendas recorrentes
- `dindin_monthly_budgets` - Orçamentos mensais

## 💾 Backup e Restauração

### Fazer Backup:
1. Abra o Console do navegador (F12)
2. Execute:
```javascript
const data = {
  profile: localStorage.getItem('dindin_profile'),
  expenses: localStorage.getItem('dindin_expenses'),
  goals: localStorage.getItem('dindin_goals'),
  fixed_expenses: localStorage.getItem('dindin_fixed_expenses'),
  recurring_incomes: localStorage.getItem('dindin_recurring_incomes'),
  monthly_budgets: localStorage.getItem('dindin_monthly_budgets')
};
console.log(JSON.stringify(data, null, 2));
```
3. Copie e salve o resultado em um arquivo .json

### Restaurar Backup:
1. Abra o Console do navegador (F12)
2. Cole o código do backup e execute:
```javascript
const data = { /* cole aqui os dados do backup */ };
Object.keys(data).forEach(key => {
  if (data[key]) {
    localStorage.setItem(`dindin_${key}`, data[key]);
  }
});
location.reload();
```

## 🔧 Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar versão de desenvolvimento
npm run dev

# Build da versão standalone
npm run build:standalone

# Testar versão standalone
npm run preview:standalone

# Build e sync para mobile
npm run cap:sync

# Executar no Android
npm run cap:android

# Executar no iOS
npm run cap:ios
```

## 📋 Requisitos do Sistema

- **Browser**: Chrome 80+, Firefox 78+, Safari 14+, Edge 80+
- **Node.js**: 18+ (apenas para desenvolvimento)
- **Android Studio**: Para build Android
- **Xcode**: Para build iOS (apenas Mac)

## 🎨 Customização

### Temas e Cores:
- Edite `src/index.css` para mudar cores
- Modifique `tailwind.config.ts` para novos temas

### Categorias:
- Adicione novas categorias em `src/components/LocalDashboard.tsx`
- Defina emojis em `getCategoryEmoji()`

### Funcionalidades:
- Todos os componentes estão em `src/components/`
- Dados são gerenciados em `src/contexts/LocalDataContext.tsx`

## 🆘 Suporte

### Problemas Comuns:

**App não carrega:**
- Limpe o cache do navegador
- Verifique se JavaScript está habilitado

**Dados perdidos:**
- Dados ficam no localStorage do navegador
- Não limpe dados do navegador se quiser manter
- Faça backup regularmente

**Comando de voz não funciona:**
- Permita acesso ao microfone
- Use HTTPS ou localhost
- Funciona melhor no Chrome

### Limitações:

❌ Não sincroniza entre dispositivos
❌ Dados podem ser perdidos se limpar o navegador  
❌ Não tem backup automático na nuvem
❌ Sem notificações push

## 📄 Licença

Este projeto é fornecido como está, para uso pessoal. Baseado no DinDin Mágico original.

---

**✨ Desenvolvido com amor para ajudar você a controlar suas finanças de forma simples e eficiente!**