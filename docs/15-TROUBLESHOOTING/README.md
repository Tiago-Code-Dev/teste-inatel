# Troubleshooting

## Problemas Comuns

### Erro: "Cannot find module '@/...'"

**Sintoma**: Import com `@/` não funciona.

**Solução**: Verifique `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### Erro: "401 Unauthorized" no Supabase

**Sintoma**: Requisições ao Supabase retornam 401.

**Soluções**:

1. **Verificar variáveis de ambiente**:
```bash
# .env.local deve existir e conter:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

2. **Verificar se token não expirou**:
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

3. **Fazer login novamente**:
```typescript
await supabase.auth.signOut();
// Redirecionar para /auth
```

---

### Erro: "403 Forbidden"

**Sintoma**: Usuário autenticado mas sem permissão.

**Causa**: Row Level Security (RLS) bloqueando acesso.

**Soluções**:

1. **Verificar se usuário tem acesso à unidade**:
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('unit_ids')
  .eq('user_id', user.id)
  .single();

console.log('Unidades do usuário:', profile?.unit_ids);
```

2. **Verificar políticas RLS** no Supabase Dashboard.

---

### Erro: "Network Error" ou "Failed to fetch"

**Sintoma**: Requisições falham sem resposta.

**Soluções**:

1. **Verificar conexão com internet**

2. **Verificar se Supabase está online**:
   - Acesse https://status.supabase.com/

3. **Verificar CORS** (se aplicável):
   - Configurar no Supabase Dashboard

---

### Componente não atualiza em tempo real

**Sintoma**: Dados não atualizam automaticamente.

**Soluções**:

1. **Verificar se Realtime está habilitado**:
   - Supabase Dashboard > Database > Replication
   - Habilitar para a tabela desejada

2. **Verificar subscription**:
```typescript
const channel = supabase
  .channel('test')
  .on('postgres_changes', { event: '*', table: 'alerts' }, (payload) => {
    console.log('Recebido:', payload);
  })
  .subscribe((status) => {
    console.log('Status:', status);
  });
```

3. **Verificar se está invalidando queries**:
```typescript
queryClient.invalidateQueries({ queryKey: ['alerts'] });
```

---

### Erro: "Port 8080 is already in use"

**Sintoma**: Não consegue iniciar o servidor de desenvolvimento.

**Soluções**:

**Windows**:
```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Linux/Mac**:
```bash
lsof -i :8080
kill -9 <PID>
```

**Ou mudar a porta** em `vite.config.ts`:
```typescript
server: {
  port: 3000, // Outra porta
}
```

---

### Erro: "Module not found" após npm install

**Sintoma**: Módulo não encontrado mesmo após instalar.

**Soluções**:

1. **Limpar cache e reinstalar**:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

2. **Reiniciar VS Code** (para atualizar TypeScript)

3. **Verificar se pacote está no package.json**

---

### Tela branca / Aplicação não carrega

**Sintoma**: Página em branco sem erros visíveis.

**Soluções**:

1. **Verificar console do navegador** (F12 > Console)

2. **Verificar se há erros de JavaScript**

3. **Verificar se variáveis de ambiente estão corretas**

4. **Limpar cache do navegador**:
   - Ctrl+Shift+Delete > Limpar dados de navegação

---

### Erro de TypeScript: "Type 'X' is not assignable to type 'Y'"

**Sintoma**: Erro de tipo no TypeScript.

**Soluções**:

1. **Verificar tipos importados**:
```typescript
import type { Machine } from '@/types';
```

2. **Verificar se tipos estão atualizados**:
```bash
# Regenerar tipos do Supabase
npx supabase gen types typescript --project-id xxx > src/integrations/supabase/types.ts
```

3. **Usar type assertion quando necessário**:
```typescript
const machine = data as Machine;
```

---

### Formulário não submete

**Sintoma**: Botão de submit não faz nada.

**Soluções**:

1. **Verificar se form tem onSubmit**:
```tsx
<form onSubmit={handleSubmit}>
```

2. **Verificar se botão é type="submit"**:
```tsx
<button type="submit">Enviar</button>
```

3. **Verificar validação**:
```typescript
console.log('Erros:', form.formState.errors);
```

---

### Imagens não carregam

**Sintoma**: Imagens aparecem quebradas.

**Soluções**:

1. **Verificar URL da imagem** no console

2. **Verificar permissões do Storage** no Supabase

3. **Verificar se bucket é público**

---

## Logs e Diagnóstico

### Console do Navegador

```typescript
// Debug de dados
console.log('Dados:', data);
console.table(arrayData);

// Debug de erros
console.error('Erro:', error);

// Debug de performance
console.time('operacao');
// ... código
console.timeEnd('operacao');
```

### React Query DevTools

```typescript
// Adicionar no App.tsx (apenas desenvolvimento)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Network Tab

1. Abra DevTools (F12)
2. Vá para aba "Network"
3. Filtre por "Fetch/XHR"
4. Veja requisições e respostas

## FAQ

### Como limpar cache do React Query?

```typescript
queryClient.clear();
```

### Como forçar refetch de dados?

```typescript
queryClient.invalidateQueries({ queryKey: ['machines'] });
// ou
refetch();
```

### Como debugar RLS?

1. Acesse Supabase Dashboard
2. Vá em SQL Editor
3. Execute query com `auth.uid()`:
```sql
SELECT auth.uid();
SELECT * FROM profiles WHERE user_id = auth.uid();
```

### Como verificar se Realtime está funcionando?

```typescript
const channel = supabase.channel('test')
  .subscribe((status) => {
    console.log('Realtime status:', status);
  });
```

## Próximos Passos

- [Guia de Desenvolvimento](13-GUIA-DESENVOLVIMENTO.md) - Setup correto
- [Configuração](11-CONFIGURACAO.md) - Variáveis de ambiente
- [API Reference](12-API-REFERENCE.md) - Referência de APIs
