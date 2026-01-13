# 🎨 Design System - TireWatch Pro

## O que é um Design System?

### Explicação Simples

Imagine que você está montando uma coleção de LEGO. Seria muito difícil se cada peça fosse de um tamanho diferente, cor diferente e não encaixasse nas outras, certo?

Um **Design System** é como um "kit de LEGO padronizado" para o visual do sistema:
- Todas as cores são definidas
- Todos os tamanhos de letra são definidos
- Todos os botões seguem o mesmo padrão
- Tudo se encaixa harmoniosamente

### Por que isso importa?

| Sem Design System | Com Design System |
|-------------------|-------------------|
| Cada tela tem cores diferentes | Todas as telas usam as mesmas cores |
| Botões de tamanhos variados | Todos os botões são consistentes |
| Visual "bagunçado" | Visual profissional e organizado |
| Difícil de manter | Fácil de manter e atualizar |

---

## 🎨 Cores

### Cores Principais

| Nome | Cor | Código | Uso |
|------|-----|--------|-----|
| **Primary** | 🟢 Verde | `#22c55e` | Botões principais, sucesso |
| **Secondary** | 🔵 Azul | `#3b82f6` | Links, destaques |
| **Accent** | 🟡 Amarelo | `#eab308` | Avisos, atenção |
| **Destructive** | 🔴 Vermelho | `#ef4444` | Erros, exclusão, alertas críticos |

### Cores de Status (Alertas)

| Status | Cor | Código | Quando usar |
|--------|-----|--------|-------------|
| **Crítico** | 🔴 Vermelho | `#ef4444` | Pressão muito baixa, problema grave |
| **Alto** | 🟠 Laranja | `#f97316` | Atenção urgente necessária |
| **Médio** | 🟡 Amarelo | `#eab308` | Monitorar de perto |
| **Baixo** | 🟢 Verde | `#22c55e` | Informativo, tudo OK |

### Cores de Fundo

| Nome | Código | Uso |
|------|--------|-----|
| **Background** | `#ffffff` | Fundo principal (claro) |
| **Card** | `#f8fafc` | Fundo de cards |
| **Muted** | `#f1f5f9` | Áreas desabilitadas |
| **Border** | `#e2e8f0` | Bordas e divisórias |

### Modo Escuro (Dark Mode)

| Elemento | Modo Claro | Modo Escuro |
|----------|------------|-------------|
| Fundo | `#ffffff` | `#0f172a` |
| Texto | `#0f172a` | `#f8fafc` |
| Cards | `#f8fafc` | `#1e293b` |
| Bordas | `#e2e8f0` | `#334155` |

---

## 📝 Tipografia (Fontes)

### Fonte Principal

**Inter** - Usamos a fonte Inter em todo o sistema porque:
- É gratuita e open source
- Funciona bem em telas
- Tem muitos "pesos" (fino, normal, negrito)

### Tamanhos de Texto

| Nome | Tamanho | Uso | Exemplo |
|------|---------|-----|---------|
| **xs** | 12px | Textos pequenos, legendas | Datas, rodapés |
| **sm** | 14px | Texto secundário | Descrições |
| **base** | 16px | Texto normal | Parágrafos |
| **lg** | 18px | Texto destacado | Subtítulos |
| **xl** | 20px | Títulos pequenos | Títulos de cards |
| **2xl** | 24px | Títulos médios | Títulos de seções |
| **3xl** | 30px | Títulos grandes | Títulos de páginas |
| **4xl** | 36px | Títulos muito grandes | Dashboard |

### Pesos da Fonte

| Peso | Número | Uso |
|------|--------|-----|
| **Normal** | 400 | Texto comum |
| **Medium** | 500 | Texto com leve destaque |
| **Semibold** | 600 | Botões, labels |
| **Bold** | 700 | Títulos, destaques fortes |

---

## 📏 Espaçamentos

### Sistema de Espaçamento

Usamos múltiplos de **4px** para manter tudo alinhado:

| Nome | Tamanho | Uso |
|------|---------|-----|
| **1** | 4px | Espaço mínimo |
| **2** | 8px | Entre elementos pequenos |
| **3** | 12px | Padding interno pequeno |
| **4** | 16px | Padding padrão |
| **5** | 20px | Espaço médio |
| **6** | 24px | Separação de seções |
| **8** | 32px | Espaço grande |
| **10** | 40px | Margem de página |
| **12** | 48px | Separação de blocos |

### Exemplo Visual

```
┌────────────────────────────────────────┐
│            padding: 24px (6)            │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │         Conteúdo do Card         │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                 ↕ gap: 16px (4)         │
│  ┌──────────────────────────────────┐  │
│  │         Outro elemento           │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

---

## 🔘 Componentes

### Botões

| Variante | Aparência | Quando usar |
|----------|-----------|-------------|
| **Default** | Fundo cinza, texto escuro | Ações secundárias |
| **Primary** | Fundo verde, texto branco | Ação principal da página |
| **Secondary** | Fundo azul, texto branco | Ações importantes mas não principais |
| **Destructive** | Fundo vermelho, texto branco | Excluir, cancelar |
| **Outline** | Borda, sem fundo | Ações terciárias |
| **Ghost** | Sem borda, sem fundo | Ações sutis |

### Tamanhos de Botão

| Tamanho | Altura | Quando usar |
|---------|--------|-------------|
| **sm** | 32px | Em tabelas, espaços pequenos |
| **default** | 40px | Uso geral |
| **lg** | 48px | CTAs importantes |

### Cards

Cards são "caixas" que agrupam informações relacionadas.

```
┌─────────────────────────────────────┐
│  📊 Título do Card                  │  ← Header (opcional)
├─────────────────────────────────────┤
│                                     │
│  Conteúdo principal do card         │  ← Content
│  pode ter qualquer coisa aqui       │
│                                     │
├─────────────────────────────────────┤
│  [Cancelar]  [Confirmar]            │  ← Footer (opcional)
└─────────────────────────────────────┘
```

### Badges (Etiquetas)

| Variante | Cor | Uso |
|----------|-----|-----|
| **Default** | Cinza | Status neutro |
| **Success** | Verde | Operacional, concluído |
| **Warning** | Amarelo | Atenção, pendente |
| **Destructive** | Vermelho | Erro, crítico |

---

## 📱 Responsividade

### Breakpoints (Pontos de Quebra)

| Nome | Largura | Dispositivo |
|------|---------|-------------|
| **sm** | 640px | Celular grande |
| **md** | 768px | Tablet |
| **lg** | 1024px | Laptop |
| **xl** | 1280px | Desktop |
| **2xl** | 1536px | Monitor grande |

### Como funciona

O layout se adapta automaticamente:

```
📱 Celular (< 640px)
┌─────────────┐
│   Card 1    │
├─────────────┤
│   Card 2    │
├─────────────┤
│   Card 3    │
└─────────────┘

💻 Desktop (> 1024px)
┌─────────────┬─────────────┬─────────────┐
│   Card 1    │   Card 2    │   Card 3    │
└─────────────┴─────────────┴─────────────┘
```

---

## 🌓 Modo Claro vs Escuro

O TireWatch Pro suporta dois temas:

| Aspecto | Modo Claro ☀️ | Modo Escuro 🌙 |
|---------|---------------|----------------|
| Fundo | Branco | Azul escuro |
| Texto | Preto | Branco |
| Melhor para | Ambientes claros | Ambientes escuros, noite |
| Cansa menos | Durante o dia | Durante a noite |

O usuário pode escolher nas configurações ou usar o tema do sistema.

---

## ✅ Checklist de Consistência

Ao criar novas telas, verifique:

- [ ] Cores são do design system?
- [ ] Fontes são Inter?
- [ ] Espaçamentos são múltiplos de 4px?
- [ ] Botões seguem os padrões?
- [ ] Funciona no celular?
- [ ] Funciona no modo escuro?

---

## 🔗 Recursos

- **shadcn/ui** - [ui.shadcn.com](https://ui.shadcn.com) - Componentes que usamos
- **Tailwind CSS** - [tailwindcss.com](https://tailwindcss.com) - Framework de estilos
- **Lucide Icons** - [lucide.dev](https://lucide.dev) - Ícones do sistema
