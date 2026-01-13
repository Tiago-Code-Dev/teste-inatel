# 📋 ADRs - Registros de Decisões de Arquitetura

## O que é um ADR?

**ADR** significa **Architecture Decision Record** (Registro de Decisão de Arquitetura).

### Explicação Simples

Imagine que você está construindo uma casa e precisa decidir:
- Vou usar tijolo ou madeira?
- O telhado vai ser de telha ou laje?
- A cozinha vai ficar perto da sala ou longe?

Cada decisão dessas tem **prós e contras**. Se você não anotar **por que** tomou cada decisão, daqui a 1 ano você pode esquecer e se perguntar: "Por que fizemos assim?"

Um **ADR** é simplesmente um documento que registra:
1. **Qual foi a decisão** tomada
2. **Por que** tomamos essa decisão
3. **Quais alternativas** consideramos
4. **Quais são as consequências** dessa decisão

---

## Por que isso é importante?

| Sem ADRs | Com ADRs |
|----------|----------|
| "Por que usamos React?" 🤷 | "Usamos React porque..." ✅ |
| "Quem decidiu usar Supabase?" 🤷 | "Decidimos Supabase em 15/01/2026 por causa de..." ✅ |
| Decisões perdidas no tempo | Histórico completo de decisões |
| Novos desenvolvedores ficam perdidos | Novos desenvolvedores entendem rapidamente |

---

## Lista de ADRs do TireWatch Pro

| # | Título | Status | Data |
|---|--------|--------|------|
| [ADR-001](./ADR-001-escolha-react.md) | Escolha do React como framework frontend | ✅ Aceito | Jan/2026 |
| [ADR-002](./ADR-002-escolha-supabase.md) | Escolha do Supabase como backend | ✅ Aceito | Jan/2026 |
| [ADR-003](./ADR-003-escolha-typescript.md) | Uso de TypeScript em todo o projeto | ✅ Aceito | Jan/2026 |
| [ADR-004](./ADR-004-tailwind-shadcn.md) | Tailwind CSS + shadcn/ui para estilização | ✅ Aceito | Jan/2026 |

---

## Como Ler um ADR

Cada ADR segue este formato:

```
# Título da Decisão

## Status
Aceito / Rejeitado / Substituído / Proposto

## Contexto
Qual problema estávamos tentando resolver?

## Decisão
O que decidimos fazer?

## Alternativas Consideradas
O que mais podíamos ter escolhido?

## Consequências
O que acontece por causa dessa decisão?
```

---

## Perguntas Frequentes

### "Preciso ler todos os ADRs?"

**Não!** Leia apenas os que são relevantes para o que você está fazendo. Por exemplo:
- Vai trabalhar no frontend? Leia ADR-001 (React) e ADR-004 (Tailwind)
- Vai trabalhar com banco de dados? Leia ADR-002 (Supabase)

### "Posso mudar uma decisão?"

**Sim!** Tecnologia evolui. Se uma decisão não faz mais sentido, criamos um novo ADR explicando a mudança e marcamos o antigo como "Substituído".

### "Quem pode criar um ADR?"

Qualquer pessoa da equipe pode propor um ADR. Geralmente discutimos em equipe antes de aceitar.

---

## Template para Novo ADR

Se precisar criar um novo ADR, use o template em:
`docs/templates/adr-template.md`
