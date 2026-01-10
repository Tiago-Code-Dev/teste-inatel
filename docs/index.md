# TireWatch Pro - Índice de Documentação

> 📖 **Ponto de entrada principal** para desenvolvimento assistido por IA e referência do projeto.

---

## Visão Geral do Projeto

| Atributo | Valor |
|----------|-------|
| **Nome** | TireWatch Pro (teste-inatel) |
| **Tipo** | Monolítico - Aplicação Web |
| **Linguagem** | TypeScript |
| **Framework** | React 18 + Vite |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **UI** | shadcn/ui + Tailwind CSS |

---

## Referência Rápida

### Stack Tecnológica

- **Frontend:** React, TypeScript, Vite, React Router
- **Estado:** TanStack React Query, React Context
- **UI:** shadcn/ui, Radix UI, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Visualização:** Recharts, Mapbox GL
- **Validação:** Zod, React Hook Form

### Entry Points

- **App:** `src/main.tsx` → `src/App.tsx`
- **Auth:** `src/contexts/AuthContext.tsx`
- **Routes:** Definidas em `src/App.tsx`
- **Supabase Client:** `src/integrations/supabase/client.ts`

### Arquitetura

- **Pattern:** Layered + Component-Based
- **State:** React Query (server) + Context (client)
- **Auth:** Supabase Auth + JWT
- **Multi-tenant:** RLS por `unit_id`

---

## Documentação Gerada

### Arquitetura e Visão Geral

- [Visão Geral do Projeto](./project-overview.md) - Resumo executivo, stack, funcionalidades
- [Arquitetura do Sistema](./architecture.md) - Padrões, fluxos, componentes de arquitetura

### Dados e APIs

- [Modelos de Dados](./data-models.md) - Schema do banco, tabelas, relacionamentos
- [Contratos de API](./api-contracts.md) - Edge Functions, endpoints, autenticação

### Código e Componentes

- [Inventário de Componentes](./component-inventory.md) - ~200 componentes documentados
- [Análise da Árvore de Código](./source-tree-analysis.md) - Estrutura de diretórios

### Desenvolvimento

- [Guia de Desenvolvimento](./development-guide.md) - Setup, convenções, workflows

---

## Início Rápido

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
# Acesse http://localhost:8080
```

### Build

```bash
npm run build
```

---

## Estrutura de Diretórios Principal

```
src/
├── components/     # ~200 componentes React (20 módulos)
├── contexts/       # AuthContext, TenantContext, DashboardContext
├── hooks/          # 28 custom hooks
├── pages/          # 36 páginas/routes
├── integrations/   # Supabase client e tipos
├── lib/            # Utilitários
└── types/          # Definições TypeScript

supabase/
├── functions/      # 6 Edge Functions (Deno)
└── migrations/     # 14 SQL migrations
```

---

## Contexto para IA

Ao trabalhar com este projeto, considere:

1. **Multi-tenancy**: Dados são isolados por `unit_id` via RLS
2. **Realtime**: Muitos hooks usam Supabase Realtime para updates
3. **shadcn/ui**: Componentes base em `src/components/ui/`
4. **React Query**: Server state gerenciado centralmente
5. **TypeScript**: Tipos em `src/types/` e `src/integrations/supabase/types.ts`

---

*Esta documentação foi gerada pelo BMAD Tech Writer para auxiliar desenvolvimento assistido por IA.*
