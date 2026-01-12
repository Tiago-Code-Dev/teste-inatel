# Guia de Contribuição

Obrigado por considerar contribuir com o **TireWatch Pro**! Este documento descreve as diretrizes para contribuição.

## Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone <seu-fork-url>
cd teste-inatel
```

### 2. Crie uma Branch

```bash
# Crie uma branch para sua feature/fix
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-fix
```

### 3. Faça suas Alterações

- Siga as [Boas Práticas](docs/14-BOAS-PRATICAS/)
- Escreva código limpo e documentado
- Adicione testes quando aplicável

### 4. Commit

Siga o padrão de commit:

```bash
# Formato: tipo(escopo): descrição
git commit -m "feat(dashboard): adiciona novo gráfico de tendências"
git commit -m "fix(auth): corrige erro de logout"
git commit -m "docs(readme): atualiza instruções de instalação"
```

**Tipos de commit:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção

### 5. Pull Request

1. Push para seu fork
2. Abra um Pull Request
3. Descreva suas alterações
4. Aguarde review

## Padrões de Código

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `MachineCard.tsx` |
| Hooks | camelCase | `useMachines.ts` |
| Funções | camelCase | `formatDate()` |
| Constantes | UPPER_SNAKE | `MAX_ITEMS` |

### Estrutura de Componente

```typescript
// 1. Imports
import { useState } from 'react';
import type { Machine } from '@/types';

// 2. Interface
interface Props {
  machine: Machine;
}

// 3. Componente
export function MachineCard({ machine }: Props) {
  return <div>{machine.name}</div>;
}
```

## Code Review

### Checklist do Reviewer

- [ ] Código segue padrões do projeto
- [ ] Testes passam
- [ ] Sem erros de lint
- [ ] Documentação atualizada (se necessário)
- [ ] Performance considerada

## Dúvidas?

- Leia a [documentação](docs/)
- Abra uma issue para discussão

---

**Obrigado por contribuir! 🚀**
