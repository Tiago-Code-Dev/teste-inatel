# TireWatch Pro - Inventário de Componentes

## Visão Geral

O projeto possui **~200 componentes** organizados em 20+ módulos funcionais.

## Estrutura

```
src/components/
├── analytics/         # Análise e métricas (8 componentes)
├── auth/              # Autenticação (1)
├── balance/           # Dashboard balanceamento (6)
├── bi/                # Business Intelligence (6)
├── calibration/       # Calibração de pneus (7)
├── collaboration/     # Colaboração em alertas (3)
├── command-center/    # Centro de comando (12)
├── costs/             # Gestão de custos (7)
├── dashboard/         # Dashboard principal (28)
├── deformation/       # Análise deformação (7)
├── fleet/             # Gestão de frota (7)
├── fluid/             # Balanceamento líquido (7)
├── geolocation/       # Mapas e localização (7)
├── global/            # Providers globais (4)
├── inatel/            # Específico Inatel (10)
├── layout/            # Layout e navegação (9)
├── load/              # Análise de carga (7)
├── operations/        # Operações (9)
├── shared/            # Compartilhados (10)
├── telemetry/         # Telemetria (4)
├── timeline/          # Timeline eventos (7)
├── ui/                # shadcn/ui (55)
└── wear/              # Análise desgaste (6)
```

## Componentes Principais

### dashboard/ (28)
| Componente | Descrição |
|------------|-----------|
| `AIInsightsCard` | Card com insights de IA |
| `DashboardContent` | Conteúdo principal |
| `FleetHealthCard` | Saúde da frota |
| `MachineCard` | Card de máquina |
| `AlertCard` | Card de alerta |
| `StatsCards` | Cards de estatísticas |
| `UnitSelector` | Seletor de unidade |

### command-center/ (12)
| Componente | Descrição |
|------------|-----------|
| `SwipeableAlertCard` | Card com gestos |
| `SlaCountdown` | Countdown de SLA |
| `LiveActivityFeed` | Feed em tempo real |
| `FiltersBottomSheet` | Filtros mobile |
| `ResolveAlertModal` | Modal de resolução |

### layout/ (9)
| Componente | Descrição |
|------------|-----------|
| `AppSidebar` | Sidebar principal |
| `MainLayout` | Layout wrapper |
| `BottomNav` | Nav mobile |
| `Header` | Header |

### ui/ (55 - shadcn/ui)
Componentes base: Button, Card, Dialog, Input, Select, Table, Tabs, Toast, etc.

## Padrões

### Estrutura de Componente
```typescript
interface ExampleCardProps {
  data: ExampleData;
  onAction?: () => void;
}

export function ExampleCard({ data, onAction }: ExampleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>...</CardContent>
    </Card>
  );
}
```

### Index Export
```typescript
// components/dashboard/index.ts
export * from './DashboardContent';
export * from './MachineCard';
```
