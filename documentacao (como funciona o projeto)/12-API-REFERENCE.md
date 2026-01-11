# API Reference

## Introdução

Esta documentação fornece referência completa de todas as APIs do TireWatch Pro, incluindo exemplos práticos com cURL.

## Base URL

```
https://mwvtdxdzvxzmswpkeoko.supabase.co/functions/v1
```

## Autenticação

### Obter Token JWT

```bash
curl -X POST \
  'https://mwvtdxdzvxzmswpkeoko.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: <SUPABASE_ANON_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "usuario@empresa.com",
    "password": "senha123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "usuario@empresa.com"
  }
}
```

---

## Endpoints

### GET /alerts

Lista alertas com filtros.

**Request:**
```bash
curl -X GET \
  'https://xxx.supabase.co/functions/v1/alerts?severity=critical&status=open&limit=10' \
  -H 'Authorization: Bearer <JWT_TOKEN>'
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| severity | string | Não | critical, high, medium, low |
| type | string | Não | pressure_low, pressure_high, speed_exceeded |
| status | string | Não | open, acknowledged, in_progress, resolved |
| machineId | uuid | Não | Filtrar por máquina |
| startDate | ISO8601 | Não | Data inicial |
| endDate | ISO8601 | Não | Data final |
| limit | integer | Não | 1-500 (padrão: 100) |
| offset | integer | Não | Paginação |

**Response 200:**
```json
{
  "alerts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "machineId": "123e4567-e89b-12d3-a456-426614174000",
      "machineName": "Trator 001",
      "machineModel": "John Deere 8R",
      "machineStatus": "warning",
      "tireId": "789e0123-e45b-67d8-a901-234567890000",
      "tireSerial": "TIRE-001",
      "tirePosition": "FE",
      "type": "pressure_low",
      "severity": "critical",
      "status": "open",
      "message": "Pressão crítica: 1.8 bar",
      "reason": "Pressão abaixo do limite mínimo",
      "probableCause": "Possível vazamento ou desgaste",
      "recommendedAction": "Verificar pneu imediatamente",
      "openedAt": "2026-01-10T15:30:00Z",
      "updatedAt": "2026-01-10T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  },
  "summary": {
    "total": 150,
    "bySeverity": {
      "critical": 5,
      "high": 25,
      "medium": 70,
      "low": 50
    },
    "byStatus": {
      "open": 80,
      "acknowledged": 30,
      "in_progress": 25,
      "resolved": 15
    }
  }
}
```

---

### POST /telemetry-ingest

Recebe dados de telemetria dos sensores IoT.

**Request (Leitura única):**
```bash
curl -X POST \
  'https://xxx.supabase.co/functions/v1/telemetry-ingest' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "machineId": "123e4567-e89b-12d3-a456-426614174000",
    "tireId": "789e0123-e45b-67d8-a901-234567890000",
    "pressure": 3.2,
    "speed": 25.5
  }'
```

**Request (Lote):**
```bash
curl -X POST \
  'https://xxx.supabase.co/functions/v1/telemetry-ingest' \
  -H 'X-API-Key: <TELEMETRY_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "readings": [
      {"machineId": "uuid1", "pressure": 3.2, "speed": 25.5},
      {"machineId": "uuid2", "pressure": 3.1, "speed": 30.0},
      {"machineId": "uuid3", "pressure": 2.8, "speed": 28.0}
    ]
  }'
```

**Response 200:**
```json
{
  "success": true,
  "processed": 3,
  "alerts_generated": 1,
  "timestamp": "2026-01-10T15:30:00Z"
}
```

**Validação:**

| Campo | Regra |
|-------|-------|
| machineId | UUID válido, deve existir |
| tireId | UUID válido (opcional) |
| pressure | 0 ≤ pressure ≤ 10 |
| speed | 0 ≤ speed ≤ 200 |
| readings | 1-1000 items |

---

### POST /ai-insights

Gera análises usando inteligência artificial.

**Request:**
```bash
curl -X POST \
  'https://xxx.supabase.co/functions/v1/ai-insights' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "insights",
    "fleetData": {
      "totalMachines": 50,
      "machinesOperational": 40,
      "machinesWarning": 5,
      "machinesCritical": 3,
      "machinesOffline": 2,
      "activeAlerts": 15,
      "criticalAlerts": 3,
      "fleetHealthScore": 85
    }
  }'
```

**Tipos disponíveis:**
- `insights` - Resumo executivo
- `prediction` - Previsão de manutenção
- `anomaly` - Detecção de anomalias
- `recommendations` - Recomendações

**Response (insights):**
```json
{
  "type": "insights",
  "insight": "A frota apresenta bom desempenho geral com 80% das máquinas operacionais. Atenção ao Trator 001 que mostra tendência de queda de pressão nos últimos 5 ciclos. Recomenda-se verificação preventiva.",
  "timestamp": "2026-01-10T15:30:00Z"
}
```

**Response (prediction):**
```json
{
  "type": "prediction",
  "data": [
    {
      "machine": "Trator 001",
      "risk": "pressure",
      "days": 3,
      "confidence": "high",
      "reason": "Pressão em declínio constante de 0.1 bar/dia"
    },
    {
      "machine": "Colheitadeira 003",
      "risk": "maintenance",
      "days": 7,
      "confidence": "medium",
      "reason": "Padrão de uso indica necessidade de calibração"
    }
  ],
  "timestamp": "2026-01-10T15:30:00Z"
}
```

---

### POST /alert-actions

Executa ações em alertas.

**Reconhecer alerta:**
```bash
curl -X POST \
  'https://xxx.supabase.co/functions/v1/alert-actions' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "alertId": "550e8400-e29b-41d4-a716-446655440000",
    "action": "acknowledge",
    "data": {
      "comment": "Verificando em campo"
    }
  }'
```

**Resolver alerta:**
```bash
curl -X POST \
  'https://xxx.supabase.co/functions/v1/alert-actions' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "alertId": "550e8400-e29b-41d4-a716-446655440000",
    "action": "resolve",
    "data": {
      "comment": "Pneu calibrado",
      "resolution": "Calibração realizada com sucesso"
    }
  }'
```

**Response 200:**
```json
{
  "success": true,
  "alertId": "550e8400-e29b-41d4-a716-446655440000",
  "newStatus": "resolved",
  "timestamp": "2026-01-10T15:30:00Z"
}
```

---

### GET /machine-timeline

Busca timeline de eventos de uma máquina.

**Request:**
```bash
curl -X GET \
  'https://xxx.supabase.co/functions/v1/machine-timeline?machineId=123e4567-e89b-12d3-a456-426614174000&limit=20' \
  -H 'Authorization: Bearer <JWT_TOKEN>'
```

**Response 200:**
```json
{
  "machineId": "123e4567-e89b-12d3-a456-426614174000",
  "events": [
    {
      "id": "evt1",
      "type": "alert_created",
      "description": "Alerta de pressão baixa criado",
      "timestamp": "2026-01-10T15:30:00Z",
      "data": {
        "alertId": "...",
        "severity": "high"
      }
    },
    {
      "id": "evt2",
      "type": "telemetry",
      "description": "Leitura de telemetria",
      "timestamp": "2026-01-10T15:25:00Z",
      "data": {
        "pressure": 2.3,
        "speed": 25
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "hasMore": true
  }
}
```

---

## Códigos de Erro

| Código | Significado | Exemplo |
|--------|-------------|---------|
| 400 | Bad Request | Dados inválidos no body |
| 401 | Unauthorized | Token ausente ou expirado |
| 403 | Forbidden | Sem permissão para o recurso |
| 404 | Not Found | Recurso não existe |
| 409 | Conflict | Conflito de dados |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro no servidor |

**Formato de erro:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "O campo 'pressure' deve ser um número entre 0 e 10",
    "details": {
      "field": "pressure",
      "value": -1,
      "constraint": "min: 0, max: 10"
    }
  }
}
```

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| telemetry-ingest | 1000 req/min |
| ai-insights | 10 req/min |
| alerts | 100 req/min |
| Outros | 100 req/min |

**Headers de resposta:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Próximos Passos

- [API](06-API.md) - Visão geral das APIs
- [Autenticação](07-AUTENTICACAO.md) - Detalhes de autenticação
