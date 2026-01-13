# ADR-004: Tailwind CSS + shadcn/ui para Estilização

## Status

✅ **Aceito** - Janeiro/2026

---

## Contexto

### O problema

Precisávamos decidir como deixar o TireWatch Pro **bonito**. Ou seja, como definir:
- Cores dos botões
- Tamanho das letras
- Espaçamento entre elementos
- Aparência dos formulários
- etc.

### O que é "estilização"?

É o processo de definir a **aparência visual** do sistema. Um site sem estilização é como uma casa sem pintura - funciona, mas não é bonito.

---

## Decisão

Escolhemos usar **Tailwind CSS** + **shadcn/ui**.

### O que é Tailwind CSS?

É uma forma de estilizar usando "classes utilitárias". Em vez de criar arquivos CSS separados, você adiciona classes diretamente no HTML.

**Exemplo:**
```html
<!-- Botão azul com bordas arredondadas -->
<button class="bg-blue-500 text-white rounded-lg px-4 py-2">
  Clique aqui
</button>
```

### O que é shadcn/ui?

É uma coleção de **componentes prontos** (botões, formulários, tabelas, modais) que já vêm bonitos e funcionais. Você não precisa criar do zero!

### Analogia

| Sem Tailwind/shadcn | Com Tailwind/shadcn |
|---------------------|---------------------|
| Costurar roupas do zero | Comprar roupas prontas e ajustar |
| Criar cada botão manualmente | Usar botões prontos e personalizar |
| Semanas de trabalho | Horas de trabalho |

---

## Alternativas Consideradas

### CSS Puro

**Por que não escolhemos:**
- Muito trabalhoso
- Difícil manter consistência
- Código CSS fica muito grande

### Bootstrap

**Por que não escolhemos:**
- Visual "genérico" (todo site parece igual)
- Menos flexível para personalização
- Arquivo grande para baixar

### Material UI (MUI)

**Por que não escolhemos:**
- Visual muito "Google"
- Difícil de personalizar
- Bundle grande (site fica pesado)

### Styled Components

**Por que não escolhemos:**
- Curva de aprendizado maior
- Performance inferior
- CSS junto com JavaScript pode confundir

---

## O que Ganhamos

### Tailwind CSS oferece:

| Recurso | Benefício |
|---------|-----------|
| **Classes utilitárias** | Estiliza rápido, direto no HTML |
| **Design system embutido** | Cores, tamanhos e espaçamentos consistentes |
| **Responsivo fácil** | `md:`, `lg:` para diferentes telas |
| **Dark mode** | Suporte a tema escuro nativo |
| **Performance** | Só inclui o CSS que você usa |

### shadcn/ui oferece:

| Componente | O que é |
|------------|---------|
| **Button** | Botões em vários estilos |
| **Card** | Caixas para organizar conteúdo |
| **Dialog** | Janelas de popup |
| **Table** | Tabelas com ordenação e filtro |
| **Form** | Formulários com validação |
| **Chart** | Gráficos bonitos |
| **E muito mais...** | +40 componentes prontos |

---

## Consequências

### ✅ Positivas

1. **Desenvolvimento rápido** - Componentes prontos para usar
2. **Visual moderno** - Design bonito e atual
3. **Consistência** - Todo o sistema fica com a mesma aparência
4. **Acessibilidade** - Componentes já seguem boas práticas
5. **Personalização** - Fácil de ajustar cores e estilos

### ⚠️ Negativas

1. **HTML mais verboso** - Muitas classes no HTML
2. **Curva de aprendizado** - Precisa aprender as classes do Tailwind
3. **Difícil para designers tradicionais** - Quem está acostumado com CSS puro pode estranhar

---

## Resumo em Uma Frase

> Escolhemos Tailwind CSS + shadcn/ui porque oferece componentes prontos e bonitos que aceleram muito o desenvolvimento, mantendo o sistema visualmente consistente e moderno.
