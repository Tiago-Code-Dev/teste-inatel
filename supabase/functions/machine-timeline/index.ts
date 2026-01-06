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

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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
    // Require authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create authenticated client for RLS enforcement
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Validate the token
    const token = authHeader.replace('Bearer ', '')
    const { data: claims, error: authError } = await supabaseAuth.auth.getClaims(token)
    
    if (authError || !claims?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const machineId = url.searchParams.get('machineId') || pathParts[pathParts.length - 1]
    
    // Validate machineId format
    if (!machineId || machineId === 'machine-timeline' || !uuidRegex.test(machineId)) {
      return new Response(
        JSON.stringify({ error: 'Valid Machine ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    
    // Validate date formats
    if (startDate && isNaN(Date.parse(startDate))) {
      return new Response(
        JSON.stringify({ error: 'Invalid startDate format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return new Response(
        JSON.stringify({ error: 'Invalid endDate format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const eventTypesParam = url.searchParams.get('eventTypes')
    const validEventTypes = ['alert', 'occurrence', 'telemetry']
    let eventTypes = eventTypesParam?.split(',').filter(t => validEventTypes.includes(t)) || validEventTypes
    if (eventTypes.length === 0) {
      eventTypes = validEventTypes
    }

    const limitParam = url.searchParams.get('limit')
    const limit = Math.min(Math.max(parseInt(limitParam || '100', 10) || 100, 1), 500)

    const timeline: TimelineEvent[] = []

    // Fetch machine info using authenticated client (RLS enforced)
    const { data: machine, error: machineError } = await supabaseAuth
      .from('machines')
      .select('*')
      .eq('id', machineId)
      .single()

    if (machineError || !machine) {
      return new Response(
        JSON.stringify({ error: 'Machine not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch alerts using authenticated client
    if (eventTypes.includes('alert')) {
      let alertQuery = supabaseAuth
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

    // Fetch occurrences using authenticated client
    if (eventTypes.includes('occurrence')) {
      let occurrenceQuery = supabaseAuth
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

    // Fetch critical telemetry (anomalies only) using authenticated client
    if (eventTypes.includes('telemetry')) {
      let telemetryQuery = supabaseAuth
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

    console.log(`Fetched ${limitedTimeline.length} timeline events for machine ${machineId} by user ${claims.claims.sub}`)

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
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
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
