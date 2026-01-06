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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const url = new URL(req.url)
    const severity = url.searchParams.get('severity')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const machineId = url.searchParams.get('machineId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let query = supabase
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
      throw new Error(`Failed to fetch alerts: ${error.message}`)
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

    // Get summary counts
    const { data: counts } = await supabase
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

    console.log(`Fetched ${transformedAlerts.length} alerts`)

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
    const message = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
