# 🚜 TireWatch Pro

## O que é este projeto?

O **TireWatch Pro** é um sistema de monitoramento de pneus para tratores e máquinas agrícolas. Pense nele como um "médico dos pneus" que fica de olho na saúde dos pneus da sua frota o tempo todo.

### Em palavras simples:

Imagine que você tem uma fazenda com 50 tratores. Cada trator tem pneus que precisam estar com a pressão certa para funcionar bem. 

**Sem o TireWatch Pro:**
- Você teria que verificar cada pneu manualmente 😓
- Só descobriria problemas quando já fosse tarde demais 💸
- Perderia tempo e dinheiro com manutenções de emergência 🚨

**Com o TireWatch Pro:**
- Sensores nos pneus enviam dados automaticamente para o sistema 📡
- Você vê tudo em um painel de controle (dashboard) no computador 💻
- Se um pneu estiver com problema, você recebe um alerta na hora ⚠️
- Evita acidentes e economiza dinheiro! 💰

---

## 📁 Estrutura do Projeto

```
📂 teste-inatel/
│
├── 📂 documentacao-projeto/     ← 📚 EXPLICAÇÃO COMPLETA DO PROJETO
│   │                               (Comece por aqui se quiser entender tudo!)
│   │
│   ├── 01-VISAO-GERAL.md        ← O que o sistema faz (explicação simples)
│   ├── 02-ARQUITETURA.md        ← Como o sistema foi construído
│   ├── 03-FRONTEND.md           ← A parte visual (telas, botões)
│   ├── 04-COMPONENTES.md        ← Peças que formam a interface
│   ├── 05-SUPABASE.md           ← Onde os dados são guardados
│   ├── 06-API.md                ← Como as partes se comunicam
│   ├── 07-AUTENTICACAO.md       ← Login e permissões
│   ├── 08-BANCO-DE-DADOS.md     ← Estrutura dos dados
│   ├── 09-TESTES.md             ← Como testar o sistema
│   ├── 10-DEPLOY.md             ← Como colocar no ar
│   ├── 11-CONFIGURACAO.md       ← Configurações necessárias
│   ├── 12-API-REFERENCE.md      ← Referência técnica da API
│   ├── 13-GUIA-DESENVOLVIMENTO  ← Como rodar o projeto
│   ├── 14-BOAS-PRATICAS.md      ← Regras de código
│   ├── 15-TROUBLESHOOTING.md    ← Problemas e soluções
│   └── 16-ROADMAP.md            ← Melhorias futuras
│
├── 📂 src/                      ← Código do frontend (React)
├── 📂 supabase/                 ← Backend e banco de dados
└── 📄 package.json              ← Dependências do projeto
```

---

## 🚀 Como Rodar o Projeto

### Passo 1: Instalar Node.js
Baixe e instale o Node.js: https://nodejs.org/

### Passo 2: Instalar dependências
```bash
npm install
```

### Passo 3: Configurar variáveis de ambiente
Crie um arquivo `.env.local` na raiz com:
```
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_aqui
```

### Passo 4: Rodar o projeto
```bash
npm run dev
```

### Passo 5: Acessar no navegador
Abra: http://localhost:8080

---

## 📚 Quer Entender Mais?

### Se você é novo no projeto:
1. Leia primeiro: [`documentacao-projeto/01-VISAO-GERAL.md`](documentacao-projeto/01-VISAO-GERAL.md)
2. Depois: [`documentacao-projeto/13-GUIA-DESENVOLVIMENTO.md`](documentacao-projeto/13-GUIA-DESENVOLVIMENTO.md)

### Se você quer entender como funciona:
1. Arquitetura: [`documentacao-projeto/02-ARQUITETURA.md`](documentacao-projeto/02-ARQUITETURA.md)
2. Frontend: [`documentacao-projeto/03-FRONTEND.md`](documentacao-projeto/03-FRONTEND.md)
3. Backend: [`documentacao-projeto/05-SUPABASE.md`](documentacao-projeto/05-SUPABASE.md)

### Se você está com problemas:
1. Troubleshooting: [`documentacao-projeto/15-TROUBLESHOOTING.md`](documentacao-projeto/15-TROUBLESHOOTING.md)

---

## 🛠️ Tecnologias Usadas

| Tecnologia | Para que serve |
|------------|----------------|
| **React** | Construir a interface (botões, telas) |
| **TypeScript** | Linguagem de programação mais segura |
| **Tailwind CSS** | Deixar a interface bonita |
| **Supabase** | Guardar os dados e fazer login |
| **Vite** | Rodar o projeto rapidamente |

---

## 👥 Para Quem é Este Projeto?

- **Gestores de Frota** - Querem monitorar seus veículos
- **Técnicos de Manutenção** - Precisam de alertas sobre problemas
- **Operadores** - Usam o sistema no dia a dia
- **Desenvolvedores** - Querem entender ou contribuir com o código

---

## 📞 Precisa de Ajuda?

1. Leia a documentação em [`documentacao-projeto/`](documentacao-projeto/)
2. Veja os problemas comuns em [`documentacao-projeto/15-TROUBLESHOOTING.md`](documentacao-projeto/15-TROUBLESHOOTING.md)

---

**Versão:** 1.0  
**Última Atualização:** Janeiro 2026  
**Desenvolvido com:** React + TypeScript + Supabase
