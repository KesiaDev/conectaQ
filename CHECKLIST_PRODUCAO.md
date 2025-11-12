# ✅ Checklist de Configuração em Produção

## 🚀 Configuração Inicial no Railway

### 1. Variáveis de Ambiente (Railway → Variables)

Certifique-se de que todas estas variáveis estão configuradas:

- ✅ `DATABASE_URL` - String de conexão do PostgreSQL (já configurada)
- ✅ `NEXTAUTH_SECRET` - **IMPORTANTE**: Deve ser uma string aleatória longa (mínimo 32 caracteres)
  - Gere em: https://generate-secret.vercel.app/32
  - Configure como **Secret** (não como variável normal)
- ✅ `NEXTAUTH_URL` - URL completa da aplicação: `https://conectaq-production.up.railway.app`
- ✅ `ADMIN_USERNAME` - Usuário inicial (ex: `Pastor_Dennis`)
- ✅ `ADMIN_PASSWORD` - Senha inicial (será migrada para o banco no primeiro login)

### 2. Migrations do Banco de Dados

**CRÍTICO**: Execute a migration para criar a tabela `admin_users`:

1. No Railway, vá em **Deployments** → **Run Command**
2. Execute: `npx prisma migrate deploy`
3. Ou configure como comando de deploy automático nas configurações do serviço

### 3. Primeiro Login

1. Acesse: `https://conectaq-production.up.railway.app/login`
2. Use as credenciais das variáveis `ADMIN_USERNAME` e `ADMIN_PASSWORD`
3. O sistema criará automaticamente o usuário no banco de dados
4. Após o primeiro login, você pode trocar a senha usando o link "Trocar senha" na página de login

## 📋 Funcionalidades Implementadas

### ✅ Sistema de Cadastro
- [x] Formulário completo com validação
- [x] Salvamento no banco PostgreSQL
- [x] Página de sucesso com links para redes sociais
- [x] Consentimento LGPD

### ✅ Painel Administrativo
- [x] Listagem de cadastros
- [x] Busca por nome, telefone ou email
- [x] Filtro por status de batismo
- [x] Edição de cadastros
- [x] Exclusão de cadastros
- [x] Exportação em PDF
- [x] Exportação em Excel
- [x] Layout responsivo (mobile, tablet, desktop)
- [x] Botão de logout funcional

### ✅ Autenticação
- [x] Login seguro com NextAuth
- [x] Proteção de rotas administrativas
- [x] Sistema de troca de senha
- [x] Senhas hashadas com bcrypt

### ✅ QR Code
- [x] Geração automática do QR Code
- [x] Link apontando para o domínio de produção
- [x] Download do QR Code em PNG

## 🔧 Manutenção Contínua

### Após cada deploy:
1. Verificar se as migrations foram aplicadas (se houver novas)
2. Testar login no painel administrativo
3. Verificar se os cadastros estão sendo salvos corretamente

### Backup:
- O Railway faz backup automático do PostgreSQL
- Exporte os dados periodicamente usando a função de exportação do painel

## ⚠️ Problemas Comuns

### Erro "NEXTAUTH_SECRET not found"
- Verifique se a variável está configurada como **Secret** (não variável normal)
- Gere um novo secret e atualize

### Erro ao fazer login
- Verifique se `ADMIN_USERNAME` e `ADMIN_PASSWORD` estão corretos
- Se já fez login antes, use a senha que você trocou (não a das variáveis)

### Cadastros não aparecem no painel
- Verifique se a API `/api/admin/people` está retornando dados
- Limpe o cache do navegador e recarregue

### Migration não aplicada
- Execute manualmente: `npx prisma migrate deploy` no terminal do Railway
- Ou configure como comando de deploy nas configurações

## 📞 Suporte

Se algo não estiver funcionando:
1. Verifique os logs no Railway (aba "Logs")
2. Verifique o console do navegador (F12)
3. Confirme que todas as variáveis de ambiente estão configuradas

---

**Status**: ✅ Sistema completo e funcional
**Última atualização**: Novembro 2025

