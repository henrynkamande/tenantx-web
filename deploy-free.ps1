# TenantX Free Deployment Script (PowerShell)
# This script helps you deploy TenantX to free hosting platforms

Write-Host "🚀 TenantX Free Deployment Helper" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the TenantX project root" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Choose your deployment platform:" -ForegroundColor Yellow
Write-Host "1. Vercel + MongoDB Atlas (Recommended)"
Write-Host "2. Railway (All-in-one)"
Write-Host "3. Setup environment only"
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    1 {
        Write-Host "🔧 Setting up for Vercel deployment..." -ForegroundColor Blue
        
        # Check if Vercel CLI is installed
        try {
            vercel --version | Out-Null
        } catch {
            Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        # Create environment file template
        if (-not (Test-Path ".env")) {
            Write-Host "📝 Creating environment template..." -ForegroundColor Yellow
            
            # Generate secure secrets
            $jwtSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
            $jwtRefreshSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
            
            $envContent = @"
# MongoDB Atlas connection (get from https://cloud.mongodb.com)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tenantx?retryWrites=true&w=majority

# JWT Secrets (generate secure 32+ character strings)
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefreshSecret

# Email configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Public URL (will be provided by Vercel)
NUXT_PUBLIC_APP_URL=https://your-app.vercel.app
"@
            $envContent | Out-File -FilePath ".env" -Encoding utf8
            Write-Host "✅ Environment file created at .env" -ForegroundColor Green
            Write-Host "⚠️  IMPORTANT: Update the MONGODB_URI with your Atlas connection string" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Set up MongoDB Atlas (free M0 cluster): https://cloud.mongodb.com"
        Write-Host "2. Update MONGODB_URI in .env file"
        Write-Host "3. Run: vercel"
        Write-Host "4. Add environment variables in Vercel dashboard"
        Write-Host ""
        
        $deploy = Read-Host "Ready to deploy to Vercel? (y/n)"
        if ($deploy -eq "y") {
            Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
            vercel
        }
    }
    
    2 {
        Write-Host "🔧 Setting up for Railway deployment..." -ForegroundColor Blue
        
        # Check if Railway CLI is installed
        try {
            railway --version | Out-Null
        } catch {
            Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
            npm install -g @railway/cli
        }
        
        # Create railway.json
        if (-not (Test-Path "railway.json")) {
            $railwayConfig = @"
{
  "`$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
"@
            $railwayConfig | Out-File -FilePath "railway.json" -Encoding utf8
            Write-Host "✅ Railway configuration created" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Run: railway login"
        Write-Host "2. Run: railway deploy"
        Write-Host "3. Add MongoDB plugin in Railway dashboard"
        Write-Host "4. Set environment variables in Railway dashboard"
        Write-Host ""
    }
    
    3 {
        Write-Host "📝 Setting up environment variables only..." -ForegroundColor Blue
        
        if (-not (Test-Path ".env")) {
            # Generate secure secrets
            $jwtSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
            $jwtRefreshSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
            
            $envContent = @"
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tenantx

# JWT Secrets (32+ characters each)
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefreshSecret

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application URL
NUXT_PUBLIC_APP_URL=http://localhost:3000
"@
            $envContent | Out-File -FilePath ".env" -Encoding utf8
            Write-Host "✅ Environment template created at .env" -ForegroundColor Green
            Write-Host "⚠️  Remember to update the values before deployment" -ForegroundColor Yellow
        } else {
            Write-Host "⚠️  .env file already exists" -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📚 Additional Resources:" -ForegroundColor Cyan
Write-Host "• MongoDB Atlas Setup: https://docs.atlas.mongodb.com/getting-started/"
Write-Host "• Vercel Documentation: https://vercel.com/docs"
Write-Host "• Free Hosting Guide: ./FREE_HOSTING_OPTIONS.md"
Write-Host ""
Write-Host "🎉 Happy deploying!" -ForegroundColor Green
