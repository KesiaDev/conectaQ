# Instruções de Deploy - Filtro de Período (Datas)

Este documento contém as instruções completas para fazer commit e deploy do filtro de período implementado na página de cadastros de visitantes.

## 📋 Resumo das Alterações

### Componentes Criados:
1. **`components/ui/popover.tsx`** - Componente Popover do ShadCN
2. **`components/ui/calendar.tsx`** - Componente Calendar do ShadCN
3. **`components/DateRangeFilter.tsx`** - Componente de filtro de datas com opções pré-definidas

### Arquivos Modificados:
1. **`app/admin/page.tsx`** - Integração do filtro de datas na página admin
2. **`app/api/admin/people/route.ts`** - Atualização da API para filtrar por data de criação

### Dependências Adicionadas:
- `react-day-picker` - Para seleção de datas
- `date-fns` - Para manipulação de datas
- `@radix-ui/react-popover` - Para o componente Popover

## 🚀 Passo a Passo para Deploy

### 1. Verificar Alterações

Antes de fazer commit, verifique se todas as alterações estão corretas:

```bash
git status
```

Você deve ver os seguintes arquivos:
- `components/ui/popover.tsx` (novo)
- `components/ui/calendar.tsx` (novo)
- `components/DateRangeFilter.tsx` (novo)
- `app/admin/page.tsx` (modificado)
- `app/api/admin/people/route.ts` (modificado)
- `package.json` (modificado - dependências)
- `package-lock.json` (modificado)

### 2. Testar Localmente (Opcional mas Recomendado)

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Gerar o Prisma Client
npm run prisma:generate

# Rodar em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:3000/admin` e teste o filtro de datas:
- Teste cada opção pré-definida (Hoje, Últimos 7 dias, etc.)
- Teste o intervalo personalizado
- Verifique se a lista atualiza corretamente
- Teste em conjunto com a busca e o filtro de batismo

### 3. Fazer Commit no Cursor

#### Opção A: Usando a Interface do Cursor

1. Abra o painel de Source Control no Cursor (Ctrl+Shift+G)
2. Revise todas as alterações
3. Adicione uma mensagem de commit descritiva:
   ```
   feat: adicionar filtro de período na página de cadastros de visitantes
   
   - Adiciona componente DateRangeFilter com opções pré-definidas
   - Integra filtro na página admin ao lado do filtro de batismo
   - Atualiza API para filtrar por createdAt (startDate/endDate)
   - Suporta: Hoje, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado e Intervalo personalizado
   - Exportações (Excel/PDF) também respeitam o filtro de data
   ```
4. Clique em "Commit"
5. Clique em "Sync Changes" ou "Push" para enviar ao repositório remoto

#### Opção B: Usando o Terminal

```bash
# Adicionar todos os arquivos
git add .

# Criar commit com mensagem descritiva
git commit -m "feat: adicionar filtro de período na página de cadastros de visitantes

- Adiciona componente DateRangeFilter com opções pré-definidas
- Integra filtro na página admin ao lado do filtro de batismo
- Atualiza API para filtrar por createdAt (startDate/endDate)
- Suporta: Hoje, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado e Intervalo personalizado
- Exportações (Excel/PDF) também respeitam o filtro de data"

# Fazer push para o repositório remoto
git push origin main
```

**Nota:** Substitua `main` pelo nome da sua branch principal se for diferente (ex: `master`, `develop`).

### 4. Deploy no Railway

O Railway geralmente faz deploy automático quando você faz push para a branch principal. Siga estes passos:

#### 4.1. Verificar Configuração do Railway

1. Acesse o dashboard do Railway: https://railway.app
2. Selecione seu projeto
3. Verifique se o repositório está conectado corretamente
4. Confirme que o "Auto Deploy" está ativado

#### 4.2. Monitorar o Deploy

1. Após fazer push, o Railway iniciará automaticamente um novo deploy
2. Acompanhe os logs em tempo real no dashboard do Railway
3. O deploy geralmente leva 2-5 minutos

#### 4.3. Verificar Build

Durante o build, o Railway executará:
```bash
npm run build
```

Este comando inclui:
- `prisma generate` (via postinstall script)
- `next build`

**Importante:** Certifique-se de que a variável de ambiente `DATABASE_URL` está configurada no Railway.

### 5. Verificar Deploy no Railway

Após o deploy concluir:

1. **Acesse a aplicação no Railway**
   - Use a URL fornecida pelo Railway (ex: `seu-app.railway.app`)

2. **Teste o Filtro de Datas:**
   - Acesse `/admin`
   - Verifique se o filtro de período aparece ao lado do filtro "Todos"
   - Teste cada opção:
     - ✅ Hoje
     - ✅ Últimos 7 dias
     - ✅ Últimos 30 dias
     - ✅ Este mês
     - ✅ Mês passado
     - ✅ Intervalo personalizado
   - Verifique se a lista atualiza automaticamente
   - Teste em conjunto com a busca e filtro de batismo
   - Teste as exportações (Excel/PDF) com filtro ativo

3. **Verificar Timezone:**
   - O código usa UTC para garantir consistência
   - As datas são normalizadas para início/fim do dia em UTC
   - Teste com diferentes períodos para garantir que funciona corretamente

### 6. Troubleshooting

#### Problema: Build falha no Railway

**Solução:**
- Verifique os logs do Railway para erros específicos
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se o `DATABASE_URL` está configurado

#### Problema: Filtro não aparece na página

**Solução:**
- Verifique o console do navegador para erros
- Confirme que os componentes foram criados corretamente
- Verifique se o import está correto: `import { DateRangeFilter } from "@/components/DateRangeFilter"`

#### Problema: Filtro não funciona (não filtra dados)

**Solução:**
- Verifique os logs da API no Railway
- Confirme que os parâmetros `startDate` e `endDate` estão sendo enviados
- Verifique se o Prisma está filtrando corretamente
- Teste a API diretamente: `/api/admin/people?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z`

#### Problema: Timezone incorreto

**Solução:**
- O código usa UTC para normalização
- As datas são convertidas para início/fim do dia em UTC
- Se necessário, ajuste o timezone no código da API

### 7. Estrutura Final dos Arquivos

```
conectaQ/
├── components/
│   ├── ui/
│   │   ├── calendar.tsx          (NOVO)
│   │   ├── popover.tsx           (NOVO)
│   │   └── ...
│   └── DateRangeFilter.tsx       (NOVO)
├── app/
│   ├── admin/
│   │   └── page.tsx              (MODIFICADO)
│   └── api/
│       └── admin/
│           └── people/
│               └── route.ts      (MODIFICADO)
└── package.json                  (MODIFICADO)
```

## ✅ Checklist de Deploy

Antes de considerar o deploy completo, verifique:

- [ ] Todos os arquivos foram commitados
- [ ] Push foi feito para o repositório remoto
- [ ] Railway iniciou o deploy automaticamente
- [ ] Build foi concluído com sucesso
- [ ] Aplicação está acessível no Railway
- [ ] Filtro de período aparece na página admin
- [ ] Todas as opções de filtro funcionam
- [ ] Lista atualiza automaticamente ao mudar filtro
- [ ] Filtro funciona em conjunto com busca e filtro de batismo
- [ ] Exportações (Excel/PDF) respeitam o filtro de data
- [ ] Timezone está correto (UTC)

## 📝 Notas Importantes

1. **Timezone:** O código usa UTC para garantir consistência entre diferentes ambientes. As datas são normalizadas para início (00:00:00) e fim (23:59:59.999) do dia em UTC.

2. **Performance:** O filtro de data é aplicado no banco de dados (Prisma), garantindo boa performance mesmo com muitos registros.

3. **Compatibilidade:** O filtro funciona perfeitamente com os filtros existentes (busca e batismo) e com a paginação.

4. **Exportações:** As exportações para Excel e PDF também respeitam o filtro de data aplicado.

## 🎉 Conclusão

Após seguir todos os passos acima, o filtro de período estará funcionando em produção no Railway. Se encontrar algum problema, consulte a seção de Troubleshooting ou verifique os logs do Railway.

