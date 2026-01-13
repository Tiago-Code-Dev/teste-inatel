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
├── 📂 docs/                         ← 📚 OS MANUAIS DO PROJETO
│   ├── README.md                    # 📖 Sumário dos manuais
│   ├── 01-VISAO-GERAL/             # 👀 Explica o que o sistema faz
│   ├── 02-ARQUITETURA/             # 🏗️ Como a casa foi construída
│   │   ├── c4/                     # 🗺️ Mapas do sistema
│   │   ├── adrs/                   # 📝 Por que escolhemos cada coisa
│   │   └── nfrs/                   # 📋 Regras de qualidade
│   ├── 03-FRONTEND/                # 🎨 A parte bonita que você vê
│   │   ├── design-system/          # 🎨 Cores e estilos
│   │   ├── padroes/                # 📏 Regras de como escrever código
│   │   └── exemplos/               # 💡 Exemplos para copiar
│   ├── 04-COMPONENTES/             # 🧩 As peças da interface (botões, cards)
│   ├── 05-DADOS/                   # 💾 Onde guardamos as informações
│   ├── 06-API/                     # 📡 Como as partes conversam entre si
│   ├── 07-AUTENTICACAO/            # 🔐 Login e quem pode fazer o quê
│   ├── 08-BANCO-DE-DADOS/          # 🗄️ O armário onde guardamos tudo
│   ├── 09-TESTES/                  # ✅ Como verificar se funciona
│   ├── 10-DEPLOY/                  # 🚀 Como colocar na internet
│   ├── 11-CONFIGURACAO/            # ⚙️ Ajustes do sistema
│   ├── 12-API-REFERENCE/           # 📚 Dicionário técnico
│   ├── 13-GUIA-DESENVOLVIMENTO/    # 🏃 Como rodar no seu computador
│   ├── 14-BOAS-PRATICAS/           # ⭐ As regras do jogo
│   ├── 15-TROUBLESHOOTING/         # 🔧 Socorro! Algo deu errado
│   ├── 16-ROADMAP/                 # 🛣️ O que vamos fazer no futuro
│   ├── templates/                  # 📋 Modelos prontos para copiar
│   └── assets/                     # 🖼️ Imagens e desenhos
│
├── 📂 src/                          ← 🧠 O CÉREBRO (todo o código)
├── 📂 supabase/                     ← 🗄️ O ARMÁRIO (banco de dados)
├── 📄 CONTRIBUTING.md               ← 🤝 Como você pode ajudar
├── 📄 SECURITY.md                   ← 🚨 O que fazer se achar um problema
├── 📄 CHANGELOG.md                  ← 📅 Diário das mudanças
├── 📄 .editorconfig                 ← 📏 Régua para o código ficar bonito
└── 📄 package.json                  ← 🥗 Lista de ingredientes
```

---

## 📖 O que cada arquivo/pasta faz? (Explicação Super Simples)

| Arquivo/Pasta | O que é? 🧒 |
|---------------|-------------|
| 📁 **.github** | É como um **robô ajudante** que faz tarefas automáticas quando você salva o código |
| 📁 **docs** | São os **livros de instruções** - explicam como tudo funciona |
| 📁 **infra/docker** | É a **caixa mágica** que faz o sistema rodar em qualquer computador |
| 📁 **public** | É a **vitrine da loja** - o ícone e imagens que você vê no navegador |
| 📁 **scripts** | São **receitas prontas** - comandos que fazem tarefas chatas sozinhos |
| 📁 **specsproduct-spec.md** | É o **desenho do arquiteto** - mostra o que o sistema deve fazer |
| 📁 **src** | É o **cérebro** 🧠 - todo o código que faz o sistema pensar e funcionar |
| 📁 **tests** | É o **professor que corrige a prova** - verifica se tudo funciona certo |
| 📄 **.editorconfig** | É a **régua** - mantém o código bonito e organizado igual para todos |
| 📄 **.env** | É o **cofre secreto** 🔐 - guarda senhas (não aparece na internet!) |
| 📄 **CHANGELOG.md** | É o **diário** - conta o que mudou em cada versão |
| 📄 **CONTRIBUTING.md** | É o **convite** - explica como você pode ajudar no projeto |
| 📄 **README.md** | É o **cartão de visita** 👋 - este arquivo que você está lendo! |
| 📄 **SECURITY.md** | É o **alarme** 🚨 - diz como avisar se encontrar um problema de segurança |
| 📄 **bun.lockb** | É a **lista de compras com marcas** - garante que todos usem as mesmas coisas |
| 📄 **components.json** | É o **catálogo de peças** - lista os botões, cards e caixas do sistema |
| 📄 **eslint.config.js** | É o **corretor ortográfico** ✏️ - encontra erros no código |
| 📄 **index.html** | É a **porta de entrada** 🚪 - a primeira página que abre no navegador |
| 📄 **package.json** | É a **lista de ingredientes** 🥗 - tudo que o projeto precisa para funcionar |
| 📄 **package-lock.json** | É a **receita detalhada** - versão exata de cada ingrediente |
| 📄 **postcss.config.js** | É o **pintor** 🎨 - transforma as cores e estilos automaticamente |
| 📄 **tailwind.config.ts** | É a **paleta de cores** 🌈 - define as cores, letras e espaços do design |

### 🎯 Resumo Visual (o mais importante)

```
📦 TireWatch Pro
│
├── 📁 src/            → "O CÉREBRO" - Todo o código do sistema
├── 📁 docs/           → "OS MANUAIS" - Documentação para entender o projeto
├── 📁 specsproduct-spec.md/ → "O CONTRATO" - O que o sistema deve fazer
│
├── 📄 README.md       → "CARTÃO DE VISITA" - Você está lendo agora!
├── 📄 package.json    → "LISTA DE INGREDIENTES" - Bibliotecas usadas
└── 📄 .env            → "COFRE" - Senhas (não aparece no GitHub)
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

**Versão:** 2.0  
**Última Atualização:** 12/Janeiro/2026  
**Desenvolvido com:** React 18 + TypeScript + Supabase + Tailwind CSS
