import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.23.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schemas
const AlertActionSchema = z.object({
  action: z.enum(['assign', 'acknowledge', 'resolve', 'reopen']),
  assignedTo: z.string().uuid('Invalid user ID format').optional(),
  comment: z.string().max(1000, 'Comment too long').optional()
})

// Valid status transitions
const validTransitions: Record<string, string[]> = {
  'open': ['acknowledged', 'in_progress', 'resolved'],
  'acknowledged': ['in_progress', 'resolved', 'open'],
  'in_progress': ['resolved', 'open'],
  'resolved': ['open']
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

    // Validate the token and get user info
    const token = authHeader.replace('Bearer ', '')
    const { data: claims, error: authError } = await supabaseAuth.auth.getClaims(token)
    
    if (authError || !claims?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claims.claims.sub
    const userEmail = claims.claims.email

    const url = new URL(req.url)
    const alertId = url.searchParams.get('alertId')

    // Validate alertId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!alertId || !uuidRegex.test(alertId)) {
      return new Response(
        JSON.stringify({ error: 'Valid Alert ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse and validate request body
    const rawBody = await req.json()
    let body: z.infer<typeof AlertActionSchema>
    
    try {
      body = AlertActionSchema.parse(rawBody)
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

    // Get current alert using authenticated client (RLS enforced)
    const { data: alert, error: fetchError } = await supabaseAuth
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

    // Determine new status and validate transition
    let newStatus: string
    switch (body.action) {
      case 'assign':
      case 'acknowledge':
        newStatus = 'acknowledged'
        break
      case 'resolve':
        newStatus = 'resolved'
        break
      case 'reopen':
        newStatus = 'open'
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Validate status transition
    const allowedTransitions = validTransitions[alert.status] || []
    if (!allowedTransitions.includes(newStatus) && alert.status !== newStatus) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid status transition', 
          currentStatus: alert.status,
          attemptedStatus: newStatus,
          allowedStatuses: allowedTransitions
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If assigning, validate assignedTo user exists
    if (body.action === 'assign') {
      if (!body.assignedTo) {
        return new Response(
          JSON.stringify({ error: 'assignedTo is required for assign action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Use service role to validate user exists (profiles table may have RLS)
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      const { data: targetUser, error: userError } = await supabaseService
        .from('profiles')
        .select('user_id')
        .eq('user_id', body.assignedTo)
        .single()

      if (userError || !targetUser) {
        return new Response(
          JSON.stringify({ error: 'Invalid assignedTo user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
      status: newStatus
    }

    switch (body.action) {
      case 'assign':
        updateData.acknowledged_by = body.assignedTo
        break
      case 'acknowledge':
        updateData.acknowledged_by = userId
        break
      case 'reopen':
        updateData.acknowledged_by = null
        break
    }

    // Update alert using authenticated client (RLS enforced)
    const { data: updatedAlert, error: updateError } = await supabaseAuth
      .from('alerts')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single()

    if (updateError) {
      console.error('Alert update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update alert. You may not have permission.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log audit event using service role (audit events may bypass RLS for system logging)
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabaseService.from('audit_events').insert({
      entity_type: 'alert',
      entity_id: alertId,
      action: body.action,
      actor_id: userId,
      metadata: { 
        previousStatus: alert.status,
        newStatus: updateData.status,
        comment: body.comment?.slice(0, 500),
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
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
