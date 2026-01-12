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
├── 📂 docs/                         ← 📚 DOCUMENTAÇÃO TÉCNICA
│   ├── README.md                    # Índice da documentação
│   ├── 01-VISAO-GERAL/             # O que o sistema faz
│   ├── 02-ARQUITETURA/             # Como foi construído
│   │   ├── c4/                     # Diagramas C4
│   │   ├── adrs/                   # Architecture Decision Records
│   │   └── nfrs/                   # Non-Functional Requirements
│   ├── 03-FRONTEND/                # A parte visual
│   │   ├── design-system/          # Sistema de design
│   │   ├── padroes/                # Padrões de código
│   │   └── exemplos/               # Exemplos de uso
│   ├── 04-COMPONENTES/             # Peças da interface
│   ├── 05-DADOS/                   # Supabase e dados
│   ├── 06-API/                     # Comunicação entre partes
│   ├── 07-AUTENTICACAO/            # Login e permissões
│   ├── 08-BANCO-DE-DADOS/          # Estrutura dos dados
│   ├── 09-TESTES/                  # Como testar
│   ├── 10-DEPLOY/                  # Como colocar no ar
│   ├── 11-CONFIGURACAO/            # Configurações
│   ├── 12-API-REFERENCE/           # Referência técnica
│   ├── 13-GUIA-DESENVOLVIMENTO/    # Como rodar
│   ├── 14-BOAS-PRATICAS/           # Regras de código
│   ├── 15-TROUBLESHOOTING/         # Problemas e soluções
│   ├── 16-ROADMAP/                 # Melhorias futuras
│   ├── templates/                  # Templates de documentos
│   └── assets/                     # Imagens e diagramas
│
├── 📂 src/                          ← Código do frontend (React)
├── 📂 supabase/                     ← Backend e banco de dados
├── 📄 CONTRIBUTING.md               ← Como contribuir
├── 📄 SECURITY.md                   ← Política de segurança
├── 📄 CHANGELOG.md                  ← Histórico de mudanças
├── 📄 .editorconfig                 ← Padrão de formatação
└── 📄 package.json                  ← Dependências do projeto
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

## 📚 Documentação

A documentação completa está em [`docs/`](docs/README.md).

### Se você é novo no projeto:
1. Leia primeiro: [`docs/01-VISAO-GERAL/`](docs/01-VISAO-GERAL/)
2. Depois: [`docs/13-GUIA-DESENVOLVIMENTO/`](docs/13-GUIA-DESENVOLVIMENTO/)

### Se você quer entender como funciona:
1. Arquitetura: [`docs/02-ARQUITETURA/`](docs/02-ARQUITETURA/)
2. Frontend: [`docs/03-FRONTEND/`](docs/03-FRONTEND/)
3. Backend: [`docs/05-DADOS/`](docs/05-DADOS/)

### Se você está com problemas:
1. Troubleshooting: [`docs/15-TROUBLESHOOTING/`](docs/15-TROUBLESHOOTING/)

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

1. Veja a documentação em [`docs/`](docs/README.md)
2. Veja os problemas comuns em [`docs/15-TROUBLESHOOTING/`](docs/15-TROUBLESHOOTING/)
3. Leia [CONTRIBUTING.md](CONTRIBUTING.md) para contribuir

---

**Versão:** 1.0  
**Última Atualização:** Janeiro 2026  
**Desenvolvido com:** React + TypeScript + Supabase
