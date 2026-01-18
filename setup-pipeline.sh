#!/bin/bash

# CI/CD Pipeline Setup Script
# This script helps configure the Build & Deploy Pipeline

echo "================================"
echo "Build & Deploy Pipeline Setup"
echo "================================"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it from https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is configured"
echo ""

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q)
echo "📦 Repository: $REPO"
echo ""

# Menu
echo "Select setup option:"
echo "1) Add deployment secrets (SSH keys, hosts)"
echo "2) Configure GitHub Environments"
echo "3) Verify workflow file"
echo "4) View workflow status"
echo "5) Exit"
echo ""
read -p "Enter option (1-5): " OPTION

case $OPTION in
    1)
        echo ""
        echo "🔐 Adding Deployment Secrets"
        echo "================================"
        echo ""
        echo "You'll need to add these secrets to GitHub:"
        echo ""
        read -p "Enter SSH Private Key file path (e.g., ~/.ssh/id_rsa): " KEY_PATH
        if [ -f "$KEY_PATH" ]; then
            echo "Adding DEPLOY_KEY secret..."
            gh secret set DEPLOY_KEY < "$KEY_PATH"
            echo "✅ DEPLOY_KEY added"
        else
            echo "❌ SSH key file not found"
        fi
        echo ""
        read -p "Enter Staging deployment host (user@host): " STAGING_HOST
        gh secret set STAGING_HOST --body "$STAGING_HOST"
        echo "✅ STAGING_HOST added"
        echo ""
        read -p "Enter Production deployment host (user@host): " PROD_HOST
        gh secret set PROD_HOST --body "$PROD_HOST"
        echo "✅ PROD_HOST added"
        ;;
    2)
        echo ""
        echo "🌍 Configuring GitHub Environments"
        echo "====================================="
        echo ""
        echo "Creating 'staging' environment..."
        read -p "Enter Staging URL (default: https://staging.example.com): " STAGING_URL
        STAGING_URL=${STAGING_URL:-https://staging.example.com}
        # Note: GitHub CLI doesn't support environment creation yet, manual setup required
        echo "⚠️  Please manually create environments in GitHub:"
        echo "   1. Go to Settings > Environments"
        echo "   2. Create 'staging' environment with URL: $STAGING_URL"
        echo "   3. Create 'production' environment with URL: https://example.com"
        echo ""
        echo "Once environments are created, you can add protection rules:"
        echo "   - Required reviewers"
        echo "   - Deployment branches"
        ;;
    3)
        echo ""
        echo "📋 Verifying Workflow File"
        echo "============================="
        echo ""
        if [ -f ".github/workflows/deploy.yml" ]; then
            echo "✅ Workflow file found: .github/workflows/deploy.yml"
            echo ""
            echo "Workflow configuration:"
            grep "name:" .github/workflows/deploy.yml
            grep "on:" -A 2 .github/workflows/deploy.yml
            grep "jobs:" -A 5 .github/workflows/deploy.yml | head -20
        else
            echo "❌ Workflow file not found"
        fi
        ;;
    4)
        echo ""
        echo "📊 Workflow Status"
        echo "===================="
        echo ""
        gh run list --workflow deploy.yml --limit 5
        ;;
    5)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Commit and push changes:"
echo "   git add .github/workflows/deploy.yml DEPLOY_PIPELINE.md"
echo "   git commit -m 'Add Build & Deploy Pipeline'"
echo "   git push origin main"
echo ""
echo "2. The pipeline will run automatically on push to main or develop branches"
echo ""
echo "3. Monitor progress in GitHub Actions:"
echo "   https://github.com/$REPO/actions"
echo ""
