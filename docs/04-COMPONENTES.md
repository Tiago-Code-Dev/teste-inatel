# Componentes

## Introdução

O TireWatch Pro possui aproximadamente **200 componentes** organizados em **20+ módulos** funcionais. Esta documentação apresenta um inventário completo, explicando o propósito de cada módulo e seus principais componentes.

### O que são Componentes?

Componentes são "blocos de construção" da interface. Pense neles como peças de LEGO - cada peça tem uma função específica, e você combina várias peças para construir algo maior.

## Estrutura de Diretórios

```
src/components/
├── 📊 analytics/         # Gráficos e métricas (8 componentes)
├── 🔐 auth/              # Autenticação (1 componente)
├── ⚖️ balance/           # Dashboard de balanceamento (6 componentes)
├── 📈 bi/                # Business Intelligence (6 componentes)
├── 🔧 calibration/       # Calibração de pneus (7 componentes)
├── 💬 collaboration/     # Colaboração em alertas (3 componentes)
├── 🎛️ command-center/    # Centro de comando (12 componentes)
├── 💰 costs/             # Gestão de custos (7 componentes)
├── 📊 dashboard/         # Dashboard principal (28 componentes)
├── 📐 deformation/       # Análise de deformação (7 componentes)
├── 🚜 fleet/             # Gestão de frota (7 componentes)
├── 💧 fluid/             # Balanceamento líquido (7 componentes)
├── 🗺️ geolocation/       # Mapas e localização (7 componentes)
├── 🌐 global/            # Providers globais (4 componentes)
├── 🏢 inatel/            # Específico Inatel (10 componentes)
├── 📐 layout/            # Layout e navegação (9 componentes)
├── ⚖️ load/              # Análise de carga (7 componentes)
├── 📝 operations/        # Operações (9 componentes)
├── 🔄 shared/            # Compartilhados (10 componentes)
├── 📡 telemetry/         # Telemetria (4 componentes)
├── ⏱️ timeline/          # Timeline de eventos (7 componentes)
├── 🎨 ui/                # shadcn/ui base (55 componentes)
└── 🔄 wear/              # Análise de desgaste (6 componentes)
```

## Módulos Detalhados

### 📊 analytics/ (8 componentes)

Componentes para dashboards analíticos e visualização de métricas.

| Componente | Descrição |
|------------|-----------|
| `AlertTrendChart` | Gráfico de linha mostrando tendência de alertas ao longo do tempo |
| `AnalyticsKPICard` | Card com KPI (indicador), valor atual e variação percentual |
| `HourlyHeatmap` | Mapa de calor mostrando alertas por hora do dia |
| `MTTRGauge` | Medidor circular de Mean Time To Repair (tempo médio de reparo) |
| `SeverityDistributionChart` | Gráfico de pizza com distribuição por severidade |
| `ShiftPerformanceChart` | Gráfico de barras com performance por turno |
| `TeamPerformanceTable` | Tabela com métricas de performance da equipe |

**Exemplo de uso:**

```tsx
import { AlertTrendChart } from '@/components/analytics';

function AnalyticsPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <AlertTrendChart data={alertData} period="7d" />
      <SeverityDistributionChart alerts={alerts} />
    </div>
  );
}
```

### 🔐 auth/ (1 componente)

| Componente | Descrição |
|------------|-----------|
| `ProtectedRoute` | Componente que protege rotas - redireciona para login se não autenticado |

**Como funciona:**

```tsx
// Envolve rotas que precisam de autenticação
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/machines" element={<MachinesPage />} />
</Route>
```

### 🎛️ command-center/ (12 componentes)

Centro de comando para gestão de alertas em tempo real.

| Componente | Descrição |
|------------|-----------|
| `SwipeableAlertCard` | Card de alerta com gestos de swipe (mobile) |
| `SlaCountdown` | Contador regressivo de SLA |
| `SlaIndicator` | Indicador visual de status do SLA |
| `LiveActivityFeed` | Feed de atividades em tempo real |
| `ActivityFeed` | Feed de atividades recentes |
| `FiltersBottomSheet` | Bottom sheet com filtros (mobile) |
| `ActiveFiltersChips` | Chips mostrando filtros ativos |
| `ResolveAlertModal` | Modal para resolver alertas |
| `CommandStats` | Estatísticas do command center |
| `LastUpdatedIndicator` | Indicador de última atualização |
| `TeamPresence` | Indicador de presença da equipe online |

**Exemplo de uso:**

```tsx
import { 
  SwipeableAlertCard, 
  SlaCountdown,
  LiveActivityFeed 
} from '@/components/command-center';

function CommandCenter() {
  return (
    <div className="flex">
      <div className="flex-1">
        {alerts.map(alert => (
          <SwipeableAlertCard 
            key={alert.id} 
            alert={alert}
            onResolve={() => handleResolve(alert.id)}
          >
            <SlaCountdown deadline={alert.slaDeadline} />
          </SwipeableAlertCard>
        ))}
      </div>
      <aside className="w-80">
        <LiveActivityFeed />
      </aside>
    </div>
  );
}
```

### 📊 dashboard/ (28 componentes)

Componentes do dashboard principal.

| Componente | Descrição |
|------------|-----------|
| `DashboardContent` | Conteúdo principal do dashboard |
| `DashboardHeader` | Header com título e ações |
| `DashboardLayout` | Layout wrapper do dashboard |
| `DashboardSkeleton` | Skeleton loading enquanto carrega |
| `AIInsightsCard` | Card com insights gerados por IA |
| `AIInsightsSheet` | Sheet lateral com análises detalhadas de IA |
| `FleetHealthCard` | Card mostrando saúde geral da frota |
| `StatsCards` | Cards de estatísticas (máquinas, alertas, etc.) |
| `QuickStats` | Estatísticas rápidas inline |
| `MachineCard` | Card de uma máquina com status |
| `MachinesList` | Lista/grid de máquinas |
| `AlertCard` | Card de um alerta |
| `AlertsList` | Lista de alertas ativos |
| `AlertsTable` | Tabela de alertas com filtros |
| `UnitSelector` | Seletor de unidade (dropdown) |
| `SparklineChart` | Mini gráfico inline |
| `TelemetrySparkline` | Sparkline de telemetria |
| `PressureTrendChart` | Gráfico de tendência de pressão |
| `RefreshButton` | Botão para atualizar dados |
| `ErrorBoundary` | Captura erros e mostra fallback |

**Exemplo de uso:**

```tsx
import { 
  DashboardLayout,
  StatsCards,
  FleetHealthCard,
  MachinesList,
  AIInsightsCard
} from '@/components/dashboard';

function Dashboard() {
  const { machines, alerts, stats } = useDashboard();

  return (
    <DashboardLayout>
      <StatsCards stats={stats} />
      <div className="grid grid-cols-3 gap-4">
        <FleetHealthCard score={stats.healthScore} />
        <AIInsightsCard />
      </div>
      <MachinesList machines={machines} />
    </DashboardLayout>
  );
}
```

### 📐 layout/ (9 componentes)

Componentes de layout e navegação.

| Componente | Descrição |
|------------|-----------|
| `MainLayout` | Layout principal com sidebar |
| `AppSidebar` | Sidebar de navegação |
| `SidebarNav` | Navegação dentro do sidebar |
| `Header` | Header da aplicação |
| `MobileHeader` | Header para mobile |
| `BottomNav` | Navegação inferior (mobile) |
| `PageHeader` | Header de página com título e breadcrumb |
| `Navbar` | Barra de navegação |

**Estrutura do Layout:**

```tsx
function MainLayout({ children }) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      <BottomNav className="md:hidden" /> {/* Só em mobile */}
    </div>
  );
}
```

### 🎨 ui/ (55 componentes)

Componentes base do shadcn/ui - são os "átomos" da interface.

| Componente | Descrição |
|------------|-----------|
| `button` | Botões com variantes (primary, secondary, destructive, etc.) |
| `card` | Cards com header, content e footer |
| `dialog` | Modais/diálogos |
| `drawer` | Drawer lateral |
| `dropdown-menu` | Menu dropdown |
| `input` | Campos de texto |
| `select` | Dropdowns de seleção |
| `table` | Tabelas |
| `tabs` | Abas |
| `toast` | Notificações toast |
| `tooltip` | Tooltips |
| `form` | Formulários com validação |
| `sheet` | Sheet lateral |
| `skeleton` | Placeholder de loading |
| `badge` | Badges/tags |
| `avatar` | Avatar de usuário |
| `progress` | Barra de progresso |
| `switch` | Toggle switch |
| `checkbox` | Checkbox |
| `radio-group` | Grupo de radio buttons |
| `slider` | Slider de valores |
| `calendar` | Calendário |
| `popover` | Popover |
| `command` | Command palette |
| `accordion` | Acordeão |
| `alert` | Alertas inline |
| `separator` | Separador |
| `scroll-area` | Área com scroll customizado |
| ... | E mais 27 componentes |

**Exemplo de uso:**

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

function ExemploCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Novo Alerta
          <Badge variant="destructive">Crítico</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Descrição" />
        <Button className="mt-4">Salvar</Button>
      </CardContent>
    </Card>
  );
}
```

### 🔄 shared/ (10 componentes)

Componentes compartilhados entre vários módulos.

| Componente | Descrição |
|------------|-----------|
| `DataTable` | Tabela de dados genérica com ordenação e paginação |
| `EmptyState` | Estado vazio (quando não há dados) |
| `ErrorState` | Estado de erro |
| `LoadingSpinner` | Spinner de carregamento |
| `PageContainer` | Container padrão de página |
| `RefreshControl` | Controle de refresh (pull to refresh) |
| `SearchInput` | Input de busca com ícone |
| `StatusBadge` | Badge de status (operational, warning, critical) |
| `TimeAgo` | Componente que mostra tempo relativo ("há 5 minutos") |

**Exemplo de uso:**

```tsx
import { DataTable, EmptyState, StatusBadge } from '@/components/shared';

function MachinesList({ machines }) {
  if (machines.length === 0) {
    return <EmptyState message="Nenhuma máquina encontrada" />;
  }

  return (
    <DataTable
      data={machines}
      columns={[
        { header: 'Nome', accessor: 'name' },
        { header: 'Status', accessor: (m) => <StatusBadge status={m.status} /> },
      ]}
    />
  );
}
```

## Design System

### Cores (CSS Variables)

O sistema usa variáveis CSS para cores, permitindo temas claros e escuros:

```css
:root {
  --background: 0 0% 100%;      /* Branco */
  --foreground: 222.2 84% 4.9%; /* Quase preto */
  --primary: 222.2 47.4% 11.2%; /* Azul escuro */
  --secondary: 210 40% 96.1%;   /* Cinza claro */
  --muted: 210 40% 96.1%;       /* Cinza para texto secundário */
  --accent: 210 40% 96.1%;      /* Cor de destaque */
  --destructive: 0 84.2% 60.2%; /* Vermelho para erros */
}

.dark {
  --background: 222.2 84% 4.9%; /* Quase preto */
  --foreground: 210 40% 98%;    /* Quase branco */
  /* ... outras cores invertidas */
}
```

### Breakpoints (Responsividade)

| Nome | Largura | Uso |
|------|---------|-----|
| `sm` | 640px | Celulares grandes |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1400px | Telas grandes |

**Exemplo:**

```tsx
// Esconde em mobile, mostra em desktop
<div className="hidden md:block">
  Só aparece em telas maiores que 768px
</div>

// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 coluna em mobile, 2 em tablet, 3 em desktop */}
</div>
```

### Tipografia

- **Font family**: Sistema (Inter como fallback)
- **Font sizes**: `text-xs` até `text-4xl`
- **Font weights**: `font-normal`, `font-medium`, `font-semibold`, `font-bold`

## Padrões de Componentes

### Estrutura de Arquivo

```typescript
// components/dashboard/MachineCard.tsx

// 1. Imports
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared';
import type { Machine } from '@/types';

// 2. Interface de Props
interface MachineCardProps {
  machine: Machine;
  onClick?: () => void;
}

// 3. Componente
export function MachineCard({ machine, onClick }: MachineCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg" onClick={onClick}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {machine.name}
          <StatusBadge status={machine.status} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{machine.model}</p>
      </CardContent>
    </Card>
  );
}
```

### Index Export

Cada módulo tem um `index.ts` que exporta todos os componentes:

```typescript
// components/dashboard/index.ts
export * from './DashboardContent';
export * from './MachineCard';
export * from './AlertCard';
export * from './StatsCards';
// ...
```

**Benefício:** Imports mais limpos:

```typescript
// Ao invés de:
import { MachineCard } from '@/components/dashboard/MachineCard';
import { AlertCard } from '@/components/dashboard/AlertCard';

// Você pode fazer:
import { MachineCard, AlertCard } from '@/components/dashboard';
```

## Próximos Passos

- [Supabase](05-SUPABASE.md) - Backend e infraestrutura
- [Boas Práticas](14-BOAS-PRATICAS.md) - Convenções de código
- [Guia de Desenvolvimento](13-GUIA-DESENVOLVIMENTO.md) - Como criar novos componentes
