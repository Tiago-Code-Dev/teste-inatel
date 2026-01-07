import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.23.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

// Validation schemas
const TelemetryReadingSchema = z.object({
  machineId: z.string().uuid('Invalid machine ID format'),
  tireId: z.string().uuid('Invalid tire ID format').optional(),
  pressure: z.number().min(0, 'Pressure must be positive').max(10, 'Pressure exceeds maximum'),
  speed: z.number().min(0, 'Speed must be positive').max(200, 'Speed exceeds maximum'),
  timestamp: z.string().datetime().optional(),
  seq: z.number().int().positive().optional()
})

const TelemetryBatchSchema = z.object({
  readings: z.array(TelemetryReadingSchema).min(1).max(1000)
})

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // For telemetry ingestion from IoT devices, we support:
    // 1. API key authentication (for devices)
    // 2. JWT authentication (for authenticated users/services)
    const authHeader = req.headers.get('Authorization')
    const apiKey = req.headers.get('x-api-key')
    
    // Initialize Supabase client - service role for IoT ingestion
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Validate authentication - either JWT or API key required
    let authenticatedSource = 'unknown'
    
    if (apiKey) {
      // For IoT devices: validate API key matches configured secret
      const expectedApiKey = Deno.env.get('TELEMETRY_API_KEY')
      if (!expectedApiKey || apiKey !== expectedApiKey) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      authenticatedSource = 'api_key'
    } else if (authHeader?.startsWith('Bearer ')) {
      // For authenticated services/users: validate JWT
      const token = authHeader.replace('Bearer ', '')
      const { data: claims, error: authError } = await supabase.auth.getClaims(token)
      
      if (authError || !claims?.claims?.sub) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      authenticatedSource = `user:${claims.claims.sub}`
    } else {
      return new Response(
        JSON.stringify({ error: 'Authentication required. Provide Authorization header or x-api-key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    
    // Support both single reading and batch - validate with Zod
    let readings
    try {
      if (body.readings) {
        const validated = TelemetryBatchSchema.parse(body)
        readings = validated.readings
      } else {
        const validated = TelemetryReadingSchema.parse(body)
        readings = [validated]
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return new Response(
          JSON.stringify({ 
            error: 'Validation failed', 
            details: validationError.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw validationError
    }

    // Validate that machineIds exist before processing
    const uniqueMachineIds = [...new Set(readings.map(r => r.machineId))]
    const { data: validMachines, error: machineError } = await supabase
      .from('machines')
      .select('id')
      .in('id', uniqueMachineIds)

    if (machineError) {
      throw new Error('Failed to validate machines')
    }

    const validMachineIds = new Set(validMachines?.map(m => m.id) || [])
    const invalidMachines = uniqueMachineIds.filter(id => !validMachineIds.has(id))
    
    if (invalidMachines.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid machine IDs', 
          invalidIds: invalidMachines 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare validated telemetry records
    const telemetryRecords = []
    const alertsToCreate = []
    const machineUpdates = new Map<string, { pressure: number, speed: number, timestamp: string }>()

    for (const reading of readings) {
      const timestamp = reading.timestamp || new Date().toISOString()
      const seq = reading.seq || Date.now()

      telemetryRecords.push({
        machine_id: reading.machineId,
        tire_id: reading.tireId || null,
        pressure: reading.pressure,
        speed: reading.speed,
        timestamp,
        seq,
      })

      // Track latest reading per machine for status update
      const existing = machineUpdates.get(reading.machineId)
      if (!existing || new Date(timestamp) > new Date(existing.timestamp)) {
        machineUpdates.set(reading.machineId, { pressure: reading.pressure, speed: reading.speed, timestamp })
      }

      // Alert generation rules
      const alerts = generateAlerts(reading, timestamp)
      alertsToCreate.push(...alerts)
    }

    // Insert telemetry data
    if (telemetryRecords.length > 0) {
      const { error: telemetryError } = await supabase
        .from('telemetry')
        .insert(telemetryRecords)

      if (telemetryError) {
        console.error('Telemetry insert error:', telemetryError)
        return new Response(
          JSON.stringify({ error: 'Failed to process telemetry data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Update machine last_telemetry_at and status
    for (const [machineId, data] of machineUpdates) {
      const status = determineStatus(data.pressure, data.speed)
      
      await supabase
        .from('machines')
        .update({ 
          last_telemetry_at: data.timestamp,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', machineId)
    }

    // Create alerts if any
    if (alertsToCreate.length > 0) {
      const { error: alertError } = await supabase
        .from('alerts')
        .insert(alertsToCreate)

      if (alertError) {
        console.error('Alert insert error:', alertError)
      }
    }

    // Log audit event
    await supabase.from('audit_events').insert({
      entity_type: 'telemetry',
      entity_id: telemetryRecords[0]?.machine_id || 'batch',
      action: 'ingest',
      metadata: { 
        count: telemetryRecords.length,
        alerts_generated: alertsToCreate.length,
        source: authenticatedSource
      }
    })

    console.log(`[${authenticatedSource}] Processed ${telemetryRecords.length} telemetry readings, generated ${alertsToCreate.length} alerts`)

    return new Response(
      JSON.stringify({
        success: true,
        processed: telemetryRecords.length,
        alerts_generated: alertsToCreate.length,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Telemetry ingest error:', error)
    return new Response(
      JSON.stringify({ error: 'Processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateAlerts(reading: z.infer<typeof TelemetryReadingSchema>, timestamp: string): any[] {
  const alerts = []
  
  // Pressure thresholds (in bar)
  const PRESSURE_LOW_CRITICAL = 2.0
  const PRESSURE_LOW_WARNING = 2.5
  const PRESSURE_HIGH_WARNING = 4.5
  const PRESSURE_HIGH_CRITICAL = 5.0
  
  // Speed threshold (km/h)
  const SPEED_CRITICAL = 80
  const SPEED_WARNING = 60

  if (reading.pressure < PRESSURE_LOW_CRITICAL) {
    alerts.push({
      machine_id: reading.machineId,
      tire_id: reading.tireId || null,
      type: 'pressure_low',
      severity: 'critical',
      status: 'open',
      message: `Pressão crítica: ${reading.pressure} bar`,
      reason: 'Pressão abaixo do limite crítico',
      probable_cause: 'Possível furo ou vazamento',
      recommended_action: 'Parar máquina imediatamente e verificar pneu',
      opened_at: timestamp,
      updated_at: timestamp
    })
  } else if (reading.pressure < PRESSURE_LOW_WARNING) {
    alerts.push({
      machine_id: reading.machineId,
      tire_id: reading.tireId || null,
      type: 'pressure_low',
      severity: 'high',
      status: 'open',
      message: `Pressão baixa: ${reading.pressure} bar`,
      reason: 'Pressão abaixo do recomendado',
      probable_cause: 'Desgaste ou vazamento lento',
      recommended_action: 'Verificar pneu na próxima parada',
      opened_at: timestamp,
      updated_at: timestamp
    })
  } else if (reading.pressure > PRESSURE_HIGH_CRITICAL) {
    alerts.push({
      machine_id: reading.machineId,
      tire_id: reading.tireId || null,
      type: 'pressure_high',
      severity: 'critical',
      status: 'open',
      message: `Pressão excessiva: ${reading.pressure} bar`,
      reason: 'Pressão acima do limite crítico',
      probable_cause: 'Sobreaquecimento ou calibração incorreta',
      recommended_action: 'Reduzir pressão imediatamente',
      opened_at: timestamp,
      updated_at: timestamp
    })
  } else if (reading.pressure > PRESSURE_HIGH_WARNING) {
    alerts.push({
      machine_id: reading.machineId,
      tire_id: reading.tireId || null,
      type: 'pressure_high',
      severity: 'medium',
      status: 'open',
      message: `Pressão elevada: ${reading.pressure} bar`,
      reason: 'Pressão acima do recomendado',
      probable_cause: 'Calibração elevada',
      recommended_action: 'Monitorar e ajustar se necessário',
      opened_at: timestamp,
      updated_at: timestamp
    })
  }

  if (reading.speed > SPEED_CRITICAL) {
    alerts.push({
      machine_id: reading.machineId,
      tire_id: reading.tireId || null,
      type: 'speed_exceeded',
      severity: 'critical',
      status: 'open',
      message: `Velocidade crítica: ${reading.speed} km/h`,
      reason: 'Velocidade excede limite seguro',
      probable_cause: 'Operação fora dos parâmetros',
      recommended_action: 'Reduzir velocidade imediatamente',
      opened_at: timestamp,
      updated_at: timestamp
    })
  } else if (reading.speed > SPEED_WARNING) {
    alerts.push({
      machine_id: reading.machineId,
      tire_id: reading.tireId || null,
      type: 'speed_exceeded',
      severity: 'high',
      status: 'open',
      message: `Velocidade elevada: ${reading.speed} km/h`,
      reason: 'Velocidade acima do recomendado',
      probable_cause: 'Operação em velocidade elevada',
      recommended_action: 'Monitorar e reduzir se necessário',
      opened_at: timestamp,
      updated_at: timestamp
    })
  }

  return alerts
}

function determineStatus(pressure: number, speed: number): string {
  if (pressure < 2.0 || pressure > 5.0 || speed > 80) {
    return 'critical'
  }
  if (pressure < 2.5 || pressure > 4.5 || speed > 60) {
    return 'warning'
  }
  return 'operational'
}
