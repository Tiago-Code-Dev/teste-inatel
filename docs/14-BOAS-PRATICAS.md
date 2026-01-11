# Boas Práticas e Padrões

## Introdução

Este documento descreve as boas práticas e padrões de código adotados no TireWatch Pro. Seguir estas convenções garante consistência, legibilidade e manutenibilidade do código.

## Princípios Gerais

### 1. Clareza sobre Brevidade

```typescript
// ❌ Ruim - muito abreviado
const m = machines.filter(x => x.s === 'op');

// ✅ Bom - claro e legível
const operationalMachines = machines.filter(
  machine => machine.status === 'operational'
);
```

### 2. Componentes Pequenos e Focados

```typescript
// ❌ Ruim - componente faz muitas coisas
function Dashboard() {
  // 500 linhas de código...
}

// ✅ Bom - dividido em componentes menores
function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <StatsCards />
      <MachinesList />
      <AlertsList />
    </DashboardLayout>
  );
}
```

### 3. Separação de Responsabilidades

```typescript
// ❌ Ruim - lógica misturada com UI
function MachineCard({ id }) {
  const [machine, setMachine] = useState(null);
  
  useEffect(() => {
    supabase.from('machines').select('*').eq('id', id)
      .then(({ data }) => setMachine(data));
  }, [id]);
  
  return <Card>{machine?.name}</Card>;
}

// ✅ Bom - lógica separada em hook
function useMachine(id: string) {
  return useQuery({
    queryKey: ['machine', id],
    queryFn: () => fetchMachine(id),
  });
}

function MachineCard({ id }) {
  const { data: machine } = useMachine(id);
  return <Card>{machine?.name}</Card>;
}
```

## Convenções de Nomenclatura

### Arquivos

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `MachineCard.tsx` |
| Hooks | camelCase | `useMachines.ts` |
| Utilitários | camelCase | `formatDate.ts` |
| Tipos | camelCase | `types.ts` |
| Constantes | camelCase | `constants.ts` |

### Código

```typescript
// Componentes - PascalCase
function MachineCard() {}

// Hooks - camelCase com prefixo "use"
function useMachines() {}

// Funções - camelCase
function formatPressure() {}

// Variáveis - camelCase
const machineCount = 10;

// Constantes - UPPER_SNAKE_CASE
const MAX_PRESSURE = 5.0;

// Tipos/Interfaces - PascalCase
interface MachineData {}
type AlertStatus = 'open' | 'resolved';

// Enums - PascalCase
enum MachineStatus {
  Operational = 'operational',
  Warning = 'warning',
}
```

## Padrões React

### Props Interface

```typescript
// Sempre definir interface para props
interface MachineCardProps {
  machine: Machine;
  onClick?: () => void;
  className?: string;
}

export function MachineCard({ machine, onClick, className }: MachineCardProps) {
  // ...
}
```

### Destructuring de Props

```typescript
// ✅ Bom - destructuring no parâmetro
function MachineCard({ machine, onClick }: MachineCardProps) {
  return <Card onClick={onClick}>{machine.name}</Card>;
}

// ❌ Evitar - props como objeto
function MachineCard(props: MachineCardProps) {
  return <Card onClick={props.onClick}>{props.machine.name}</Card>;
}
```

### Hooks Order

```typescript
function MyComponent() {
  // 1. Hooks do React
  const [state, setState] = useState();
  const ref = useRef();
  
  // 2. Hooks de contexto
  const { user } = useAuth();
  const { selectedUnitId } = useTenant();
  
  // 3. Hooks de dados (React Query)
  const { data, isLoading } = useMachines();
  
  // 4. Hooks de efeito
  useEffect(() => {}, []);
  
  // 5. Handlers
  const handleClick = () => {};
  
  // 6. Render
  return <div />;
}
```

### Conditional Rendering

```typescript
// ✅ Bom - early return para estados de loading/error
function MachinesList() {
  const { data, isLoading, error } = useMachines();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data?.length) return <EmptyState />;
  
  return (
    <div>
      {data.map(machine => (
        <MachineCard key={machine.id} machine={machine} />
      ))}
    </div>
  );
}
```

## Padrões TypeScript

### Tipos vs Interfaces

```typescript
// Use type para unions e tipos primitivos
type AlertStatus = 'open' | 'acknowledged' | 'resolved';
type MachineId = string;

// Use interface para objetos
interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
}
```

### Evitar `any`

```typescript
// ❌ Ruim
function processData(data: any) {}

// ✅ Bom - tipo específico
function processData(data: Machine[]) {}

// ✅ Aceitável - unknown quando realmente não sabe
function processData(data: unknown) {
  if (isMachine(data)) {
    // agora TypeScript sabe que é Machine
  }
}
```

### Generics

```typescript
// Hook genérico reutilizável
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  return [value, setValue] as const;
}

// Uso
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
```

## Padrões de Estilização

### Tailwind CSS

```tsx
// ✅ Bom - classes organizadas por categoria
<div className={cn(
  // Layout
  'flex items-center justify-between',
  // Espaçamento
  'p-4 gap-4',
  // Visual
  'bg-white rounded-lg shadow',
  // Responsivo
  'md:flex-row',
  // Condicional
  isActive && 'ring-2 ring-blue-500'
)} />
```

### Utilitário cn()

```typescript
import { cn } from '@/lib/utils';

// Combinar classes condicionalmente
<button className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-800',
  disabled && 'opacity-50 cursor-not-allowed'
)} />
```

## Padrões de Dados

### React Query

```typescript
// Query com configuração adequada
const { data, isLoading, error } = useQuery({
  queryKey: ['machines', selectedUnitId],
  queryFn: () => fetchMachines(selectedUnitId),
  staleTime: 30 * 1000, // 30 segundos
  enabled: !!selectedUnitId,
});

// Mutation com feedback
const mutation = useMutation({
  mutationFn: updateMachine,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['machines'] });
    toast.success('Máquina atualizada!');
  },
  onError: (error) => {
    toast.error(`Erro: ${error.message}`);
  },
});
```

### Supabase Queries

```typescript
// ✅ Bom - query tipada e com tratamento de erro
async function fetchMachines(unitId: string): Promise<Machine[]> {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('unit_id', unitId)
    .order('name');
  
  if (error) throw new Error(error.message);
  return data;
}
```

## Tratamento de Erros

### Try-Catch

```typescript
// ✅ Bom - tratamento específico
async function saveMachine(machine: Machine) {
  try {
    const { error } = await supabase
      .from('machines')
      .insert(machine);
    
    if (error) throw error;
    toast.success('Salvo com sucesso!');
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro desconhecido');
    }
  }
}
```

### Error Boundaries

```typescript
// Envolver componentes críticos
<ErrorBoundary fallback={<ErrorFallback />}>
  <Dashboard />
</ErrorBoundary>
```

## Performance

### Memoização

```typescript
// useMemo para cálculos pesados
const expensiveValue = useMemo(() => {
  return machines.filter(m => m.status === 'critical')
    .sort((a, b) => a.name.localeCompare(b.name));
}, [machines]);

// useCallback para funções passadas como props
const handleClick = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

### Lazy Loading

```typescript
// Carregar componentes pesados sob demanda
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <HeavyChart />
    </Suspense>
  );
}
```

## Acessibilidade

### Semântica

```tsx
// ✅ Bom - HTML semântico
<article>
  <header>
    <h2>Título</h2>
  </header>
  <main>Conteúdo</main>
  <footer>Rodapé</footer>
</article>

// ❌ Ruim - divs genéricas
<div>
  <div>Título</div>
  <div>Conteúdo</div>
</div>
```

### ARIA

```tsx
<button
  aria-label="Fechar modal"
  aria-pressed={isPressed}
  onClick={handleClose}
>
  <XIcon />
</button>
```

## Próximos Passos

- [Guia de Desenvolvimento](13-GUIA-DESENVOLVIMENTO.md) - Setup e desenvolvimento
- [Componentes](04-COMPONENTES.md) - Exemplos de componentes
- [Troubleshooting](15-TROUBLESHOOTING.md) - Problemas comuns
