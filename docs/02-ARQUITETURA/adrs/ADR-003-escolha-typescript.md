# ADR-003: Uso de TypeScript em Todo o Projeto

## Status

✅ **Aceito** - Janeiro/2026

---

## Contexto

### O problema

Precisávamos decidir qual **linguagem de programação** usar para escrever o código do TireWatch Pro.

### O que é uma linguagem de programação?

É a "língua" que usamos para dar instruções ao computador. Assim como existem português, inglês e espanhol para humanos, existem JavaScript, Python e TypeScript para computadores.

---

## Decisão

Escolhemos usar **TypeScript** em todo o projeto.

### O que é TypeScript?

TypeScript é JavaScript com **superpoderes**. É a mesma linguagem, mas com uma camada extra de segurança.

### Analogia: JavaScript vs TypeScript

Imagine que você está montando um quebra-cabeça:

| JavaScript | TypeScript |
|------------|------------|
| Peças sem formato definido - você só descobre se encaixam quando tenta | Peças com formato definido - você sabe antes se vai encaixar |
| Descobre erros quando o programa roda | Descobre erros enquanto escreve o código |
| "Vou tentar e ver se funciona" | "Sei que vai funcionar antes de testar" |

### Exemplo Prático

**JavaScript (sem tipos):**
```javascript
function calcularPreco(quantidade, valorUnitario) {
  return quantidade * valorUnitario;
}

// Isso funciona:
calcularPreco(5, 10); // = 50 ✅

// Isso também "funciona" mas está errado:
calcularPreco("cinco", "dez"); // = NaN 😱
```

**TypeScript (com tipos):**
```typescript
function calcularPreco(quantidade: number, valorUnitario: number): number {
  return quantidade * valorUnitario;
}

// Isso funciona:
calcularPreco(5, 10); // = 50 ✅

// Isso mostra ERRO antes de rodar:
calcularPreco("cinco", "dez"); // ❌ Erro: esperava número, recebeu texto
```

---

## Alternativas Consideradas

### JavaScript Puro

**Por que não escolhemos:**
- Mais fácil cometer erros
- Erros só aparecem quando o programa roda
- Difícil de manter em projetos grandes

### Outras Linguagens (Python, Go, etc.)

**Por que não escolhemos:**
- React usa JavaScript/TypeScript
- Supabase usa JavaScript/TypeScript
- Manter uma única linguagem é mais simples

---

## Consequências

### ✅ Positivas

1. **Menos bugs** - O editor avisa erros antes de rodar
2. **Autocomplete melhor** - O editor sugere o que você pode usar
3. **Documentação automática** - Os tipos servem como documentação
4. **Refatoração segura** - Mudar código fica mais seguro
5. **Trabalho em equipe** - Mais fácil entender código de outros

### ⚠️ Negativas

1. **Curva de aprendizado** - Precisa aprender a usar tipos
2. **Código um pouco maior** - Precisa declarar os tipos
3. **Compilação** - Precisa "converter" TypeScript para JavaScript

---

## Resumo em Uma Frase

> Escolhemos TypeScript porque ele nos ajuda a encontrar erros antes do código rodar, tornando o desenvolvimento mais seguro e a manutenção mais fácil.
