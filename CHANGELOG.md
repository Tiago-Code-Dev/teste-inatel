# Changelog

Todas as mudanças notáveis do projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-01-10

### Adicionado

- Dashboard principal com métricas de saúde da frota
- Centro de comando de alertas com SLA
- Gestão de máquinas e pneus
- Telemetria em tempo real via WebSocket
- Sistema de alertas automáticos
- Multi-tenancy (múltiplas unidades)
- Autenticação com Supabase Auth
- Hierarquia de permissões (Admin, Manager, Technician, Operator)
- Geolocalização com Mapbox
- Insights de IA com Google Gemini
- Registro de ocorrências com mídia
- Analytics avançados e Business Intelligence

### Tecnologias

- React 18 + TypeScript + Vite
- Supabase (PostgreSQL + Edge Functions + Realtime)
- Tailwind CSS + shadcn/ui
- React Query (TanStack Query)

---

## Formato de Versões

### [MAJOR.MINOR.PATCH]

- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

### Tipos de Mudanças

- **Adicionado**: Novas funcionalidades
- **Alterado**: Mudanças em funcionalidades existentes
- **Obsoleto**: Funcionalidades que serão removidas
- **Removido**: Funcionalidades removidas
- **Corrigido**: Correções de bugs
- **Segurança**: Correções de vulnerabilidades
