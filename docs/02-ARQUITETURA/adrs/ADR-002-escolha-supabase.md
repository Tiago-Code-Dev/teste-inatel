# ADR-002: Escolha do Supabase como Backend

## Status

✅ **Aceito** - Janeiro/2026

---

## Contexto

### O problema

Precisávamos de um lugar para:
1. **Guardar os dados** (máquinas, pneus, alertas, usuários)
2. **Fazer login** (autenticação de usuários)
3. **Processar regras** (ex: se pressão < 2.0, criar alerta)
4. **Enviar atualizações em tempo real** (quando um alerta surge, aparecer na tela)

### Explicação simples

Imagine que o TireWatch Pro é uma loja:
- O **frontend** (React) é a vitrine e o balcão de atendimento
- O **backend** é o estoque, o caixa e o escritório - tudo que acontece "nos bastidores"

Precisávamos escolher como construir esses "bastidores".

---

## Decisão

Escolhemos o **Supabase** como nossa plataforma de backend.

### O que é Supabase?

Supabase é um serviço que oferece "backend pronto" - você não precisa construir servidor, banco de dados, sistema de login do zero. Ele já vem com tudo isso pronto!

### Analogia

| Sem Supabase | Com Supabase |
|--------------|--------------|
| Construir uma casa do zero (fundação, paredes, teto, encanamento, elétrica...) | Comprar uma casa pronta e só decorar |
| Meses de trabalho | Dias de trabalho |
| Precisa de especialistas em cada área | Uma pessoa consegue fazer |

---

## O que o Supabase oferece?

| Recurso | O que é | Para que usamos |
|---------|---------|-----------------|
| **PostgreSQL** | Banco de dados | Guardar máquinas, pneus, alertas |
| **Auth** | Sistema de login | Usuários fazem login/logout |
| **Storage** | Armazenamento de arquivos | Guardar fotos e vídeos de ocorrências |
| **Realtime** | Atualizações instantâneas | Alertas aparecem na tela na hora |
| **Edge Functions** | Código no servidor | Processar regras e lógica |
| **Row Level Security** | Segurança de dados | Cada usuário só vê seus dados |

---

## Alternativas Consideradas

### Firebase (Google)

**O que é:** Plataforma similar do Google.

**Por que não escolhemos:**
- Banco de dados NoSQL (menos flexível para consultas complexas)
- Mais caro em escala
- Vendor lock-in (fica "preso" ao Google)

### Construir Backend Próprio (Node.js/Python)

**O que é:** Criar tudo do zero.

**Por que não escolhemos:**
- Muito mais tempo de desenvolvimento
- Precisaria de mais desenvolvedores
- Mais coisas para dar manutenção

### AWS Amplify

**O que é:** Plataforma da Amazon.

**Por que não escolhemos:**
- Mais complexo de configurar
- Curva de aprendizado maior
- Documentação menos amigável

---

## Consequências

### ✅ Positivas

1. **Desenvolvimento rápido** - Backend pronto, só configurar
2. **Custo inicial baixo** - Plano gratuito generoso
3. **Escalável** - Cresce junto com o projeto
4. **Open Source** - Se precisar, podemos hospedar por conta própria
5. **PostgreSQL** - Banco de dados robusto e conhecido

### ⚠️ Negativas (coisas para ficar atento)

1. **Dependência de terceiro** - Se Supabase sair do ar, nosso sistema para
2. **Limites do plano** - Precisamos monitorar uso para não pagar mais
3. **Menos controle** - Algumas configurações avançadas são limitadas

---

## Custos

| Plano | Preço | Inclui |
|-------|-------|--------|
| **Free** | $0/mês | 500MB banco, 1GB storage, 50K auth users |
| **Pro** | $25/mês | 8GB banco, 100GB storage, recursos avançados |
| **Team** | $599/mês | Para equipes grandes |

Para o TireWatch Pro, o plano **Pro** é suficiente para começar.

---

## Resumo em Uma Frase

> Escolhemos Supabase porque oferece backend completo (banco, auth, storage, realtime) pronto para usar, permitindo desenvolver muito mais rápido e com menor custo inicial.
