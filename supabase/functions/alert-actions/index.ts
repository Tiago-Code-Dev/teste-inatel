import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertActionPayload {
  action: 'assign' | 'acknowledge' | 'resolve' | 'reopen'
  assignedTo?: string
  comment?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST' && req.method !== 'PATCH') {
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
    const alertId = url.searchParams.get('alertId')

    if (!alertId) {
      return new Response(
        JSON.stringify({ error: 'Alert ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    let userId = 'system'
    let userEmail = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: claims } = await supabase.auth.getClaims(token)
      if (claims?.claims?.sub) {
        userId = claims.claims.sub
        userEmail = claims.claims.email
      }
    }

    const body: AlertActionPayload = await req.json()

    // Get current alert
    const { data: alert, error: fetchError } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', alertId)
      .single()

    if (fetchError || !alert) {
      return new Response(
        JSON.stringify({ error: 'Alert not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    let auditAction = body.action

    switch (body.action) {
      case 'assign':
        if (!body.assignedTo) {
          return new Response(
            JSON.stringify({ error: 'assignedTo is required for assign action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        updateData.acknowledged_by = body.assignedTo
        updateData.status = 'acknowledged'
        break

      case 'acknowledge':
        updateData.acknowledged_by = userId
        updateData.status = 'acknowledged'
        break

      case 'resolve':
        updateData.status = 'resolved'
        break

      case 'reopen':
        updateData.status = 'open'
        updateData.acknowledged_by = null
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Update alert
    const { data: updatedAlert, error: updateError } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update alert: ${updateError.message}`)
    }

    // Log audit event
    await supabase.from('audit_events').insert({
      entity_type: 'alert',
      entity_id: alertId,
      action: auditAction,
      actor_id: userId,
      metadata: { 
        previousStatus: alert.status,
        newStatus: updateData.status,
        comment: body.comment,
        assignedTo: body.assignedTo
      }
    })

    console.log(`Alert ${alertId} action: ${body.action} by ${userId}`)

    return new Response(
      JSON.stringify({
        success: true,
        alert: {
          id: updatedAlert.id,
          machineId: updatedAlert.machine_id,
          type: updatedAlert.type,
          severity: updatedAlert.severity,
          status: updatedAlert.status,
          message: updatedAlert.message,
          acknowledgedBy: updatedAlert.acknowledged_by,
          updatedAt: updatedAlert.updated_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Alert action error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
