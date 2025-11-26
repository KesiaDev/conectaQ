# Script para rodar migration no Railway pelo PowerShell
# Execute este script no PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration do Banco de Dados Railway" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar a DATABASE_URL
Write-Host "Por favor, cole a DATABASE_URL do Railway:" -ForegroundColor Yellow
Write-Host "(Você encontra em: Railway -> PostgreSQL -> Variables -> DATABASE_URL)" -ForegroundColor Gray
Write-Host ""
$databaseUrl = Read-Host "DATABASE_URL"

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "ERRO: DATABASE_URL não pode estar vazia!" -ForegroundColor Red
    exit 1
}

# Configurar variável de ambiente para esta sessão
$env:DATABASE_URL = $databaseUrl

Write-Host ""
Write-Host "DATABASE_URL configurada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Rodando migration..." -ForegroundColor Yellow
Write-Host ""

# Rodar a migration
try {
    npx prisma migrate deploy
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Migration aplicada com sucesso!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora você pode fazer login em:" -ForegroundColor Cyan
    Write-Host "https://conectaq-production.up.railway.app/login" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "ERRO ao rodar migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}


