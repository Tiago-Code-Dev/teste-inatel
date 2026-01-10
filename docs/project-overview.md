# TireWatch Pro - Visão Geral do Projeto

## Resumo Executivo

**TireWatch Pro** é uma plataforma SaaS de monitoramento de pneus para frotas de máquinas agrícolas e industriais. O sistema coleta telemetria em tempo real (pressão e velocidade), gera alertas automatizados, gerencia ocorrências de manutenção e fornece dashboards analíticos avançados com insights de IA.

## Informações do Projeto

| Atributo | Valor |
|----------|-------|
| **Nome** | TireWatch Pro (teste-inatel) |
| **Tipo** | Aplicação Web Monolítica |
| **Domínio** | IoT / Fleet Management / Predictive Maintenance |
| **Plataforma** | Lovable.dev |
| **Supabase Project ID** | mwvtdxdzvxzmswpkeoko |

## Stack Tecnológica

### Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool |
| React Router DOM | 6.30.1 | Roteamento SPA |
| TanStack React Query | 5.83.0 | Server state management |
| React Hook Form | 7.61.1 | Gerenciamento de formulários |
| Zod | 3.25.76 | Validação de schemas |

### UI/Design System

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Tailwind CSS | 3.4.17 | Utility-first CSS |
| shadcn/ui | - | Componentes base |
| Radix UI | Múltiplos | Primitivos acessíveis |
| Lucide React | 0.462.0 | Ícones |
| Framer Motion | 12.24.7 | Animações |

### Visualização de Dados

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Recharts | 2.15.4 | Gráficos e dashboards |
| Mapbox GL | 3.17.0 | Mapas de geolocalização |

### Backend (Supabase)

| Componente | Propósito |
|------------|-----------|
| PostgreSQL | Banco de dados relacional |
| Auth | Autenticação e autorização |
| Edge Functions (Deno) | APIs serverless |
| Realtime | Subscriptions WebSocket |
| Row Level Security (RLS) | Segurança multi-tenant |

## Funcionalidades Principais

### 1. Dashboard Principal
- Visão geral da frota com métricas em tempo real
- Score de saúde da frota
- Alertas ativos e estatísticas de máquinas

### 2. Centro de Comando (Command Center)
- Gestão de alertas em tempo real
- Sistema de SLA com countdown
- Filtros avançados por severidade, tipo e status
- Feed de atividades ao vivo

### 3. Gestão de Máquinas
- Inventário de máquinas por unidade
- Detalhes e histórico por máquina
- Telemetria em tempo real com sparklines
- Status (operational, warning, critical, offline)

### 4. Gestão de Pneus
- Cadastro e rastreamento de pneus
- Lifecycle status (new, in_use, maintenance, retired)
- Histórico de pressão e calibração
- Análise de deformação

### 5. Telemetria em Tempo Real
- Ingestão de dados IoT (pressão, velocidade)
- Geração automática de alertas baseada em thresholds
- Subscriptions WebSocket para atualização ao vivo

### 6. Análise e BI
- Analytics avançados com tendências
- Business Intelligence com KPIs
- Relatórios de custos e gestão de frota
- Insights de IA (previsões e recomendações)

### 7. Geolocalização
- Rastreamento de máquinas em mapa
- Visualização de frota por região

### 8. Ocorrências
- Registro de incidentes com mídia (foto, áudio, vídeo)
- Workflow de resolução
- Suporte offline com sincronização

## Modelo Multi-Tenant

O sistema utiliza **Row Level Security (RLS)** do Supabase para isolar dados por unidade:

- **Units**: Unidades operacionais (fazendas, filiais, etc.)
- **Profiles**: Usuários com array de `unit_ids` permitidos
- **Machines**: Vinculadas a uma unidade
- **Alerts, Telemetry, etc.**: Herdados via relacionamento com machines

### Roles do Sistema

| Role | Descrição |
|------|-----------|
| `admin` | Acesso total ao sistema |
| `manager` | Gestão de unidades e equipes |
| `technician` | Manutenção e calibração |
| `operator` | Operação diária e registro |

## Integrações

### IoT/Telemetria
- Edge Function `telemetry-ingest` aceita dados via API key ou JWT
- Suporta ingestão em lote (até 1000 leituras)
- Gera alertas automaticamente baseado em thresholds

### IA/ML
- Edge Function `ai-insights` usa Google Gemini 2.5 Flash
- Tipos de análise: insights, prediction, anomaly, recommendations
- Integrado via Lovable AI Gateway
