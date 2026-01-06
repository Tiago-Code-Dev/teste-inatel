import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateOccurrencePayload {
  alertId?: string
  machineId: string
  tireId?: string
  description: string
  assignedTo?: string
  isOfflineCreated?: boolean
}

interface UpdateOccurrencePayload {
  status?: string
  description?: string
  assignedTo?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const occurrenceId = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null

  try {
    // GET - List or single occurrence
    if (req.method === 'GET') {
      if (occurrenceId && occurrenceId !== 'occurrences') {
        // Get single occurrence
        const { data: occurrence, error } = await supabase
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
      const limit = parseInt(url.searchParams.get('limit') || '100')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = supabase
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
        throw new Error(`Failed to fetch occurrences: ${error.message}`)
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
      const authHeader = req.headers.get('Authorization')
      let userId = 'system'

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        const { data: claims } = await supabase.auth.getClaims(token)
        if (claims?.claims?.sub) {
          userId = claims.claims.sub
        }
      }

      const body: CreateOccurrencePayload = await req.json()

      if (!body.machineId || !body.description) {
        return new Response(
          JSON.stringify({ error: 'Machine ID and description are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: occurrence, error } = await supabase
        .from('occurrences')
        .insert({
          machine_id: body.machineId,
          tire_id: body.tireId || null,
          alert_id: body.alertId || null,
          description: body.description,
          created_by: userId,
          status: 'open',
          is_offline_created: body.isOfflineCreated || false,
          synced_at: body.isOfflineCreated ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create occurrence: ${error.message}`)
      }

      // If linked to an alert, update alert status
      if (body.alertId) {
        await supabase
          .from('alerts')
          .update({ status: 'in_progress', updated_at: new Date().toISOString() })
          .eq('id', body.alertId)
      }

      // Log audit event
      await supabase.from('audit_events').insert({
        entity_type: 'occurrence',
        entity_id: occurrence.id,
        action: 'create',
        actor_id: userId,
        metadata: { machineId: body.machineId, alertId: body.alertId }
      })

      console.log(`Created occurrence ${occurrence.id} for machine ${body.machineId}`)

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
      if (!occurrenceId || occurrenceId === 'occurrences') {
        return new Response(
          JSON.stringify({ error: 'Occurrence ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const authHeader = req.headers.get('Authorization')
      let userId = 'system'

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        const { data: claims } = await supabase.auth.getClaims(token)
        if (claims?.claims?.sub) {
          userId = claims.claims.sub
        }
      }

      const body: UpdateOccurrencePayload = await req.json()

      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      }

      if (body.status) updateData.status = body.status
      if (body.description) updateData.description = body.description

      const { data: occurrence, error } = await supabase
        .from('occurrences')
        .update(updateData)
        .eq('id', occurrenceId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update occurrence: ${error.message}`)
      }

      // If closing occurrence, also resolve linked alert
      if (body.status === 'closed' && occurrence.alert_id) {
        await supabase
          .from('alerts')
          .update({ status: 'resolved', updated_at: new Date().toISOString() })
          .eq('id', occurrence.alert_id)
      }

      // Log audit event
      await supabase.from('audit_events').insert({
        entity_type: 'occurrence',
        entity_id: occurrenceId,
        action: 'update',
        actor_id: userId,
        metadata: { changes: body }
      })

      console.log(`Updated occurrence ${occurrenceId}`)

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
    const message = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
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
