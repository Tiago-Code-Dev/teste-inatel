# 📊 NFRs - Requisitos Não-Funcionais

## O que são Requisitos Não-Funcionais?

### Explicação Simples

Quando você compra um carro, você quer que ele:
1. **Funcione** - Ande para frente e para trás (requisito funcional)
2. **Seja rápido** - Chegue a 100km/h em menos de 10 segundos (requisito não-funcional)
3. **Seja seguro** - Tenha airbags e freios ABS (requisito não-funcional)
4. **Gaste pouco** - Faça 15km por litro (requisito não-funcional)

Os **requisitos funcionais** dizem **O QUE** o sistema faz.
Os **requisitos não-funcionais** dizem **COMO** o sistema deve fazer.

### Analogia

| Requisito Funcional | Requisito Não-Funcional |
|---------------------|-------------------------|
| "O carro anda" | "O carro anda a 200km/h" |
| "O sistema mostra alertas" | "O sistema mostra alertas em menos de 1 segundo" |
| "O usuário faz login" | "O login funciona mesmo com 1000 usuários ao mesmo tempo" |

---

## NFRs do TireWatch Pro

### 1. ⚡ Performance (Velocidade)

**O que é:** O quão rápido o sistema responde.

**Nossas metas:**

| Ação | Tempo Máximo | Exemplo |
|------|--------------|---------|
| Carregar uma página | 3 segundos | Abrir o Dashboard |
| Resposta de API | 500ms | Buscar lista de máquinas |
| Atualização em tempo real | 1 segundo | Receber um novo alerta |
| Busca/filtro | 1 segundo | Filtrar máquinas por status |

**Por que isso importa?**
- Usuários ficam frustrados se o sistema é lento
- Um sistema lento parece "quebrado"
- Pesquisas mostram que 40% dos usuários abandonam sites que demoram mais de 3 segundos

---

### 2. 🔒 Segurança

**O que é:** Proteção contra invasões e vazamento de dados.

**Nossas regras:**

| Requisito | O que significa |
|-----------|-----------------|
| **Criptografia em trânsito** | Dados viajam "embaralhados" pela internet (HTTPS) |
| **Criptografia em repouso** | Dados guardados ficam "embaralhados" no banco |
| **Autenticação forte** | Senha com no mínimo 8 caracteres, letras e números |
| **Bloqueio de conta** | Após 5 tentativas erradas, conta é bloqueada por 15 minutos |
| **Sessão expira** | Usuário é deslogado após 24 horas sem usar |
| **Permissões** | Cada usuário só vê o que tem permissão |

**Por que isso importa?**
- Dados de clientes são valiosos e sensíveis
- Vazamento de dados pode gerar processos judiciais
- Conformidade com LGPD (Lei Geral de Proteção de Dados)

---

### 3. 📈 Escalabilidade

**O que é:** Capacidade de crescer sem perder performance.

**Nossas metas:**

| Métrica | Capacidade |
|---------|------------|
| Usuários simultâneos | Até 10.000 |
| Máquinas cadastradas | Até 100.000 |
| Leituras de telemetria | Até 1.000 por segundo |
| Armazenamento | Cresce automaticamente |

**Explicação simples:**

Imagine um elevador:
- Se só 1 pessoa usa, funciona bem
- Se 100 pessoas tentam usar ao mesmo tempo, quebra

Um sistema **escalável** é como ter vários elevadores - quando um fica cheio, outro assume.

**Por que isso importa?**
- O sistema pode crescer de 10 para 10.000 usuários
- Black Friday não derruba o sistema
- Novos clientes podem ser adicionados sem problemas

---

### 4. 🟢 Disponibilidade (Uptime)

**O que é:** Quanto tempo o sistema fica "no ar" funcionando.

**Nossa meta: 99.9% de disponibilidade**

| Uptime | Tempo offline por ano | Por mês | Por semana |
|--------|----------------------|---------|------------|
| 99% | 3.65 dias | 7.2 horas | 1.68 horas |
| 99.9% | 8.76 horas | 43.8 minutos | 10.1 minutos |
| 99.99% | 52.56 minutos | 4.38 minutos | 1.01 minutos |

**Por que 99.9%?**
- É o padrão da indústria para sistemas SaaS
- Permite até 43 minutos de manutenção por mês
- Equilibra custo e confiabilidade

**Por que isso importa?**
- Se o sistema cai, ninguém consegue monitorar os pneus
- Alertas não chegam
- Clientes perdem confiança

---

### 5. 🔄 Recuperação de Desastres

**O que é:** O que acontece se algo der muito errado (servidor pega fogo, hackers invadem, etc.).

**Nossas metas:**

| Sigla | Significado | Meta |
|-------|-------------|------|
| **RTO** | Recovery Time Objective - Tempo para voltar a funcionar | 4 horas |
| **RPO** | Recovery Point Objective - Quanto de dados podemos perder | 1 hora |

**Explicação simples:**

- **RTO de 4 horas** = Se tudo explodir às 10h, voltamos às 14h
- **RPO de 1 hora** = Perdemos no máximo 1 hora de dados (backup de hora em hora)

**Por que isso importa?**
- Desastres acontecem (mesmo que raramente)
- Ter um plano evita pânico
- Clientes confiam mais em empresas preparadas

---

### 6. 📱 Compatibilidade

**O que é:** Em quais dispositivos e navegadores o sistema funciona.

**Navegadores suportados:**

| Navegador | Versão Mínima | Status |
|-----------|---------------|--------|
| Chrome | 90+ | ✅ Suportado |
| Firefox | 88+ | ✅ Suportado |
| Safari | 14+ | ✅ Suportado |
| Edge | 90+ | ✅ Suportado |
| Internet Explorer | - | ❌ Não suportado |

**Dispositivos suportados:**

| Tipo | Resolução Mínima | Status |
|------|------------------|--------|
| Desktop | 1280x720 | ✅ Suportado |
| Tablet | 768x1024 | ✅ Suportado |
| Celular | 375x667 | ✅ Suportado |

**Por que isso importa?**
- Usuários usam diferentes dispositivos
- Gestores usam computador, técnicos usam celular
- Sistema precisa funcionar para todos

---

### 7. ♿ Acessibilidade

**O que é:** Pessoas com deficiência conseguem usar o sistema.

**Nossas metas:**

| Requisito | O que significa |
|-----------|-----------------|
| **Contraste de cores** | Texto legível mesmo com daltonismo |
| **Navegação por teclado** | Usar sem mouse |
| **Leitor de tela** | Funciona com softwares para cegos |
| **Textos alternativos** | Imagens têm descrição |

**Nível de conformidade:** WCAG 2.1 AA

**Por que isso importa?**
- 24% da população tem algum tipo de deficiência
- É lei em alguns países
- Melhora a experiência para todos

---

## Resumo Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                    NFRs do TireWatch Pro                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚡ PERFORMANCE          🔒 SEGURANÇA          📈 ESCALABILIDADE │
│  • Página: <3s           • HTTPS               • 10K usuários    │
│  • API: <500ms           • Senha forte         • 100K máquinas   │
│  • Realtime: <1s         • LGPD                • Auto-scaling    │
│                                                                  │
│  🟢 DISPONIBILIDADE      🔄 RECUPERAÇÃO        📱 COMPATIBILIDADE│
│  • 99.9% uptime          • RTO: 4h             • Chrome, Firefox │
│  • 43min/mês offline     • RPO: 1h             • Desktop, Mobile │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Como Monitoramos

| NFR | Ferramenta | Frequência |
|-----|------------|------------|
| Performance | Supabase Dashboard | Tempo real |
| Disponibilidade | UptimeRobot | A cada 5 minutos |
| Segurança | Auditorias | Mensal |
| Erros | Sentry | Tempo real |

---

## Próximos Passos

Se você precisa de mais detalhes sobre algum NFR específico, consulte:
- [02-ARQUITETURA/README.md](../README.md) - Visão geral da arquitetura
- [ADRs](../adrs/) - Decisões que impactam os NFRs
