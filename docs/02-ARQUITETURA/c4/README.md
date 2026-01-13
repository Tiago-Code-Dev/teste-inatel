# 🏗️ Diagramas C4 - TireWatch Pro

## O que são Diagramas C4?

Imagine que você quer explicar como funciona uma casa para alguém. Você poderia:

1. **Primeiro** - Mostrar a casa de longe, na rua (visão geral)
2. **Depois** - Mostrar os cômodos da casa (quartos, sala, cozinha)
3. **Por fim** - Mostrar os móveis dentro de cada cômodo

Os **Diagramas C4** fazem a mesma coisa, mas para sistemas de computador! São 4 níveis de "zoom":

| Nível | Nome | O que mostra | Analogia |
|-------|------|--------------|----------|
| 1 | **Contexto** | O sistema e quem usa ele | A casa na rua, com os vizinhos |
| 2 | **Container** | As "caixas" principais do sistema | Os cômodos da casa |
| 3 | **Componente** | As partes dentro de cada "caixa" | Os móveis em cada cômodo |
| 4 | **Código** | O código em si | Os parafusos dos móveis |

---

## Nível 1: Diagrama de Contexto

### O que é?

Mostra o TireWatch Pro "de longe" - quem usa o sistema e com o que ele se conecta.

### Diagrama

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MUNDO EXTERIOR                               │
│                                                                      │
│  👨‍🌾 Gestor de Frota          👨‍🔧 Técnico           👷 Operador        │
│       │                          │                      │            │
│       │   Monitora a frota       │  Faz manutenção     │  Usa no    │
│       │   pelo computador        │  e calibração       │  dia a dia │
│       │                          │                      │            │
│       └──────────────────────────┼──────────────────────┘            │
│                                  │                                   │
│                                  ▼                                   │
│                    ┌─────────────────────────┐                       │
│                    │                         │                       │
│                    │     TireWatch Pro       │                       │
│                    │                         │                       │
│                    │  Sistema que monitora   │                       │
│                    │  pneus de tratores e    │                       │
│                    │  máquinas agrícolas     │                       │
│                    │                         │                       │
│                    └─────────────────────────┘                       │
│                                  │                                   │
│                                  │                                   │
│              ┌───────────────────┼───────────────────┐               │
│              │                   │                   │               │
│              ▼                   ▼                   ▼               │
│     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐         │
│     │   Sensores  │     │   Supabase  │     │  Serviço de │         │
│     │  nos Pneus  │     │   (Banco)   │     │    E-mail   │         │
│     └─────────────┘     └─────────────┘     └─────────────┘         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Explicação Simples

- **Usuários** (pessoas de verde): São as pessoas que usam o sistema
- **TireWatch Pro** (caixa central): É o nosso sistema
- **Sistemas externos** (caixas de baixo): São outros sistemas que o TireWatch Pro usa

---

## Nível 2: Diagrama de Container

### O que é?

Mostra as "caixas" principais dentro do TireWatch Pro. Pense como os cômodos de uma casa.

### Diagrama

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TireWatch Pro                                 │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    FRONTEND (Interface)                      │    │
│  │                                                              │    │
│  │  O que o usuário vê e clica - botões, gráficos, mapas       │    │
│  │                                                              │    │
│  │  🖥️ Aplicação Web (React)                                   │    │
│  │  📱 Aplicativo Mobile (futuro)                              │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              │ Envia e recebe dados                  │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    BACKEND (Servidor)                        │    │
│  │                                                              │    │
│  │  A "cozinha" do sistema - onde os dados são processados     │    │
│  │                                                              │    │
│  │  ⚡ Supabase Edge Functions (lógica de negócio)             │    │
│  │  🔐 Autenticação (login/logout)                             │    │
│  │  📡 API (comunicação)                                       │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              │ Guarda e busca dados                  │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    BANCO DE DADOS                            │    │
│  │                                                              │    │
│  │  O "arquivo" do sistema - onde tudo fica guardado           │    │
│  │                                                              │    │
│  │  🗄️ PostgreSQL (dados)                                      │    │
│  │  📁 Storage (fotos, vídeos)                                 │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Explicação Simples

Pense no TireWatch Pro como um restaurante:

| Container | No Restaurante | No TireWatch Pro |
|-----------|----------------|------------------|
| **Frontend** | O salão onde os clientes sentam | A tela que você vê |
| **Backend** | A cozinha onde preparam a comida | Onde os dados são processados |
| **Banco de Dados** | A despensa onde guardam ingredientes | Onde os dados ficam salvos |

---

## Nível 3: Diagrama de Componentes

### O que é?

Mostra as "peças" dentro de cada container. Como os móveis dentro de cada cômodo.

### Frontend - Componentes Principais

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  📊 Dashboard │  │  🚜 Máquinas │  │  🔔 Alertas  │              │
│  │              │  │              │  │              │              │
│  │ Tela inicial │  │ Lista e      │  │ Centro de    │              │
│  │ com resumo   │  │ detalhes     │  │ notificações │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  🛞 Pneus    │  │  🗺️ Mapa     │  │  📈 Análises │              │
│  │              │  │              │  │              │              │
│  │ Gestão de   │  │ Localização  │  │ Gráficos e   │              │
│  │ pneus       │  │ das máquinas │  │ relatórios   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Explicação Simples

Cada "caixinha" é uma parte da interface:

- **Dashboard** → A primeira tela que você vê quando entra
- **Máquinas** → Onde você vê todos os seus tratores
- **Alertas** → Onde aparecem os problemas que precisam de atenção
- **Pneus** → Onde você gerencia os pneus
- **Mapa** → Onde você vê a localização dos tratores
- **Análises** → Onde você vê gráficos e relatórios

---

## Como Ler Estes Diagramas

### Cores

| Cor | Significado |
|-----|-------------|
| 🟢 Verde | Usuário (pessoa) |
| 🔵 Azul | Sistema nosso (TireWatch Pro) |
| 🟡 Amarelo | Sistema externo (outros serviços) |
| ⬜ Cinza | Banco de dados |

### Setas

| Seta | Significado |
|------|-------------|
| → | "Envia dados para" |
| ← | "Recebe dados de" |
| ↔ | "Troca dados com" |

---

## Arquivos de Diagramas

| Arquivo | Descrição |
|---------|-----------|
| `contexto.excalidraw` | Diagrama de contexto editável |
| `containers.excalidraw` | Diagrama de containers editável |
| `componentes.excalidraw` | Diagrama de componentes editável |

> 💡 **Dica:** Os arquivos `.excalidraw` podem ser abertos no site [excalidraw.com](https://excalidraw.com) para edição.

---

## Resumo

Os diagramas C4 ajudam a entender o sistema em diferentes níveis:

1. **Contexto** → Quem usa e com o que se conecta
2. **Container** → Quais são as "caixas" principais
3. **Componente** → O que tem dentro de cada "caixa"
4. **Código** → Como o código está organizado (não incluído aqui)

**Lembre-se:** Quanto mais você "dá zoom", mais detalhes você vê! 🔍
