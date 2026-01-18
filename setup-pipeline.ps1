# CI/CD Pipeline Setup Script for Windows PowerShell
# This script helps configure the Build & Deploy Pipeline

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Build & Deploy Pipeline Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is installed
$ghInstalled = $null -ne (Get-Command gh -ErrorAction SilentlyContinue)
if (-not $ghInstalled) {
    Write-Host "❌ GitHub CLI not found. Please install it from https://cli.github.com/" -ForegroundColor Red
    exit 1
}

# Check authentication
$authCheck = gh auth status 2>&1
if ($authCheck -match "not logged in") {
    Write-Host "❌ Not authenticated with GitHub. Please run: gh auth login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ GitHub CLI is configured" -ForegroundColor Green
Write-Host ""

# Get repository info
$repo = gh repo view --json nameWithOwner -q
Write-Host "📦 Repository: $repo" -ForegroundColor Yellow
Write-Host ""

# Menu
Write-Host "Select setup option:" -ForegroundColor Cyan
Write-Host "1) Add deployment secrets (SSH keys, hosts)" -ForegroundColor White
Write-Host "2) Configure GitHub Environments (Manual)" -ForegroundColor White
Write-Host "3) Verify workflow file" -ForegroundColor White
Write-Host "4) View workflow status" -ForegroundColor White
Write-Host "5) Exit" -ForegroundColor White
Write-Host ""

$option = Read-Host "Enter option (1-5)"

switch ($option) {
    "1" {
        Write-Host ""
        Write-Host "🔐 Adding Deployment Secrets" -ForegroundColor Cyan
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You'll need to add these secrets to GitHub:" -ForegroundColor Yellow
        Write-Host ""
        
        $keyPath = Read-Host "Enter SSH Private Key file path (e.g., C:\Users\YourName\.ssh\id_rsa)"
        if (Test-Path $keyPath) {
            Write-Host "Adding DEPLOY_KEY secret..." -ForegroundColor Yellow
            Get-Content $keyPath | gh secret set DEPLOY_KEY
            Write-Host "✅ DEPLOY_KEY added" -ForegroundColor Green
        } else {
            Write-Host "❌ SSH key file not found" -ForegroundColor Red
        }
        Write-Host ""
        
        $stagingHost = Read-Host "Enter Staging deployment host (user@host)"
        gh secret set STAGING_HOST --body $stagingHost
        Write-Host "✅ STAGING_HOST added" -ForegroundColor Green
        Write-Host ""
        
        $prodHost = Read-Host "Enter Production deployment host (user@host)"
        gh secret set PROD_HOST --body $prodHost
        Write-Host "✅ PROD_HOST added" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        Write-Host "🌍 Configuring GitHub Environments" -ForegroundColor Cyan
        Write-Host "====================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  Please manually create environments in GitHub:" -ForegroundColor Yellow
        Write-Host "   1. Go to Settings > Environments" -ForegroundColor White
        Write-Host "   2. Create 'staging' environment with URL: https://staging.example.com" -ForegroundColor White
        Write-Host "   3. Create 'production' environment with URL: https://example.com" -ForegroundColor White
        Write-Host ""
        Write-Host "Once environments are created, you can add protection rules:" -ForegroundColor Yellow
        Write-Host "   - Required reviewers" -ForegroundColor White
        Write-Host "   - Deployment branches" -ForegroundColor White
    }
    
    "3" {
        Write-Host ""
        Write-Host "📋 Verifying Workflow File" -ForegroundColor Cyan
        Write-Host "===========================" -ForegroundColor Cyan
        Write-Host ""
        
        if (Test-Path ".github/workflows/deploy.yml") {
            Write-Host "✅ Workflow file found: .github/workflows/deploy.yml" -ForegroundColor Green
            Write-Host ""
            Write-Host "Workflow configuration:" -ForegroundColor Yellow
            $content = Get-Content .github/workflows/deploy.yml -Raw
            
            if ($content -match "name:\s*(.+)") {
                Write-Host "Name: $($matches[1])" -ForegroundColor White
            }
            
            Write-Host ""
            Write-Host "Jobs defined:" -ForegroundColor Yellow
            if ($content -match "jobs:") {
                $jobs = $content | Select-String -Pattern "^\s+\w+:" | ForEach-Object { $_.Line.Trim().TrimEnd(':') }
                $jobs | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
            }
        } else {
            Write-Host "❌ Workflow file not found" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "📊 Workflow Status" -ForegroundColor Cyan
        Write-Host "===================" -ForegroundColor Cyan
        Write-Host ""
        gh run list --workflow deploy.yml --limit 5
    }
    
    "5" {
        Write-Host "👋 Exiting..." -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Commit and push changes:" -ForegroundColor White
Write-Host "   git add .github/workflows/deploy.yml DEPLOY_PIPELINE.md" -ForegroundColor White
Write-Host "   git commit -m 'Add Build & Deploy Pipeline'" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "2. The pipeline will run automatically on push to main or develop branches" -ForegroundColor White
Write-Host ""
Write-Host "3. Monitor progress in GitHub Actions:" -ForegroundColor White
Write-Host "   https://github.com/$repo/actions" -ForegroundColor Cyan
Write-Host ""
