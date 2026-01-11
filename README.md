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
├── 📂 documentacao (como funciona o projeto)/     ← 📚 COMECE AQUI!
│   │
│   ├── 01-VISAO-GERAL (o que o sistema faz).md
│   ├── 02-ARQUITETURA (como foi construido).md
│   ├── 03-FRONTEND (a parte visual).md
│   ├── 04-COMPONENTES (pecas da interface).md
│   ├── 05-SUPABASE (onde os dados ficam).md
│   ├── 06-API (comunicacao entre partes).md
│   ├── 07-AUTENTICACAO (login e permissoes).md
│   ├── 08-BANCO-DE-DADOS (estrutura dos dados).md
│   ├── 09-TESTES (como testar).md
│   ├── 10-DEPLOY (como colocar no ar).md
│   ├── 11-CONFIGURACAO (configuracoes).md
│   ├── 12-API-REFERENCE (referencia tecnica).md
│   ├── 13-GUIA-DESENVOLVIMENTO (como rodar).md
│   ├── 14-BOAS-PRATICAS (regras de codigo).md
│   ├── 15-TROUBLESHOOTING (problemas e solucoes).md
│   ├── 16-ROADMAP (melhorias futuras).md
│   └── README (indice da documentacao).md
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
1. Leia primeiro: `01-VISAO-GERAL (o que o sistema faz).md`
2. Depois: `13-GUIA-DESENVOLVIMENTO (como rodar).md`

### Se você quer entender como funciona:
1. Arquitetura: `02-ARQUITETURA (como foi construido).md`
2. Frontend: `03-FRONTEND (a parte visual).md`
3. Backend: `05-SUPABASE (onde os dados ficam).md`

### Se você está com problemas:
1. Troubleshooting: `15-TROUBLESHOOTING (problemas e solucoes).md`

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

1. Abra a pasta `documentacao (como funciona o projeto)/`
2. Veja os problemas comuns em `15-TROUBLESHOOTING (problemas e solucoes).md`

---

**Versão:** 1.0  
**Última Atualização:** Janeiro 2026  
**Desenvolvido com:** React + TypeScript + Supabase
