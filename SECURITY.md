# Política de Segurança

## Versões Suportadas

| Versão | Suportada |
|--------|-----------|
| 1.x    | ✅ Sim    |

## Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, por favor:

1. **NÃO** abra uma issue pública
2. Envie um email para a equipe de segurança
3. Inclua detalhes da vulnerabilidade
4. Aguarde confirmação de recebimento

### O que incluir no report

- Descrição da vulnerabilidade
- Passos para reproduzir
- Impacto potencial
- Sugestão de correção (se tiver)

## Boas Práticas de Segurança

### Autenticação

- Senhas com mínimo 8 caracteres
- Tokens JWT com expiração curta
- Row Level Security (RLS) habilitado

### Dados Sensíveis

- Nunca commitar `.env` ou credenciais
- Usar variáveis de ambiente
- Criptografia em trânsito (HTTPS)

### Código

- Validar inputs do usuário
- Sanitizar dados antes de exibir
- Manter dependências atualizadas

## Atualizações de Segurança

Atualizações críticas de segurança são lançadas assim que possível após descoberta e correção.

---

**Segurança é responsabilidade de todos! 🔐**
