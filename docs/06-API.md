# API (Edge Functions)

## Introdução

As APIs do TireWatch Pro são implementadas como **Edge Functions** do Supabase. São funções serverless escritas em TypeScript/Deno que rodam na nuvem.

### O que são Edge Functions?

Edge Functions são código que roda no servidor, não no navegador do usuário. São úteis para:
- Lógica que precisa de segurança
- Processamento de dados dos sensores IoT
- Integrações com serviços externos (como IA)

## Autenticação

### JWT (Usuários)

Para requisições de usuários logados:

```http
Authorization: Bearer <supabase_jwt_token>
```

O token JWT é obtido após o login e contém informações do usuário.

### API Key (Dispositivos IoT)

Para sensores e dispositivos:

```http
X-API-Key: <telemetry_api_key>
```

## Endpoints Disponíveis

### GET /functions/v1/alerts

Lista alertas com filtros avançados.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `severity` | string | critical, high, medium, low |
| `type` | string | pressure_low, pressure_high, speed_exceeded, no_signal, anomaly |
| `status` | string | open, acknowledged, in_progress, resolved |
| `machineId` | uuid | Filtrar por máquina |
| `startDate` | ISO8601 | Data inicial |
| `endDate` | ISO8601 | Data final |
| `limit` | integer | 1-500 (padrão: 100) |
| `offset` | integer | Paginação |

**Exemplo de Request:**
```bash
curl -X GET \
  "https://xxx.supabase.co/functions/v1/alerts?severity=critical&status=open&limit=10" \
  -H "Authorization: Bearer eyJ..."
```

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "machineId": "uuid",
      "machineName": "Trator 001",
      "machineModel": "John Deere 8R",
      "type": "pressure_low",
      "severity": "critical",
      "status": "open",
      "message": "Pressão crítica: 1.8 bar",
      "openedAt": "2026-01-10T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  },
  "summary": {
    "bySeverity": {
      "critical": 5,
      "high": 25,
      "medium": 70,
      "low": 50
    }
  }
}
```

---

### POST /functions/v1/telemetry-ingest

Recebe dados de telemetria dos sensores IoT.

**Headers:**
```
Authorization: Bearer <jwt_token>
# OU
X-API-Key: <telemetry_api_key>
```

**Request Body (Leitura única):**
```json
{
  "machineId": "uuid",
  "tireId": "uuid",
  "pressure": 3.2,
  "speed": 25.5,
  "timestamp": "2026-01-10T15:30:00Z"
}
```

**Request Body (Lote):**
```json
{
  "readings": [
    { "machineId": "uuid", "pressure": 3.2, "speed": 25.5 },
    { "machineId": "uuid", "pressure": 3.1, "speed": 30.0 }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "processed": 2,
  "alerts_generated": 1,
  "timestamp": "2026-01-10T15:30:00Z"
}
```

**Regras de Alerta Automático:**

| Condição | Tipo | Severidade |
|----------|------|------------|
| pressure < 2.0 | pressure_low | critical |
| pressure < 2.5 | pressure_low | high |
| pressure > 5.0 | pressure_high | critical |
| pressure > 4.5 | pressure_high | medium |
| speed > 80 | speed_exceeded | critical |
| speed > 60 | speed_exceeded | high |

---

### POST /functions/v1/ai-insights

Gera análises usando inteligência artificial.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "type": "insights",
  "fleetData": {
    "totalMachines": 50,
    "machinesOperational": 40,
    "machinesWarning": 5,
    "machinesCritical": 3,
    "machinesOffline": 2,
    "activeAlerts": 15,
    "fleetHealthScore": 85
  }
}
```

**Tipos de análise:**
- `insights` - Resumo executivo da frota
- `prediction` - Previsão de manutenção
- `anomaly` - Detecção de anomalias
- `recommendations` - Recomendações de ação

**Response - insights:**
```json
{
  "type": "insights",
  "insight": "A frota apresenta bom desempenho geral com 80% das máquinas operacionais. Atenção ao Trator 001 que mostra tendência de queda de pressão.",
  "timestamp": "2026-01-10T15:30:00Z"
}
```

**Response - prediction:**
```json
{
  "type": "prediction",
  "data": [
    {
      "machine": "Trator 001",
      "risk": "pressure",
      "days": 3,
      "confidence": "high",
      "reason": "Pressão em declínio constante"
    }
  ]
}
```

---

### GET /functions/v1/occurrences

Lista ocorrências.

**Query Parameters:**
- `status` - Filtrar por status
- `machineId` - Filtrar por máquina
- `limit` - Limite de resultados
- `offset` - Paginação

---

### POST /functions/v1/alert-actions

Executa ações em alertas.

**Request Body:**
```json
{
  "alertId": "uuid",
  "action": "acknowledge",
  "data": {
    "comment": "Verificando em campo"
  }
}
```

**Ações disponíveis:**
- `acknowledge` - Reconhecer alerta
- `resolve` - Resolver alerta
- `assign` - Atribuir a alguém

---

### GET /functions/v1/machine-timeline

Busca timeline de eventos de uma máquina.

**Query Parameters:**
- `machineId` - ID da máquina (obrigatório)
- `startDate` - Data inicial
- `endDate` - Data final
- `limit` - Limite de eventos

## Códigos de Erro

| Código | Significado |
|--------|-------------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não existe |
| 429 | Too Many Requests - Rate limit |
| 500 | Internal Server Error |

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| telemetry-ingest | 1000 req/min por API key |
| ai-insights | 10 req/min por usuário |
| alerts | 100 req/min por usuário |

## Próximos Passos

- [API Reference](12-API-REFERENCE.md) - Exemplos completos com cURL
- [Autenticação](07-AUTENTICACAO.md) - Detalhes de autenticação
