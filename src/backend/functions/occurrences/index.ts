import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.23.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schemas
const CreateOccurrenceSchema = z.object({
  alertId: z.string().uuid('Invalid alert ID').optional(),
  machineId: z.string().uuid('Invalid machine ID'),
  tireId: z.string().uuid('Invalid tire ID').optional(),
  description: z.string().min(1, 'Description required').max(500, 'Description too long'),
  assignedTo: z.string().uuid('Invalid user ID').optional(),
  isOfflineCreated: z.boolean().optional()
})

const UpdateOccurrenceSchema = z.object({
  status: z.enum(['open', 'in_progress', 'closed']).optional(),
  description: z.string().min(1).max(500).optional()
})

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Require authentication for all methods
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

    const userId = claims.claims.sub

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const occurrenceId = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null

    // GET - List or single occurrence
    if (req.method === 'GET') {
      if (occurrenceId && occurrenceId !== 'occurrences' && uuidRegex.test(occurrenceId)) {
        // Get single occurrence
        const { data: occurrence, error } = await supabaseAuth
          .from('occurrences')
          .select(`
            *,
            machines:machine_id (id, name, model, status),
            tires:tire_id (id, serial, position),
            alerts:alert_id (id, type, severity, message),
            media_attachments (id, type, file_url, file_path, upload_status)
          `)
          .eq('id', occurrenceId)
          .single()

        if (error || !occurrence) {
          return new Response(
            JSON.stringify({ error: 'Occurrence not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ occurrence: transformOccurrence(occurrence) }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // List occurrences with filters
      const machineId = url.searchParams.get('machineId')
      const status = url.searchParams.get('status')
      const startDate = url.searchParams.get('startDate')
      const endDate = url.searchParams.get('endDate')
      
      // Validate and sanitize pagination
      const limitParam = url.searchParams.get('limit')
      const offsetParam = url.searchParams.get('offset')
      const limit = Math.min(Math.max(parseInt(limitParam || '100', 10) || 100, 1), 500)
      const offset = Math.max(parseInt(offsetParam || '0', 10) || 0, 0)

      // Validate filter inputs
      if (machineId && !uuidRegex.test(machineId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid machineId format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const validStatuses = ['open', 'in_progress', 'closed']
      if (status && !validStatuses.includes(status)) {
        return new Response(
          JSON.stringify({ error: 'Invalid status value' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

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

      let query = supabaseAuth
        .from('occurrences')
        .select(`
          *,
          machines:machine_id (id, name, model),
          tires:tire_id (id, serial, position),
          alerts:alert_id (id, type, severity)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (machineId) query = query.eq('machine_id', machineId)
      if (status) query = query.eq('status', status)
      if (startDate) query = query.gte('created_at', startDate)
      if (endDate) query = query.lte('created_at', endDate)

      const { data: occurrences, error, count } = await query

      if (error) {
        console.error('Occurrences query error:', error)
        throw new Error('Failed to fetch occurrences')
      }

      return new Response(
        JSON.stringify({
          occurrences: occurrences?.map(transformOccurrence) || [],
          pagination: {
            total: count,
            limit,
            offset,
            hasMore: (offset + limit) < (count || 0)
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - Create occurrence
    if (req.method === 'POST') {
      const rawBody = await req.json()
      
      let body: z.infer<typeof CreateOccurrenceSchema>
      try {
        body = CreateOccurrenceSchema.parse(rawBody)
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

      // Validate machine exists using service role
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      const { data: machine, error: machineError } = await supabaseService
        .from('machines')
        .select('id')
        .eq('id', body.machineId)
        .single()

      if (machineError || !machine) {
        return new Response(
          JSON.stringify({ error: 'Machine not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate tire exists if provided
      if (body.tireId) {
        const { data: tire, error: tireError } = await supabaseService
          .from('tires')
          .select('id')
          .eq('id', body.tireId)
          .single()

        if (tireError || !tire) {
          return new Response(
            JSON.stringify({ error: 'Tire not found' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // Validate alert exists if provided
      if (body.alertId) {
        const { data: alert, error: alertError } = await supabaseService
          .from('alerts')
          .select('id')
          .eq('id', body.alertId)
          .single()

        if (alertError || !alert) {
          return new Response(
            JSON.stringify({ error: 'Alert not found' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      const { data: occurrence, error } = await supabaseAuth
        .from('occurrences')
        .insert({
          machine_id: body.machineId,
          tire_id: body.tireId || null,
          alert_id: body.alertId || null,
          description: body.description.trim().slice(0, 500),
          created_by: userId,
          status: 'open',
          is_offline_created: body.isOfflineCreated || false,
          synced_at: body.isOfflineCreated ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (error) {
        console.error('Occurrence create error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create occurrence. You may not have permission.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // If linked to an alert, update alert status using service role
      if (body.alertId) {
        await supabaseService
          .from('alerts')
          .update({ status: 'in_progress', updated_at: new Date().toISOString() })
          .eq('id', body.alertId)
      }

      // Log audit event
      await supabaseService.from('audit_events').insert({
        entity_type: 'occurrence',
        entity_id: occurrence.id,
        action: 'create',
        actor_id: userId,
        metadata: { machineId: body.machineId, alertId: body.alertId }
      })

      console.log(`Created occurrence ${occurrence.id} for machine ${body.machineId} by user ${userId}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          occurrence: transformOccurrence(occurrence) 
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PATCH - Update occurrence
    if (req.method === 'PATCH') {
      if (!occurrenceId || occurrenceId === 'occurrences' || !uuidRegex.test(occurrenceId)) {
        return new Response(
          JSON.stringify({ error: 'Valid Occurrence ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const rawBody = await req.json()
      
      let body: z.infer<typeof UpdateOccurrenceSchema>
      try {
        body = UpdateOccurrenceSchema.parse(rawBody)
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

      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      }

      if (body.status) updateData.status = body.status
      if (body.description) updateData.description = body.description.trim().slice(0, 500)

      const { data: occurrence, error } = await supabaseAuth
        .from('occurrences')
        .update(updateData)
        .eq('id', occurrenceId)
        .select()
        .single()

      if (error) {
        console.error('Occurrence update error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update occurrence. You may not have permission.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // If closing occurrence, also resolve linked alert using service role
      if (body.status === 'closed' && occurrence.alert_id) {
        const supabaseService = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )
        
        await supabaseService
          .from('alerts')
          .update({ status: 'resolved', updated_at: new Date().toISOString() })
          .eq('id', occurrence.alert_id)
      }

      // Log audit event
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      await supabaseService.from('audit_events').insert({
        entity_type: 'occurrence',
        entity_id: occurrenceId,
        action: 'update',
        actor_id: userId,
        metadata: { changes: body }
      })

      console.log(`Updated occurrence ${occurrenceId} by user ${userId}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          occurrence: transformOccurrence(occurrence) 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Occurrences error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function transformOccurrence(occ: any) {
  return {
    id: occ.id,
    machineId: occ.machine_id,
    machineName: occ.machines?.name,
    machineModel: occ.machines?.model,
    tireId: occ.tire_id,
    tireSerial: occ.tires?.serial,
    tirePosition: occ.tires?.position,
    alertId: occ.alert_id,
    alertType: occ.alerts?.type,
    alertSeverity: occ.alerts?.severity,
    description: occ.description,
    status: occ.status,
    createdBy: occ.created_by,
    createdAt: occ.created_at,
    updatedAt: occ.updated_at,
    isOfflineCreated: occ.is_offline_created,
    syncedAt: occ.synced_at,
    attachments: occ.media_attachments?.map((m: any) => ({
      id: m.id,
      type: m.type,
      url: m.file_url,
      path: m.file_path,
      status: m.upload_status
    })) || []
  }
}
