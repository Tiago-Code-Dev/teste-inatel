import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const severity = url.searchParams.get('severity')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const machineId = url.searchParams.get('machineId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    
    // Validate and sanitize pagination params
    const limitParam = url.searchParams.get('limit')
    const offsetParam = url.searchParams.get('offset')
    const limit = Math.min(Math.max(parseInt(limitParam || '100', 10) || 100, 1), 500)
    const offset = Math.max(parseInt(offsetParam || '0', 10) || 0, 0)

    // Validate UUID format for machineId if provided
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (machineId && !uuidRegex.test(machineId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid machine ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // Validate enum values
    const validSeverities = ['critical', 'high', 'medium', 'low']
    const validStatuses = ['open', 'acknowledged', 'in_progress', 'resolved']
    const validTypes = ['pressure_low', 'pressure_high', 'speed_exceeded', 'no_signal', 'anomaly']
    
    if (severity && !validSeverities.includes(severity)) {
      return new Response(
        JSON.stringify({ error: 'Invalid severity value' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (status && !validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid status value' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (type && !validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type value' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use authenticated client - RLS policies will be enforced
    let query = supabaseAuth
      .from('alerts')
      .select(`
        *,
        machines:machine_id (
          id,
          name,
          model,
          status
        ),
        tires:tire_id (
          id,
          serial,
          position
        )
      `, { count: 'exact' })
      .order('opened_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (severity) {
      query = query.eq('severity', severity)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (machineId) {
      query = query.eq('machine_id', machineId)
    }
    if (startDate) {
      query = query.gte('opened_at', startDate)
    }
    if (endDate) {
      query = query.lte('opened_at', endDate)
    }

    const { data: alerts, error, count } = await query

    if (error) {
      console.error('Alerts query error:', error)
      throw new Error('Failed to fetch alerts')
    }

    // Transform data for API response
    const transformedAlerts = alerts?.map(alert => ({
      id: alert.id,
      machineId: alert.machine_id,
      machineName: alert.machines?.name || 'Unknown',
      machineModel: alert.machines?.model,
      machineStatus: alert.machines?.status,
      tireId: alert.tire_id,
      tireSerial: alert.tires?.serial,
      tirePosition: alert.tires?.position,
      type: alert.type,
      severity: alert.severity,
      status: alert.status,
      message: alert.message,
      reason: alert.reason,
      probableCause: alert.probable_cause,
      recommendedAction: alert.recommended_action,
      openedAt: alert.opened_at,
      updatedAt: alert.updated_at,
      acknowledgedBy: alert.acknowledged_by
    })) || []

    // Get summary counts with authenticated client
    const { data: counts } = await supabaseAuth
      .from('alerts')
      .select('severity, status')
    
    const summary = {
      total: count || 0,
      bySeverity: {
        critical: counts?.filter(a => a.severity === 'critical').length || 0,
        high: counts?.filter(a => a.severity === 'high').length || 0,
        medium: counts?.filter(a => a.severity === 'medium').length || 0,
        low: counts?.filter(a => a.severity === 'low').length || 0
      },
      byStatus: {
        open: counts?.filter(a => a.status === 'open').length || 0,
        acknowledged: counts?.filter(a => a.status === 'acknowledged').length || 0,
        in_progress: counts?.filter(a => a.status === 'in_progress').length || 0,
        resolved: counts?.filter(a => a.status === 'resolved').length || 0
      }
    }

    console.log(`Fetched ${transformedAlerts.length} alerts for user ${claims.claims.sub}`)

    return new Response(
      JSON.stringify({
        alerts: transformedAlerts,
        pagination: {
          total: count,
          limit,
          offset,
          hasMore: (offset + limit) < (count || 0)
        },
        summary
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Alerts fetch error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
