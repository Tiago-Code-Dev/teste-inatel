# TireWatch Pro - Modelos de Dados

## Visão Geral do Schema

O banco de dados PostgreSQL do Supabase contém 12 tabelas principais organizadas em domínios funcionais.

## Diagrama de Relacionamentos

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   units     │◄─────│  machines   │◄─────│   tires     │
│             │ 1:N  │             │ 1:N  │             │
└─────────────┘      └──────┬──────┘      └──────┬──────┘
                            │                     │
                            │ 1:N                 │ 1:N
                            ▼                     │
                     ┌─────────────┐              │
                     │   alerts    │◄─────────────┘
                     │             │
                     └──────┬──────┘
                            │
                            │ 1:N
                            ▼
                     ┌─────────────┐
                     │alert_comments│
                     └─────────────┘
```

## Tabelas Principais

### units
Unidades operacionais (fazendas, filiais).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `name` | text | Nome da unidade |
| `description` | text | Descrição opcional |
| `active` | boolean | Se está ativa |

### machines
Máquinas da frota.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `name` | text | Nome/identificador |
| `model` | text | Modelo da máquina |
| `unit_id` | uuid | FK → units.id |
| `status` | text | operational/warning/critical/offline |
| `latitude` | double | Última latitude |
| `longitude` | double | Última longitude |
| `last_telemetry_at` | timestamptz | Última telemetria |

### tires
Pneus instalados ou em estoque.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `serial` | text | Número de série (único) |
| `machine_id` | uuid | FK → machines.id |
| `position` | text | Posição (FE, FD, TE, TD) |
| `lifecycle_status` | text | new/in_use/maintenance/retired |
| `current_pressure` | double | Pressão atual (bar) |
| `recommended_pressure` | double | Pressão recomendada |

### alerts
Alertas do sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `machine_id` | uuid | FK → machines.id |
| `tire_id` | uuid | FK → tires.id |
| `type` | text | pressure_low/pressure_high/speed_exceeded/no_signal/anomaly |
| `severity` | text | low/medium/high/critical |
| `status` | text | open/acknowledged/in_progress/resolved |
| `message` | text | Mensagem do alerta |
| `probable_cause` | text | Causa provável (IA) |
| `recommended_action` | text | Ação recomendada |

### telemetry
Leituras de telemetria IoT.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `machine_id` | uuid | FK → machines.id |
| `tire_id` | uuid | FK → tires.id |
| `pressure` | double | Pressão (bar) |
| `speed` | double | Velocidade (km/h) |
| `timestamp` | timestamptz | Timestamp da leitura |

### occurrences
Registros de ocorrências/incidentes.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `machine_id` | uuid | FK → machines.id |
| `alert_id` | uuid | FK → alerts.id |
| `created_by` | uuid | Criador |
| `description` | text | Descrição |
| `status` | text | Status da ocorrência |

### profiles
Perfis de usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users.id |
| `name` | text | Nome do usuário |
| `unit_ids` | uuid[] | Unidades com acesso |

### user_roles
Roles de usuário (RBAC).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users.id |
| `role` | app_role | admin/manager/technician/operator |

## Enums

### app_role
```sql
CREATE TYPE app_role AS ENUM ('admin', 'manager', 'technician', 'operator');
```

## Functions Principais

| Function | Descrição |
|----------|-----------|
| `get_user_unit_ids(user_id)` | Retorna array de unit_ids do usuário |
| `has_role(role, user_id)` | Verifica se usuário tem role |
| `user_has_unit_access(unit_id, user_id)` | Verifica acesso a unidade |
| `check_rate_limit(action, limit)` | Rate limiting |
