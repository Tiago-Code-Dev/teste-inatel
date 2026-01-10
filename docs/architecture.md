# TireWatch Pro - Arquitetura do Sistema

## Visão Geral

TireWatch Pro segue uma arquitetura **Frontend SPA + Backend-as-a-Service (BaaS)**, utilizando React para a interface e Supabase como plataforma backend completa.

## Padrão Arquitetural

**Tipo**: Layered Architecture com Component-Based UI

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Pages (Route Components)                               │  │
│  │   - Dashboard, CommandCenter, Machines, Tires, etc.   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Feature Components                                     │  │
│  │   - analytics/, command-center/, dashboard/, etc.     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ UI Components (shadcn/ui + custom)                    │  │
│  │   - Button, Card, Dialog, Table, Charts, etc.         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Contexts (State Management)                            │  │
│  │   - AuthContext, TenantContext, DashboardContext      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Custom Hooks (Business Logic)                          │  │
│  │   - useRealtimeAlerts, useLiveTelemetry, etc.         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ React Query (Server State)                             │  │
│  │   - Queries, Mutations, Invalidations                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    INTEGRATION LAYER                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Supabase Client                                        │  │
│  │   - Auth, Database (PostgREST), Realtime, Storage     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    BACKEND (SUPABASE)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ PostgreSQL  │ │ Auth/JWT    │ │ Edge Functions (Deno)   ││
│  │ + RLS       │ │ + RLS       │ │ - alerts                ││
│  │             │ │             │ │ - telemetry-ingest      ││
│  │             │ │             │ │ - ai-insights           ││
│  │             │ │             │ │ - occurrences           ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

### 1. Autenticação

```
User → AuthPage → Supabase Auth → JWT Token
                                      │
                                      ▼
                              AuthContext (React)
                                      │
                                      ▼
                              ProtectedRoute (RLS enforced)
```

### 2. Multi-Tenancy

```
User Login → Profile (unit_ids) → TenantContext
                                      │
                                      ▼
                              selectedUnitId filter
                                      │
                                      ▼
                              All queries filtered by unit
```

### 3. Telemetria em Tempo Real

```
IoT Device ──POST──▶ telemetry-ingest (Edge Function)
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              telemetry table    alerts table (auto-generated)
                    │                   │
                    ▼                   ▼
              Realtime Channel → React Query Invalidation
                                        │
                                        ▼
                              UI Update (Dashboard)
```

## Componentes de Arquitetura

### Contexts (Estado Global)

| Context | Responsabilidade |
|---------|------------------|
| `AuthContext` | Sessão do usuário, login/logout, JWT |
| `TenantContext` | Unidades do usuário, seleção de unidade, filtro |
| `DashboardContext` | Dados agregados de máquinas, alertas, telemetria |

### Custom Hooks (Lógica de Negócio)

| Hook | Responsabilidade |
|------|------------------|
| `useRealtimeAlerts` | Subscription de alertas via WebSocket |
| `useRealtimeMachines` | Subscription de máquinas via WebSocket |
| `useLiveTelemetry` | Telemetria em tempo real por máquina |
| `useOperationalDashboard` | Dados do dashboard operacional |
| `useBusinessIntelligence` | Métricas de BI e analytics |
| `useAIInsights` | Integração com Edge Function de IA |

### Edge Functions (APIs Serverless)

| Function | Método | Autenticação | Propósito |
|----------|--------|--------------|-----------|
| `alerts` | GET | JWT | Lista alertas com filtros |
| `telemetry-ingest` | POST | API Key/JWT | Ingestão de telemetria IoT |
| `ai-insights` | POST | Bearer | Análises de IA |
| `occurrences` | GET/POST | JWT | CRUD de ocorrências |
| `alert-actions` | POST | JWT | Ações em alertas |
| `machine-timeline` | GET | JWT | Timeline de eventos |

## Segurança

### Row Level Security (RLS)

Todas as tabelas principais têm políticas RLS que:
1. Verificam autenticação (`auth.uid()`)
2. Filtram por unidades do usuário (`get_user_unit_ids()`)
3. Verificam roles quando necessário (`has_role()`)

### Validação de Input

- **Frontend**: Zod schemas + React Hook Form
- **Edge Functions**: Zod validation em runtime
- **Database**: Constraints e triggers
