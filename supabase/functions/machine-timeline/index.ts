import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TimelineEvent {
  id: string
  type: 'alert' | 'occurrence' | 'maintenance' | 'telemetry' | 'installation' | 'removal'
  title: string
  description: string
  timestamp: string
  severity?: string
  metadata?: Record<string, any>
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
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

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const machineId = url.searchParams.get('machineId') || pathParts[pathParts.length - 1]
    
    if (!machineId || machineId === 'machine-timeline') {
      return new Response(
        JSON.stringify({ error: 'Machine ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const eventTypes = url.searchParams.get('eventTypes')?.split(',') || ['alert', 'occurrence', 'telemetry']
    const limit = parseInt(url.searchParams.get('limit') || '100')

    const timeline: TimelineEvent[] = []

    // Fetch machine info
    const { data: machine } = await supabase
      .from('machines')
      .select('*')
      .eq('id', machineId)
      .single()

    if (!machine) {
      return new Response(
        JSON.stringify({ error: 'Machine not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch alerts
    if (eventTypes.includes('alert')) {
      let alertQuery = supabase
        .from('alerts')
        .select('*, tires:tire_id(serial, position)')
        .eq('machine_id', machineId)
        .order('opened_at', { ascending: false })
        .limit(limit)

      if (startDate) alertQuery = alertQuery.gte('opened_at', startDate)
      if (endDate) alertQuery = alertQuery.lte('opened_at', endDate)

      const { data: alerts } = await alertQuery

      alerts?.forEach(alert => {
        timeline.push({
          id: `alert-${alert.id}`,
          type: 'alert',
          title: getAlertTitle(alert.type),
          description: alert.message,
          timestamp: alert.opened_at,
          severity: alert.severity,
          metadata: {
            alertId: alert.id,
            type: alert.type,
            status: alert.status,
            reason: alert.reason,
            probableCause: alert.probable_cause,
            recommendedAction: alert.recommended_action,
            tireSerial: alert.tires?.serial,
            tirePosition: alert.tires?.position
          }
        })
      })
    }

    // Fetch occurrences
    if (eventTypes.includes('occurrence')) {
      let occurrenceQuery = supabase
        .from('occurrences')
        .select('*, tires:tire_id(serial, position)')
        .eq('machine_id', machineId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (startDate) occurrenceQuery = occurrenceQuery.gte('created_at', startDate)
      if (endDate) occurrenceQuery = occurrenceQuery.lte('created_at', endDate)

      const { data: occurrences } = await occurrenceQuery

      occurrences?.forEach(occ => {
        timeline.push({
          id: `occurrence-${occ.id}`,
          type: 'occurrence',
          title: 'Ocorrência Registrada',
          description: occ.description,
          timestamp: occ.created_at,
          severity: occ.status === 'open' ? 'high' : 'low',
          metadata: {
            occurrenceId: occ.id,
            status: occ.status,
            createdBy: occ.created_by,
            alertId: occ.alert_id,
            tireSerial: occ.tires?.serial,
            tirePosition: occ.tires?.position
          }
        })
      })
    }

    // Fetch critical telemetry (anomalies only)
    if (eventTypes.includes('telemetry')) {
      let telemetryQuery = supabase
        .from('telemetry')
        .select('*, tires:tire_id(serial, position)')
        .eq('machine_id', machineId)
        .or('pressure.lt.2.5,pressure.gt.4.5,speed.gt.60')
        .order('timestamp', { ascending: false })
        .limit(Math.min(limit, 50))

      if (startDate) telemetryQuery = telemetryQuery.gte('timestamp', startDate)
      if (endDate) telemetryQuery = telemetryQuery.lte('timestamp', endDate)

      const { data: telemetry } = await telemetryQuery

      telemetry?.forEach(t => {
        const isHighPressure = t.pressure > 4.5
        const isLowPressure = t.pressure < 2.5
        const isHighSpeed = t.speed > 60
        
        let title = 'Telemetria Crítica'
        let description = ''
        let severity = 'medium'

        if (t.pressure < 2.0 || t.pressure > 5.0 || t.speed > 80) {
          severity = 'critical'
        } else if (isLowPressure || isHighPressure || isHighSpeed) {
          severity = 'high'
        }

        if (isLowPressure) {
          description = `Pressão baixa detectada: ${t.pressure} bar`
        } else if (isHighPressure) {
          description = `Pressão alta detectada: ${t.pressure} bar`
        } else if (isHighSpeed) {
          description = `Velocidade elevada: ${t.speed} km/h`
        }

        timeline.push({
          id: `telemetry-${t.id}`,
          type: 'telemetry',
          title,
          description,
          timestamp: t.timestamp,
          severity,
          metadata: {
            telemetryId: t.id,
            pressure: t.pressure,
            speed: t.speed,
            tireSerial: t.tires?.serial,
            tirePosition: t.tires?.position
          }
        })
      })
    }

    // Sort timeline by timestamp descending
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit results
    const limitedTimeline = timeline.slice(0, limit)

    console.log(`Fetched ${limitedTimeline.length} timeline events for machine ${machineId}`)

    return new Response(
      JSON.stringify({
        machine: {
          id: machine.id,
          name: machine.name,
          model: machine.model,
          status: machine.status,
          lastTelemetryAt: machine.last_telemetry_at
        },
        timeline: limitedTimeline,
        total: timeline.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Timeline fetch error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getAlertTitle(type: string): string {
  const titles: Record<string, string> = {
    'pressure_low': 'Alerta de Pressão Baixa',
    'pressure_high': 'Alerta de Pressão Alta',
    'speed_exceeded': 'Alerta de Velocidade',
    'no_signal': 'Perda de Sinal',
    'anomaly': 'Anomalia Detectada'
  }
  return titles[type] || 'Alerta'
}
