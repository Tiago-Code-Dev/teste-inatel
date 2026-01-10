# TireWatch Pro - Guia de Desenvolvimento

## Pré-requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
# Clonar e instalar
git clone <repository-url>
cd teste-inatel
npm install

# Configurar ambiente
# Criar .env.local com:
VITE_SUPABASE_URL=https://mwvtdxdzvxzmswpkeoko.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave
```

## Scripts

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `npm run dev` | Servidor dev (localhost:8080) |
| `build` | `npm run build` | Build produção |
| `lint` | `npm run lint` | ESLint |
| `preview` | `npm run preview` | Preview build |

## Estrutura

```
src/
├── components/     # Componentes por feature
├── contexts/       # Auth, Tenant, Dashboard
├── hooks/          # Custom hooks
├── pages/          # Páginas/Routes
├── integrations/   # Supabase
├── lib/            # Utilitários
└── types/          # TypeScript
```

## Convenções

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `MachineCard.tsx` |
| Hooks | camelCase + use | `useRealtimeAlerts.ts` |
| Páginas | PascalCase + Page | `MachinesPage.tsx` |

## Criar Componente

```typescript
// src/components/example/ExampleCard.tsx
interface ExampleCardProps {
  title: string;
}

export function ExampleCard({ title }: ExampleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
    </Card>
  );
}
```

## Criar Hook

```typescript
// src/hooks/useExampleData.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useExampleData(id: string) {
  return useQuery({
    queryKey: ['example', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .eq('id', id);
      if (error) throw error;
      return data;
    },
  });
}
```

## Criar Página

```typescript
// src/pages/ExamplePage.tsx
import { MainLayout } from '@/components/layout/MainLayout';

export default function ExamplePage() {
  return (
    <MainLayout>
      <h1>Example</h1>
    </MainLayout>
  );
}

// Adicionar em App.tsx:
<Route path="/example" element={<ExamplePage />} />
```

## Supabase

### Query
```typescript
const { data } = await supabase
  .from('machines')
  .select('*')
  .eq('unit_id', unitId);
```

### Realtime
```typescript
const channel = supabase
  .channel('alerts')
  .on('postgres_changes', { event: '*', table: 'alerts' }, callback)
  .subscribe();
```

## Estilização

Use Tailwind CSS:
```tsx
<div className="flex items-center gap-4 p-4 bg-background rounded-lg">
  <span className="text-lg font-semibold">Título</span>
</div>
```

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Módulo @/ não encontrado | Verificar tsconfig.json paths |
| Unauthorized Supabase | Verificar .env.local |
| Realtime não funciona | Verificar se tabela tem Realtime habilitado |
