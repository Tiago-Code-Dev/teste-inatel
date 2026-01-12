import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FleetData {
  totalMachines: number;
  machinesOperational: number;
  machinesWarning: number;
  machinesCritical: number;
  machinesOffline: number;
  activeAlerts: number;
  criticalAlerts: number;
  fleetHealthScore: number;
  telemetryData?: {
    machineId: string;
    machineName: string;
    pressure: number[];
    speed: number[];
    status: string;
  }[];
}

interface AnalysisRequest {
  type: 'insights' | 'prediction' | 'anomaly' | 'recommendations';
  fleetData: FleetData;
}

function buildSystemPrompt(type: string): string {
  const baseContext = `Você é um especialista em análise de frotas de máquinas agrícolas e industriais.
Você analisa dados de telemetria (pressão de pneus, velocidade) e status de máquinas para fornecer insights acionáveis.
Responda SEMPRE em português brasileiro. Seja conciso e direto.`;

  switch (type) {
    case 'insights':
      return `${baseContext}

Sua tarefa é gerar um RESUMO EXECUTIVO do estado da frota em 2-3 frases.
- Destaque o ponto mais importante (positivo ou negativo)
- Mencione tendências relevantes
- Use linguagem clara e profissional
- Formato: texto corrido, sem bullets`;

    case 'prediction':
      return `${baseContext}

Sua tarefa é analisar tendências de telemetria e PREVER necessidades de manutenção.
Para cada máquina com risco, forneça:
- Nome da máquina
- Tipo de risco (pressão/desgaste/velocidade)
- Prazo estimado (dias)
- Confiança (alta/média/baixa)

Retorne um JSON array com esta estrutura:
[{"machine": "nome", "risk": "tipo", "days": numero, "confidence": "nivel", "reason": "explicação breve"}]

Se não houver riscos, retorne: []`;

    case 'anomaly':
      return `${baseContext}

Sua tarefa é DETECTAR ANOMALIAS nos dados de telemetria.
Analise padrões de pressão e velocidade para identificar comportamentos anômalos.
Para cada anomalia, forneça:
- Máquina afetada
- Tipo de anomalia
- Severidade (info/warning/critical)
- Descrição breve

Retorne um JSON array:
[{"machine": "nome", "type": "tipo", "severity": "nivel", "description": "explicação"}]

Se não houver anomalias, retorne: []`;

    case 'recommendations':
      return `${baseContext}

Sua tarefa é gerar RECOMENDAÇÕES PROATIVAS para melhorar a operação.
Baseado no estado atual, sugira 2-4 ações prioritárias.
Para cada recomendação:
- Ação específica
- Impacto esperado
- Prioridade (alta/média/baixa)
- Categoria (manutenção/operação/segurança/custo)

Retorne um JSON array:
[{"action": "ação", "impact": "impacto", "priority": "nivel", "category": "categoria"}]`;

    default:
      return baseContext;
  }
}

function buildUserPrompt(type: string, data: FleetData): string {
  const baseStats = `
ESTADO ATUAL DA FROTA:
- Total de máquinas: ${data.totalMachines}
- Operacionais: ${data.machinesOperational}
- Em alerta: ${data.machinesWarning}
- Críticas: ${data.machinesCritical}
- Offline: ${data.machinesOffline}
- Alertas ativos: ${data.activeAlerts} (${data.criticalAlerts} críticos)
- Score de saúde: ${data.fleetHealthScore}%`;

  const telemetryInfo = data.telemetryData?.length 
    ? `\n\nDADOS DE TELEMETRIA:
${data.telemetryData.map(t => `
Máquina: ${t.machineName} (${t.status})
- Pressão (últimas leituras PSI): ${t.pressure.slice(-5).map(p => p.toFixed(1)).join(', ')}
- Velocidade (últimas leituras km/h): ${t.speed.slice(-5).map(s => s.toFixed(0)).join(', ')}`).join('\n')}`
    : '';

  switch (type) {
    case 'insights':
      return `${baseStats}${telemetryInfo}\n\nGere um resumo executivo do estado da frota.`;
    case 'prediction':
      return `${baseStats}${telemetryInfo}\n\nAnalise os dados e preveja necessidades de manutenção.`;
    case 'anomaly':
      return `${baseStats}${telemetryInfo}\n\nIdentifique anomalias nos padrões de telemetria.`;
    case 'recommendations':
      return `${baseStats}${telemetryInfo}\n\nSugira ações para melhorar a operação.`;
    default:
      return baseStats;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, fleetData } = await req.json() as AnalysisRequest;
    
    if (!type || !fleetData) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, fleetData" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(type);
    const userPrompt = buildUserPrompt(type, fleetData);

    console.log(`[AI Insights] Processing ${type} request`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI Insights] API error: ${response.status}`, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log(`[AI Insights] ${type} analysis completed`);

    // Parse response based on type
    let result: any;
    
    if (type === 'insights') {
      result = { insight: content.trim() };
    } else {
      // Try to parse JSON from response
      try {
        // Extract JSON from response (may be wrapped in markdown code blocks)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          result = { data: JSON.parse(jsonMatch[0]) };
        } else {
          result = { data: [], raw: content };
        }
      } catch {
        result = { data: [], raw: content };
      }
    }

    return new Response(
      JSON.stringify({ type, ...result, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[AI Insights] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        type: "error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
