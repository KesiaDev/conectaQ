# CASA QR Platform

Sistema de cadastro via QR Code para a CASA - Igreja do Evangelho Quadrangular Caxias do Sul.

## Funcionalidades

- ✅ Página inicial com boas-vindas
- ✅ Formulário de cadastro com validação (react-hook-form + zod)
- ✅ Página de sucesso com links para Instagram e WhatsApp
- ✅ API REST para salvar dados no banco (Prisma + SQLite)
- ✅ Painel administrativo com listagem, busca e exportação CSV
- ✅ Layout moderno com shadcn/ui
- ✅ Consentimento LGPD antes do envio
- ✅ Geração de QR Code para acesso rápido

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- shadcn/ui
- react-hook-form + zod
- QRCode

## Setup

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse:
- Página inicial: http://localhost:3000
- Painel admin: http://localhost:3000/admin
- QR Code: http://localhost:3000/qr

## Estrutura do Banco de Dados

- `people`: Pessoas cadastradas
- `visits`: Visitas registradas
- `tags`: Tags para segmentação
- `people_tags`: Relação pessoas-tags
- `campaigns`: Campanhas de comunicação
- `events`: Eventos de telemetria

## LGPD

O sistema inclui:
- Consentimento explícito antes do cadastro
- Registro do momento do consentimento
- Base legal conforme Lei 13.709/2018

## Próximos Passos

- Integração com ViaCEP para autopreenchimento de endereço
- Integração com WhatsApp Business API
- Integração com e-mail (Brevo/Sendinblue)
- Sistema de tags e segmentação
- Métricas e funil de conversão


