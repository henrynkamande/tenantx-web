#!/bin/bash

# TenantX Free Deployment Script
# This script helps you deploy TenantX to free hosting platforms

echo "🚀 TenantX Free Deployment Helper"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the TenantX project root"
    exit 1
fi

echo "📋 Choose your deployment platform:"
echo "1. Vercel + MongoDB Atlas (Recommended)"
echo "2. Railway (All-in-one)"
echo "3. Netlify + MongoDB Atlas"
echo "4. Setup environment only"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🔧 Setting up for Vercel deployment..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Create environment file template
        if [ ! -f ".env" ]; then
            echo "📝 Creating environment template..."
            cat > .env << EOF
# MongoDB Atlas connection (get from https://cloud.mongodb.com)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tenantx?retryWrites=true&w=majority

# JWT Secrets (generate secure 32+ character strings)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Email configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Public URL (will be provided by Vercel)
NUXT_PUBLIC_APP_URL=https://your-app.vercel.app
EOF
            echo "✅ Environment file created at .env"
            echo "⚠️  IMPORTANT: Update the MONGODB_URI with your Atlas connection string"
        fi
        
        echo ""
        echo "📋 Next steps:"
        echo "1. Set up MongoDB Atlas (free M0 cluster): https://cloud.mongodb.com"
        echo "2. Update MONGODB_URI in .env file"
        echo "3. Run: vercel"
        echo "4. Add environment variables in Vercel dashboard"
        echo ""
        
        read -p "Ready to deploy to Vercel? (y/n): " deploy
        if [ "$deploy" = "y" ]; then
            echo "🚀 Deploying to Vercel..."
            vercel
        fi
        ;;
        
    2)
        echo "🔧 Setting up for Railway deployment..."
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        
        # Create railway.json for MongoDB
        if [ ! -f "railway.json" ]; then
            cat > railway.json << EOF
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
EOF
            echo "✅ Railway configuration created"
        fi
        
        echo ""
        echo "📋 Next steps:"
        echo "1. Run: railway login"
        echo "2. Run: railway deploy"
        echo "3. Add MongoDB plugin in Railway dashboard"
        echo "4. Set environment variables in Railway dashboard"
        echo ""
        ;;
        
    3)
        echo "🔧 Setting up for Netlify deployment..."
        
        # Create netlify.toml
        if [ ! -f "netlify.toml" ]; then
            cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = ".output/public"

[functions]
  directory = ".output/server"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
EOF
            echo "✅ Netlify configuration created"
        fi
        
        echo ""
        echo "📋 Next steps:"
        echo "1. Connect your GitHub repo to Netlify"
        echo "2. Set up MongoDB Atlas (free M0 cluster)"
        echo "3. Add environment variables in Netlify dashboard"
        echo "4. Deploy from Netlify dashboard"
        echo ""
        ;;
        
    4)
        echo "📝 Setting up environment variables only..."
        
        if [ ! -f ".env" ]; then
            cat > .env << EOF
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tenantx

# JWT Secrets (32+ characters each)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application URL
NUXT_PUBLIC_APP_URL=http://localhost:3000
EOF
            echo "✅ Environment template created at .env"
            echo "⚠️  Remember to update the values before deployment"
        else
            echo "⚠️  .env file already exists"
        fi
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📚 Additional Resources:"
echo "• MongoDB Atlas Setup: https://docs.atlas.mongodb.com/getting-started/"
echo "• Vercel Documentation: https://vercel.com/docs"
echo "• Free Hosting Guide: ./FREE_HOSTING_OPTIONS.md"
echo ""
echo "🎉 Happy deploying!"
