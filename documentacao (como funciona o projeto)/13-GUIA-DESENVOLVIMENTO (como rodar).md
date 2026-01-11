# Guia de Desenvolvimento

## Pré-requisitos

### Obrigatórios

| Requisito | Versão | Download |
|-----------|--------|----------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ | Vem com Node.js |
| **Git** | 2+ | [git-scm.com](https://git-scm.com/) |

### Recomendados

- **VS Code** - Editor de código
- **Extensões VS Code**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

## Setup Inicial

### 1. Clonar Repositório

```bash
git clone <repository-url>
cd teste-inatel
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://mwvtdxdzvxzmswpkeoko.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### 4. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:8080

## Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `npm run dev` | Servidor de desenvolvimento |
| `build` | `npm run build` | Build de produção |
| `preview` | `npm run preview` | Preview do build |
| `lint` | `npm run lint` | Executar ESLint |

## Estrutura do Projeto

```
src/
├── components/     # Componentes React
├── contexts/       # React Contexts
├── hooks/          # Custom hooks
├── pages/          # Páginas/Routes
├── integrations/   # Supabase client
├── lib/            # Utilitários
└── types/          # TypeScript types
```

## Convenções de Código

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `MachineCard.tsx` |
| Hooks | camelCase + use | `useMachines.ts` |
| Páginas | PascalCase + Page | `MachinesPage.tsx` |
| Tipos | PascalCase | `Machine`, `Alert` |
| Funções | camelCase | `formatDate()` |
| Constantes | UPPER_SNAKE | `MAX_ITEMS` |

### Estrutura de Componente

```typescript
// 1. Imports
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { Machine } from '@/types';

// 2. Interface de Props
interface MachineCardProps {
  machine: Machine;
  onClick?: () => void;
}

// 3. Componente
export function MachineCard({ machine, onClick }: MachineCardProps) {
  // 4. Hooks
  const [isHovered, setIsHovered] = useState(false);

  // 5. Handlers
  const handleClick = () => {
    onClick?.();
  };

  // 6. Render
  return (
    <Card onClick={handleClick}>
      {machine.name}
    </Card>
  );
}
```

## Criando Novos Componentes

### 1. Criar Arquivo

```bash
# Criar componente em módulo existente
touch src/components/dashboard/NewComponent.tsx
```

### 2. Implementar Componente

```typescript
// src/components/dashboard/NewComponent.tsx
interface NewComponentProps {
  title: string;
}

export function NewComponent({ title }: NewComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}
```

### 3. Exportar no Index

```typescript
// src/components/dashboard/index.ts
export * from './NewComponent';
```

### 4. Usar

```typescript
import { NewComponent } from '@/components/dashboard';

<NewComponent title="Meu Título" />
```

## Criando Custom Hooks

### Estrutura

```typescript
// src/hooks/useNewHook.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useNewHook(id: string) {
  return useQuery({
    queryKey: ['new-hook', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
```

## Criando Novas Páginas

### 1. Criar Arquivo

```typescript
// src/pages/NewPage.tsx
import { MainLayout } from '@/components/layout/MainLayout';

export default function NewPage() {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold">Nova Página</h1>
    </MainLayout>
  );
}
```

### 2. Adicionar Rota

```typescript
// src/App.tsx
import NewPage from './pages/NewPage';

<Route element={<ProtectedRoute />}>
  {/* ... outras rotas */}
  <Route path="/new-page" element={<NewPage />} />
</Route>
```

## Trabalhando com Supabase

### Query

```typescript
const { data, error } = await supabase
  .from('machines')
  .select('*')
  .eq('unit_id', unitId)
  .order('name');
```

### Insert

```typescript
const { data, error } = await supabase
  .from('occurrences')
  .insert({ machine_id, description })
  .select()
  .single();
```

### Update

```typescript
const { error } = await supabase
  .from('alerts')
  .update({ status: 'resolved' })
  .eq('id', alertId);
```

### Realtime

```typescript
const channel = supabase
  .channel('alerts')
  .on('postgres_changes', { event: '*', table: 'alerts' }, (payload) => {
    console.log('Mudança:', payload);
  })
  .subscribe();

// Cleanup
supabase.removeChannel(channel);
```

## Estilização com Tailwind

### Classes Comuns

```tsx
// Layout
<div className="flex items-center justify-between">

// Espaçamento
<div className="p-4 m-2 gap-4">

// Cores
<div className="bg-white text-gray-900 border-gray-200">

// Responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hover/Focus
<button className="hover:bg-blue-600 focus:ring-2">
```

### Utilitário cn()

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'danger' && 'text-red-500'
)} />
```

## Debugging

### Console

```typescript
console.log('Debug:', data);
console.error('Erro:', error);
console.table(arrayData);
```

### React DevTools

1. Instale a extensão React DevTools no navegador
2. Abra DevTools (F12)
3. Aba "Components" para inspecionar componentes
4. Aba "Profiler" para análise de performance

### Network

1. Abra DevTools (F12)
2. Aba "Network"
3. Filtre por "Fetch/XHR"
4. Veja requisições ao Supabase

## Troubleshooting Comum

### Erro: "Cannot find module '@/...'"

Verifique `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Erro: "Unauthorized" no Supabase

1. Verifique `.env.local`
2. Verifique se está logado
3. Verifique políticas RLS

### Componente não atualiza

1. Verifique se está usando `queryClient.invalidateQueries()`
2. Verifique se Realtime está habilitado na tabela
3. Verifique logs no console

## Próximos Passos

- [Boas Práticas](14-BOAS-PRATICAS.md) - Convenções detalhadas
- [Troubleshooting](15-TROUBLESHOOTING.md) - Mais soluções
- [Componentes](04-COMPONENTES.md) - Inventário de componentes
