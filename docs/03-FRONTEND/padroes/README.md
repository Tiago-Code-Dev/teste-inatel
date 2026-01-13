# 📐 Padrões de Código - Frontend

## O que são Padrões de Código?

### Explicação Simples

Imagine que 5 pessoas estão escrevendo um livro juntas. Se cada uma escrever do seu jeito:
- Uma usa "você", outra usa "tu"
- Uma escreve números por extenso, outra usa algarismos
- Uma faz parágrafos curtos, outra faz enormes

O livro ficaria **confuso e inconsistente**.

**Padrões de código** são as "regras de escrita" que todos seguem para que o código fique uniforme, como se uma única pessoa tivesse escrito.

---

## 🗂️ Estrutura de Pastas

```
src/frontend/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes básicos (Button, Card, etc.)
│   └── dashboard/      # Componentes específicos do dashboard
│
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx
│   ├── Machines.tsx
│   └── Alerts.tsx
│
├── hooks/              # Hooks personalizados
│   ├── useAuth.ts
│   └── useMachines.ts
│
├── contexts/           # Contextos do React
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── types/              # Definições de tipos TypeScript
│   ├── machine.ts
│   └── alert.ts
│
├── lib/                # Utilitários e configurações
│   └── utils.ts
│
└── integrations/       # Integrações externas
    └── supabase/
```

### Por que essa estrutura?

| Pasta | Contém | Analogia |
|-------|--------|----------|
| `components/` | Peças reutilizáveis | Peças de LEGO |
| `pages/` | Telas completas | Construções montadas |
| `hooks/` | Lógica reutilizável | Ferramentas |
| `contexts/` | Dados globais | Informações compartilhadas |
| `types/` | Definições de formato | Manuais de instrução |

---

## 📝 Nomenclatura (Como Nomear)

### Arquivos

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Componente | PascalCase | `MachineCard.tsx` |
| Hook | camelCase com "use" | `useMachines.ts` |
| Utilitário | camelCase | `formatDate.ts` |
| Tipo | camelCase | `machine.ts` |
| Constante | SCREAMING_SNAKE | `API_ENDPOINTS.ts` |

### Componentes

```typescript
// ✅ BOM - PascalCase, nome descritivo
function MachineStatusCard() { ... }
function AlertNotificationBadge() { ... }

// ❌ RUIM - camelCase, nome vago
function machineCard() { ... }
function badge() { ... }
```

### Variáveis e Funções

```typescript
// ✅ BOM - camelCase, nomes descritivos
const machineCount = 10;
const isLoading = true;
function calculateTotalPressure() { ... }

// ❌ RUIM - abreviações confusas
const mc = 10;
const l = true;
function calc() { ... }
```

### Constantes

```typescript
// ✅ BOM - SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = "https://...";

// ❌ RUIM
const maxRetryAttempts = 3;
```

---

## 🧱 Estrutura de Componentes

### Ordem das Seções

Todo componente deve seguir esta ordem:

```typescript
// 1️⃣ Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2️⃣ Types/Interfaces
interface MachineCardProps {
  machine: Machine;
  onSelect: (id: string) => void;
}

// 3️⃣ Componente
export function MachineCard({ machine, onSelect }: MachineCardProps) {
  // 4️⃣ Hooks (useState, useEffect, etc.)
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 5️⃣ Handlers (funções que respondem a eventos)
  const handleClick = () => {
    onSelect(machine.id);
  };
  
  // 6️⃣ Render helpers (funções que retornam JSX)
  const renderStatus = () => {
    return <Badge>{machine.status}</Badge>;
  };
  
  // 7️⃣ Return (JSX principal)
  return (
    <Card onClick={handleClick}>
      <CardHeader>{machine.name}</CardHeader>
      <CardContent>{renderStatus()}</CardContent>
    </Card>
  );
}
```

### Exemplo Completo

```typescript
// ========================================
// MachineCard.tsx
// Card que exibe informações de uma máquina
// ========================================

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Machine } from "@/types/machine";

// Props do componente
interface MachineCardProps {
  /** A máquina a ser exibida */
  machine: Machine;
  /** Callback quando o card é clicado */
  onSelect?: (id: string) => void;
}

/**
 * Card que exibe informações resumidas de uma máquina.
 * 
 * @example
 * <MachineCard 
 *   machine={myMachine} 
 *   onSelect={(id) => console.log(id)} 
 * />
 */
export function MachineCard({ machine, onSelect }: MachineCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onSelect?.(machine.id);
  };

  const getStatusColor = () => {
    switch (machine.status) {
      case "operational": return "success";
      case "warning": return "warning";
      case "critical": return "destructive";
      default: return "default";
    }
  };

  return (
    <Card 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={isHovered ? "shadow-lg" : ""}
    >
      <CardHeader>
        <h3>{machine.name}</h3>
        <Badge variant={getStatusColor()}>
          {machine.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p>Modelo: {machine.model}</p>
        <p>Unidade: {machine.unitName}</p>
      </CardContent>
    </Card>
  );
}
```

---

## 🎣 Hooks Personalizados

### Quando Criar um Hook?

Crie um hook quando:
- A mesma lógica é usada em vários lugares
- A lógica é complexa e polui o componente
- Você quer isolar efeitos colaterais (API, storage, etc.)

### Estrutura de um Hook

```typescript
// ========================================
// useMachines.ts
// Hook para gerenciar dados de máquinas
// ========================================

import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para buscar e gerenciar máquinas.
 * 
 * @example
 * const { machines, isLoading, refetch } = useMachines();
 */
export function useMachines() {
  // Query para buscar máquinas
  const { data: machines, isLoading, refetch } = useQuery({
    queryKey: ["machines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("machines")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation para criar máquina
  const createMachine = useMutation({
    mutationFn: async (newMachine: CreateMachineInput) => {
      const { data, error } = await supabase
        .from("machines")
        .insert(newMachine);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch(); // Recarrega a lista
    },
  });

  return {
    machines: machines ?? [],
    isLoading,
    refetch,
    createMachine: createMachine.mutate,
    isCreating: createMachine.isPending,
  };
}
```

---

## 📋 Tipos TypeScript

### Definindo Tipos

```typescript
// types/machine.ts

/** Status possíveis de uma máquina */
export type MachineStatus = 
  | "operational" 
  | "warning" 
  | "critical" 
  | "offline";

/** Representa uma máquina no sistema */
export interface Machine {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: MachineStatus;
  unitId: string;
  unitName: string;
  createdAt: string;
  updatedAt: string;
}

/** Dados para criar uma nova máquina */
export interface CreateMachineInput {
  name: string;
  model: string;
  serialNumber: string;
  unitId: string;
}
```

---

## ✅ Regras Gerais

### Faça ✅

- Use TypeScript em todos os arquivos
- Nomeie de forma descritiva
- Comente código complexo
- Mantenha componentes pequenos (< 200 linhas)
- Use hooks para lógica reutilizável
- Siga a estrutura de pastas

### Não Faça ❌

- Não use `any` no TypeScript
- Não deixe console.log no código final
- Não faça componentes gigantes
- Não repita código (DRY - Don't Repeat Yourself)
- Não ignore erros de TypeScript

---

## 🔧 Ferramentas de Qualidade

| Ferramenta | O que faz |
|------------|-----------|
| **ESLint** | Encontra problemas no código |
| **Prettier** | Formata o código automaticamente |
| **TypeScript** | Verifica tipos |

### Comandos

```bash
# Verificar problemas
npm run lint

# Corrigir automaticamente
npm run lint:fix

# Verificar tipos
npm run typecheck
```
