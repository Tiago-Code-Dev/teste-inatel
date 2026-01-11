# Configuração

## Introdução

Esta documentação detalha todas as configurações do TireWatch Pro, incluindo variáveis de ambiente, arquivos de configuração e opções customizáveis.

## Variáveis de Ambiente

### Obrigatórias

```env
# URL do projeto Supabase
VITE_SUPABASE_URL=https://mwvtdxdzvxzmswpkeoko.supabase.co

# Chave pública do Supabase (anon key)
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### Onde obter

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings > API**
4. Copie a **URL** e a **anon public key**

### Arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

> ⚠️ **Importante**: Nunca commite o `.env.local` no Git!

## Configuração do Vite

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '::',
    port: 8080,
  },
});
```

**Explicando:**
- `plugins`: Usa React com SWC (compilador mais rápido)
- `alias`: Permite usar `@/` ao invés de caminhos relativos
- `server.port`: Porta do servidor de desenvolvimento

## Configuração do TypeScript

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**Opções importantes:**
- `strict`: Habilita verificações rigorosas de tipo
- `paths`: Configura o alias `@/`

## Configuração do Tailwind

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... outras cores
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

### CSS Variables (index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --muted: 210 40% 96.1%;
    --accent: 210 40% 96.1%;
    --destructive: 0 84.2% 60.2%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... cores do tema escuro */
  }
}
```

## Configuração do ESLint

### eslint.config.js

```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
```

## Configuração do Supabase

### supabase/config.toml

```toml
[api]
enabled = true
port = 54321
schemas = ["public"]

[db]
port = 54322

[studio]
enabled = true
port = 54323

[auth]
site_url = "http://localhost:8080"
jwt_expiry = 3600
```

## Scripts do package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

| Script | Descrição |
|--------|-----------|
| `dev` | Inicia servidor de desenvolvimento |
| `build` | Build de produção |
| `build:dev` | Build de desenvolvimento |
| `lint` | Executa ESLint |
| `preview` | Preview do build |

## Próximos Passos

- [Guia de Desenvolvimento](13-GUIA-DESENVOLVIMENTO.md) - Setup completo
- [Troubleshooting](15-TROUBLESHOOTING.md) - Problemas de configuração
