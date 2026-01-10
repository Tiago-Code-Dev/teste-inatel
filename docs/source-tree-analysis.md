# TireWatch Pro - Análise da Árvore de Código

## Estrutura Principal

```
teste-inatel/
├── 📁 _bmad/                    # BMAD Method
├── 📁 docs/                     # 📖 Documentação
├── 📁 public/                   # Assets estáticos
├── 📁 src/                      # 🎯 Código fonte
│   ├── components/              # ~200 componentes (20 módulos)
│   ├── contexts/                # Auth, Tenant, Dashboard
│   ├── hooks/                   # 28 custom hooks
│   ├── pages/                   # 36 páginas
│   ├── integrations/            # Supabase client
│   ├── lib/                     # Utilitários
│   └── types/                   # TypeScript
├── 📁 supabase/                 # 🗄️ Backend
│   ├── functions/               # 6 Edge Functions
│   └── migrations/              # 14 SQL migrations
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## src/components/ (20 módulos)

```
components/
├── analytics/      # Gráficos e métricas (8)
├── auth/           # ProtectedRoute (1)
├── balance/        # Dashboard balanceamento (6)
├── bi/             # Business Intelligence (6)
├── calibration/    # Calibração pneus (7)
├── collaboration/  # Comentários alertas (3)
├── command-center/ # Centro de comando (12)
├── costs/          # Gestão custos (7)
├── dashboard/      # Dashboard principal (28)
├── deformation/    # Análise deformação (7)
├── fleet/          # Gestão frota (7)
├── fluid/          # Balanceamento fluido (7)
├── geolocation/    # Mapas Mapbox (7)
├── global/         # Providers (4)
├── inatel/         # Específico Inatel (10)
├── layout/         # Sidebar, Header (9)
├── load/           # Análise carga (7)
├── operations/     # Ocorrências (9)
├── shared/         # DataTable, StatusBadge (10)
├── telemetry/      # Telemetria (4)
├── timeline/       # Timeline eventos (7)
├── ui/             # shadcn/ui (55)
└── wear/           # Análise desgaste (6)
```

## src/hooks/ (28 hooks)

```
hooks/
├── useRealtimeAlerts.ts      # ⭐ Alertas realtime
├── useRealtimeMachines.ts    # ⭐ Máquinas realtime
├── useLiveTelemetry.ts       # ⭐ Telemetria ao vivo
├── useAIInsights.ts          # 🤖 Integração IA
├── useOperationalDashboard.ts
├── useBusinessIntelligence.ts
├── useCostManagement.ts
├── useFleetManagement.ts
├── useTireCalibration.ts
└── ... (18 mais)
```

## src/pages/ (36 páginas)

```
pages/
├── AuthPage.tsx              # 🔐 Login/Signup
├── Dashboard.tsx             # ⭐ Dashboard principal
├── CommandCenterPage.tsx     # ⭐ Centro de comando
├── MachinesPage.tsx          # 🚜 Lista máquinas
├── TiresPage.tsx             # 🛞 Lista pneus
├── GeolocationPage.tsx       # 🗺️ Mapa
├── BusinessIntelligencePage.tsx
├── AdvancedAnalyticsPage.tsx
└── ... (28 mais)
```

## supabase/functions/ (6 Edge Functions)

```
functions/
├── alerts/           # GET - Lista alertas
├── telemetry-ingest/ # POST - Ingestão IoT
├── ai-insights/      # POST - IA Gemini
├── occurrences/      # CRUD ocorrências
├── alert-actions/    # Ações em alertas
└── machine-timeline/ # Timeline máquina
```

## Arquivos Críticos

| Arquivo | Propósito |
|---------|-----------|
| `src/main.tsx` | Entry point |
| `src/App.tsx` | Routes e providers |
| `src/contexts/AuthContext.tsx` | Autenticação |
| `src/contexts/TenantContext.tsx` | Multi-tenancy |
| `src/integrations/supabase/client.ts` | Cliente Supabase |

## Estatísticas

| Métrica | Valor |
|---------|-------|
| Arquivos TypeScript | ~250 |
| Componentes React | ~200 |
| Páginas | 36 |
| Hooks | 28 |
| Edge Functions | 6 |
| Migrations | 14 |
