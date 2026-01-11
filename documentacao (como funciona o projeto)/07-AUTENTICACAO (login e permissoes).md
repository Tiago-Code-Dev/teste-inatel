# Autenticação e Autorização

## Introdução

O TireWatch Pro utiliza o **Supabase Auth** para gerenciar autenticação (quem é você) e autorização (o que você pode fazer). O sistema implementa JWT (JSON Web Tokens) para autenticação stateless e Row Level Security (RLS) para controle de acesso aos dados.

### Diferença entre Autenticação e Autorização

- **Autenticação**: Verificar a identidade do usuário (login)
- **Autorização**: Verificar o que o usuário pode fazer (permissões)

## Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as 👤 Usuário
    participant App as 📱 Aplicação
    participant Auth as 🔐 Supabase Auth
    participant DB as 🗄️ Banco de Dados
    
    U->>App: Digita email e senha
    App->>Auth: signInWithPassword()
    Auth->>Auth: Valida credenciais
    Auth->>Auth: Gera JWT token
    Auth-->>App: Retorna session + user
    App->>App: Salva no AuthContext
    App->>DB: Busca perfil e unidades
    DB-->>App: Retorna dados do perfil
    App-->>U: Redireciona para Dashboard
    
    Note over U,DB: Usuário autenticado!
```

## JWT (JSON Web Token)

### O que é JWT?

JWT é um "crachá digital" que prova que você está autenticado. Contém informações sobre o usuário e uma assinatura que garante que não foi adulterado.

### Estrutura do Token

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Dividido em 3 partes (separadas por `.`):
1. **Header**: Tipo de token e algoritmo
2. **Payload**: Dados do usuário (claims)
3. **Signature**: Assinatura para verificação

### Claims do Token

```json
{
  "sub": "uuid-do-usuario",
  "email": "usuario@empresa.com",
  "role": "authenticated",
  "aud": "authenticated",
  "exp": 1640000000,
  "iat": 1639999000
}
```

| Claim | Significado |
|-------|-------------|
| `sub` | ID único do usuário |
| `email` | Email do usuário |
| `role` | Role no Supabase (authenticated) |
| `exp` | Quando o token expira |
| `iat` | Quando o token foi criado |

## Implementação no Frontend

### AuthContext

O AuthContext gerencia todo o estado de autenticação:

```typescript
// src/contexts/AuthContext.tsx

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica sessão existente ao carregar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Usando o AuthContext

```typescript
function MeuComponente() {
  const { user, signOut, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/auth" />;

  return (
    <div>
      <p>Olá, {user.email}!</p>
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
```

### ProtectedRoute

Componente que protege rotas autenticadas:

```typescript
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

// Uso no App.tsx
<Routes>
  <Route path="/auth" element={<AuthPage />} />
  
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/machines" element={<MachinesPage />} />
    {/* Todas as rotas aqui requerem autenticação */}
  </Route>
</Routes>
```

## Hierarquia de Permissões (Roles)

O sistema implementa 4 níveis de permissão:

```mermaid
graph TD
    Admin[👑 Admin - Nível 4] --> Manager[👔 Manager - Nível 3]
    Manager --> Technician[🔧 Technician - Nível 2]
    Technician --> Operator[👷 Operator - Nível 1]
    
    style Admin fill:#ff6b6b
    style Manager fill:#feca57
    style Technician fill:#48dbfb
    style Operator fill:#1dd1a1
```

### Permissões por Role

| Role | Nível | O que pode fazer |
|------|-------|------------------|
| **Admin** | 4 | Tudo - gerenciar usuários, configurações, todas as unidades |
| **Manager** | 3 | Gerenciar equipes, ver relatórios, todas as operações da unidade |
| **Technician** | 2 | Realizar manutenções, calibrações, resolver alertas |
| **Operator** | 1 | Operação diária, registrar ocorrências, visualizar dados |

### Verificação de Permissão

```typescript
// Tipos
type UserRole = 'admin' | 'manager' | 'technician' | 'operator';

const roleHierarchy: Record<UserRole, number> = {
  admin: 4,
  manager: 3,
  technician: 2,
  operator: 1,
};

// Função para verificar se pode executar ação
function canPerformAction(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Uso
if (canPerformAction(user.role, 'manager')) {
  // Pode ver relatórios
}
```

## Multi-Tenancy

### O que é Multi-Tenancy?

Multi-tenancy permite que múltiplas organizações (tenants) usem o mesmo sistema, mas cada uma só vê seus próprios dados.

### Implementação

```mermaid
graph TD
    User[Usuário] --> Profile[Perfil]
    Profile --> |unit_ids array| Units[Unidades]
    Units --> Unit1[Fazenda Norte]
    Units --> Unit2[Fazenda Sul]
    Unit1 --> Machines1[Máquinas]
    Unit2 --> Machines2[Máquinas]
    
    style User fill:#FFB6C1
    style Profile fill:#87CEEB
    style Units fill:#90EE90
```

### TenantContext

```typescript
// src/contexts/TenantContext.tsx

interface TenantContextType {
  units: Unit[];
  selectedUnitId: string | null;
  selectUnit: (id: string | null) => void;
}

export function TenantProvider({ children }) {
  const { user } = useAuth();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Busca unidades do usuário
  const { data: units = [] } = useQuery({
    queryKey: ['units', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('unit_ids')
        .eq('user_id', user?.id)
        .single();
      
      if (data?.unit_ids) {
        const { data: units } = await supabase
          .from('units')
          .select('*')
          .in('id', data.unit_ids);
        return units;
      }
      return [];
    },
    enabled: !!user,
  });

  return (
    <TenantContext.Provider value={{ units, selectedUnitId, selectUnit: setSelectedUnitId }}>
      {children}
    </TenantContext.Provider>
  );
}
```

### Filtrando Dados por Unidade

```typescript
function useMachines() {
  const { selectedUnitId } = useTenant();

  return useQuery({
    queryKey: ['machines', selectedUnitId],
    queryFn: async () => {
      let query = supabase.from('machines').select('*');
      
      // Filtra por unidade se selecionada
      if (selectedUnitId) {
        query = query.eq('unit_id', selectedUnitId);
      }
      
      const { data } = await query;
      return data;
    },
  });
}
```

## Row Level Security (RLS)

### O que é RLS?

RLS é uma funcionalidade do PostgreSQL que aplica políticas de segurança automaticamente em cada query. Garante que usuários só acessem dados permitidos.

### Políticas do TireWatch Pro

```sql
-- Usuário só vê máquinas das suas unidades
CREATE POLICY "users_view_own_units_machines"
ON machines FOR SELECT
USING (
  unit_id IN (
    SELECT unnest(unit_ids) 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);

-- Usuário só vê alertas das suas máquinas
CREATE POLICY "users_view_own_alerts"
ON alerts FOR SELECT
USING (
  machine_id IN (
    SELECT id FROM machines 
    WHERE unit_id IN (
      SELECT unnest(unit_ids) 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  )
);
```

### Benefícios do RLS

- **Segurança**: Impossível acessar dados de outras unidades
- **Simplicidade**: Não precisa filtrar no código da aplicação
- **Performance**: Filtro acontece no banco de dados
- **Consistência**: Todas as queries são automaticamente filtradas

## Segurança

### Boas Práticas Implementadas

✅ Tokens JWT com expiração curta  
✅ HTTPS em todas as comunicações  
✅ RLS para isolamento de dados  
✅ Validação de entrada em todas as APIs  
✅ Rate limiting para prevenir abuso  
✅ Senhas hasheadas (bcrypt)  

### Requisitos de Senha

- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial

## Próximos Passos

- [Banco de Dados](08-BANCO-DE-DADOS.md) - Schema e políticas RLS
- [API Reference](12-API-REFERENCE.md) - Autenticação nas APIs
- [Troubleshooting](15-TROUBLESHOOTING.md) - Problemas de autenticação
