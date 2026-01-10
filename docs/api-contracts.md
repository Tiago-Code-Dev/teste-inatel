# TireWatch Pro - Contratos de API

## Autenticação

### JWT (Usuários)
```http
Authorization: Bearer <supabase_jwt_token>
```

### API Key (IoT Devices)
```http
X-API-Key: <telemetry_api_key>
```

---

## Edge Functions

### GET /functions/v1/alerts

Lista alertas com filtros.

**Query Parameters:**
- `severity`: critical/high/medium/low
- `type`: pressure_low/pressure_high/speed_exceeded/no_signal/anomaly
- `status`: open/acknowledged/in_progress/resolved
- `machineId`: UUID da máquina
- `limit`: 1-500 (default: 100)
- `offset`: Paginação

**Response:**
```json
{
  "alerts": [...],
  "pagination": { "total": 150, "limit": 100, "offset": 0, "hasMore": true },
  "summary": { "bySeverity": {...}, "byStatus": {...} }
}
```

---

### POST /functions/v1/telemetry-ingest

Ingestão de telemetria IoT.

**Request (Single):**
```json
{
  "machineId": "uuid",
  "pressure": 3.2,
  "speed": 25.5
}
```

**Request (Batch):**
```json
{
  "readings": [
    { "machineId": "uuid", "pressure": 3.2, "speed": 25.5 },
    { "machineId": "uuid", "pressure": 3.1, "speed": 30.0 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "processed": 2,
  "alerts_generated": 0
}
```

**Regras de Alerta:**
| Condição | Tipo | Severidade |
|----------|------|------------|
| pressure < 2.0 | pressure_low | critical |
| pressure < 2.5 | pressure_low | high |
| pressure > 5.0 | pressure_high | critical |
| speed > 80 | speed_exceeded | critical |

---

### POST /functions/v1/ai-insights

Análises de IA sobre a frota.

**Request:**
```json
{
  "type": "insights",
  "fleetData": {
    "totalMachines": 50,
    "machinesOperational": 40,
    "activeAlerts": 15,
    "fleetHealthScore": 85
  }
}
```

**Types disponíveis:**
- `insights`: Resumo executivo
- `prediction`: Previsão de manutenção
- `anomaly`: Detecção de anomalias
- `recommendations`: Recomendações

---

## Supabase Client SDK

### Queries
```typescript
// Lista máquinas
const { data } = await supabase
  .from('machines')
  .select('*, tires(*)')
  .eq('unit_id', selectedUnitId);

// Alertas com join
const { data } = await supabase
  .from('alerts')
  .select('*, machines(name, model)')
  .neq('status', 'resolved');
```

### Realtime
```typescript
const channel = supabase
  .channel('alerts-realtime')
  .on('postgres_changes', { event: '*', table: 'alerts' }, callback)
  .subscribe();
```

---

## Códigos de Erro

| Code | Significado |
|------|-------------|
| 400 | Validação falhou |
| 401 | Token inválido |
| 403 | Sem permissão (RLS) |
| 429 | Rate limit |
| 500 | Erro interno |
