# ADR-001: Escolha do React como Framework Frontend

## Status

✅ **Aceito** - Janeiro/2026

---

## Contexto

### O problema

Precisávamos escolher uma tecnologia para construir a **interface** (as telas) do TireWatch Pro.

### O que é "interface"?

É tudo que o usuário vê e interage: botões, formulários, gráficos, tabelas, menus, etc.

### Requisitos que tínhamos

1. **Fácil de aprender** - A equipe precisa conseguir trabalhar rapidamente
2. **Muitos componentes prontos** - Não queremos criar tudo do zero
3. **Boa performance** - O sistema precisa ser rápido
4. **Grande comunidade** - Se tivermos dúvidas, precisa ter onde perguntar
5. **Atualizações frequentes** - A tecnologia precisa continuar evoluindo

---

## Decisão

Escolhemos o **React** como framework para construir a interface.

### O que é React?

React é uma "ferramenta" criada pelo Facebook para construir interfaces de sites e aplicativos. Pense nele como um conjunto de "peças de LEGO" que você monta para criar telas.

### Por que React?

| Critério | React | Vue | Angular |
|----------|-------|-----|---------|
| Fácil de aprender | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Componentes disponíveis | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Tamanho da comunidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Vagas de emprego | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Alternativas Consideradas

### Vue.js

**O que é:** Outro framework para criar interfaces, conhecido por ser muito fácil de aprender.

**Por que não escolhemos:**
- Menos componentes prontos disponíveis
- Comunidade menor no Brasil
- Menos vagas de emprego (se precisarmos contratar)

### Angular

**O que é:** Framework criado pelo Google, muito robusto e completo.

**Por que não escolhemos:**
- Mais difícil de aprender
- Mais "pesado" (o site fica mais lento para carregar)
- Curva de aprendizado maior para a equipe

### Vanilla JavaScript (sem framework)

**O que é:** Criar tudo "na mão", sem usar nenhum framework.

**Por que não escolhemos:**
- Muito mais trabalho
- Mais difícil de manter
- Reinventar a roda (criar coisas que já existem prontas)

---

## Consequências

### ✅ Positivas

1. **Muita documentação disponível** - Se tivermos dúvidas, é fácil encontrar respostas
2. **Muitos componentes prontos** - Podemos usar bibliotecas como shadcn/ui
3. **Equipe produtiva** - Desenvolvedores React são fáceis de encontrar
4. **Código organizado** - React incentiva organização em componentes

### ⚠️ Negativas (coisas para ficar atento)

1. **Precisa aprender "o jeito React"** - Tem uma forma específica de fazer as coisas
2. **Muitas opções** - Às vezes é difícil escolher entre tantas bibliotecas
3. **Atualizações frequentes** - Precisamos ficar atentos a mudanças

---

## Resumo em Uma Frase

> Escolhemos React porque é a tecnologia mais popular, com maior comunidade e mais componentes prontos disponíveis, o que nos permite desenvolver mais rápido e com mais qualidade.
