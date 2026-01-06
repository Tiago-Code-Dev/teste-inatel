import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelemetryPayload {
  machineId: string
  tireId?: string
  pressure: number
  speed: number
  timestamp?: string
  seq?: number
}

interface TelemetryBatch {
  readings: TelemetryPayload[]
}

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()
    
    // Support both single reading and batch
    const readings: TelemetryPayload[] = body.readings || [body]
    
    if (!readings.length) {
      return new Response(
        JSON.stringify({ error: 'No telemetry data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate and prepare telemetry records
    const telemetryRecords = []
    const alertsToCreate = []
    const machineUpdates = new Map<string, { pressure: number, speed: number, timestamp: string }>()

    for (const reading of readings) {
      if (!reading.machineId || reading.pressure === undefined || reading.speed === undefined) {
        console.warn('Invalid telemetry reading:', reading)
        continue
      }

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
        throw new Error(`Failed to insert telemetry: ${telemetryError.message}`)
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
        alerts_generated: alertsToCreate.length
      }
    })

    console.log(`Processed ${telemetryRecords.length} telemetry readings, generated ${alertsToCreate.length} alerts`)

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
    const message = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateAlerts(reading: TelemetryPayload, timestamp: string): any[] {
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
