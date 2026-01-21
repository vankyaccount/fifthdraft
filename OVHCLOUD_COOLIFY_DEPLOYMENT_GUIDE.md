# 🚀 OVHcloud + Coolify Deployment Guide for Fifth Draft

**Setup Date:** January 20, 2026
**Stack:** OVHcloud VPS + Coolify + PostgreSQL + Docker

---

## Overview

This guide walks you through deploying Fifth Draft on OVHcloud VPS using Coolify for container orchestration and data management on the same VPS.

### Architecture
```
OVHcloud VPS
├── Docker (Container Runtime)
├── Coolify (Deployment & Management)
├── Fifth Draft (Next.js App)
├── PostgreSQL (Database)
└── Nginx (Reverse Proxy)
```

---

## Part 1: OVHcloud VPS Setup

### Step 1.1: Create OVHcloud VPS Instance

1. Go to [ovh.com](https://www.ovh.com)
2. Log in to your OVH account
3. Navigate to **Public Cloud** → **Instances**
4. Click **Create Instance**
5. Configure:
   - **Region:** Choose closest to your users (EU, US, Asia)
   - **Image:** Ubuntu 24.04 LTS (Recommended)
   - **Instance Type:** Start with `B2-4` (4 vCPU, 8GB RAM, ~€15/month)
     - Minimum: `B2-4` (handles app + database)
     - For production: `B3-8` (8 vCPU, 16GB RAM, ~€30/month)
   - **Storage:** 80GB minimum (for app + database backups)
   - **SSH Key:** Create or use existing SSH key
   - **Name:** `fifth-draft-prod`

6. Click **Create Instance**
7. Wait for instance to be active (2-3 minutes)

### Step 1.2: Access Your VPS

```bash
# Find your IP from OVH Dashboard, then SSH:
ssh root@YOUR_VPS_IP

# Example:
ssh root@192.0.2.42
```

### Step 1.3: Initial Server Security

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git htop net-tools vim

# Configure UFW Firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Next.js dev (temporary)
sudo ufw status

# Create non-root user (optional but recommended)
sudo useradd -m -s /bin/bash deployer
sudo usermod -aG sudo deployer
sudo passwd deployer

# Copy SSH key to new user
mkdir -p /home/deployer/.ssh
cp /root/.ssh/authorized_keys /home/deployer/.ssh/
chown -R deployer:deployer /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys
```

---

## Part 2: Docker & Docker Compose Installation

### Step 2.1: Install Docker

```bash
# Add Docker repository
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Enable Docker to run without sudo (optional)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker run hello-world
```

### Step 2.2: Install Docker Compose

```bash
# Download latest Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

---

## Part 3: Coolify Installation

### Step 3.1: Install Coolify

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Run Coolify installation script
curl -fsSL https://get.coolify.io/install.sh | bash

# This will:
# - Install Docker & Docker Compose
# - Set up Coolify dashboard
# - Configure automatic SSL certificates
# - Create necessary directories

# After installation completes, note the URL and credentials shown
```

### Step 3.2: Access Coolify Dashboard

1. Open browser: `https://YOUR_VPS_IP:443` (or http://YOUR_VPS_IP:3000 initially)
2. Complete initial setup:
   - Set admin email
   - Set admin password
   - Configure instance name
3. Add your domain (you can do this later)

### Step 3.3: Configure Coolify Settings

In Coolify Dashboard:

1. **Settings** → **Notifications** (optional)
   - Add email for deployment alerts

2. **Settings** → **Docker**
   - Verify Docker is connected
   - Check resource limits

3. **Settings** → **SSL**
   - Enable automatic SSL (Let's Encrypt)
   - Add your domain

---

## Part 4: PostgreSQL Database Setup

### Step 4.1: Deploy PostgreSQL via Coolify

1. In Coolify Dashboard → **Services**
2. Click **+ New Service**
3. Select **PostgreSQL** from templates
4. Configure:
   - **Name:** `fifth-draft-db`
   - **PostgreSQL Version:** 16 (latest)
   - **Root Password:** Generate strong password (save it!)
   - **Database Name:** `fifth_draft`
   - **Database User:** `fifth_draft_user`
   - **Database Password:** Generate strong password (save it!)
   - **Storage:** 20GB minimum
5. Click **Deploy**
6. Wait for service to start (1-2 minutes)

### Step 4.2: Get Database Connection Details

In Coolify Dashboard:
1. Find PostgreSQL service
2. Note the connection details:
   ```
   Host: localhost (or container IP)
   Port: 5432
   Database: fifth_draft
   User: fifth_draft_user
   Password: YOUR_PASSWORD
   ```

### Step 4.3: Connect to Database & Run Migrations

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Install PostgreSQL client
sudo apt install -y postgresql-client

# Connect to database
psql -h localhost -U fifth_draft_user -d fifth_draft -p 5432

# In psql prompt (password will be asked):
# Run all migration files from your project
\i /path/to/migrations/00001_initial_schema.sql
\i /path/to/migrations/00002_rls_policies.sql
# ... run all 14 migrations

# Verify tables created
\dt

# Exit
\q
```

Alternatively, use Coolify's database GUI:
1. In Coolify → PostgreSQL service → **Database GUI (pgAdmin)**
2. Connect and run migrations through UI

---

## Part 5: GitHub Repository Setup

### Step 5.1: Prepare Repository

Before deploying, ensure your repository is ready:

```bash
# From your local machine
cd "d:\Project\Fifth Draft"

# Initialize git if not already done
git init
git add .
git commit -m "Ready for OVHcloud + Coolify deployment"

# Add remote (GitHub, GitLab, or private git)
git remote add origin https://github.com/YOUR_USERNAME/fifth-draft.git
git branch -M main
git push -u origin main
```

### Step 5.2: Create .dockerignore and Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install production dependencies only
RUN npm ci --omit=dev

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start app
CMD ["npm", "start"]
```

Create `.dockerignore`:

```
node_modules
npm-debug.log
.next
.git
.gitignore
README.md
.env.local
.env.*.local
```

Commit these files:

```bash
git add Dockerfile .dockerignore
git commit -m "Add Docker configuration"
git push
```

---

## Part 6: Deploy Fifth Draft via Coolify

### Step 6.1: Add Application in Coolify

1. In Coolify Dashboard → **Applications**
2. Click **+ New Application**
3. Select **Git Repository**
4. Configure:
   - **Name:** `fifth-draft`
   - **Git URL:** `https://github.com/YOUR_USERNAME/fifth-draft.git`
   - **Branch:** `main`
   - **Build Type:** `Dockerfile` (or select Next.js if available)
   - **Port:** `3000`

### Step 6.2: Add Environment Variables

In Coolify Application Settings → **Environment Variables**, add:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://www.yourdomain.com
NODE_ENV=production

# Database (PostgreSQL on same VPS)
DATABASE_URL=postgresql://fifth_draft_user:YOUR_PASSWORD@localhost:5432/fifth_draft

# Supabase (if still using)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI (Transcription)
OPENAI_API_KEY=sk-...

# Stripe (Payment)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...

# Resend (Email)
RESEND_API_KEY=re_...
EMAIL_FROM=FifthDraft <noreply@yourdomain.com>

# AI Services
TAVILY_API_KEY=tvly_...
ANTHROPIC_API_KEY=sk-ant-...
```

### Step 6.3: Deploy Application

1. In Coolify → Fifth Draft Application
2. Click **Deploy**
3. Monitor deployment logs:
   - Building Docker image
   - Installing dependencies
   - Building Next.js
   - Starting container
4. Wait for deployment to complete (5-10 minutes)

### Step 6.4: Verify Deployment

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Check running containers
docker ps

# Check logs
docker logs fifth-draft

# Test application
curl http://localhost:3000
```

---

## Part 7: Domain & SSL Configuration

### Step 7.1: Point Domain to VPS IP

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Update DNS A record:
   ```
   Type: A
   Name: @
   Value: YOUR_VPS_IP
   TTL: 300
   ```
3. Update www subdomain:
   ```
   Type: A
   Name: www
   Value: YOUR_VPS_IP
   TTL: 300
   ```
4. Wait for DNS propagation (5-30 minutes)

### Step 7.2: Add Domain to Coolify

1. In Coolify → Application Settings → **Domains**
2. Click **+ Add Domain**
3. Enter: `yourdomain.com`
4. Also add: `www.yourdomain.com`
5. Enable **Auto SSL with Let's Encrypt**
6. Save

### Step 7.3: Verify SSL Certificate

```bash
# Wait 2-3 minutes for Let's Encrypt to generate cert
# Then test:
curl -I https://www.yourdomain.com

# Should show:
# HTTP/2 200
# server: nginx
# ... ssl certificate info
```

---

## Part 8: Reverse Proxy & Nginx Configuration

Coolify automatically configures Nginx, but verify:

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Check Nginx configuration
docker exec $(docker ps -q -f "name=nginx") nginx -t

# Reload if needed
docker exec $(docker ps -q -f "name=nginx") nginx -s reload
```

---

## Part 9: Database Backup Strategy

### Step 9.1: Automated Backups

Create backup script (`/root/backup-db.sh`):

```bash
#!/bin/bash

BACKUP_DIR="/backups"
DB_USER="fifth_draft_user"
DB_NAME="fifth_draft"
DB_HOST="localhost"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD="YOUR_PASSWORD" pg_dump \
  -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  -F custom \
  -f "$BACKUP_DIR/fifth_draft_backup_$TIMESTAMP.dump"

# Keep only last 7 days
find $BACKUP_DIR -name "fifth_draft_backup_*.dump" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/fifth_draft_backup_$TIMESTAMP.dump"
```

Setup cron job:

```bash
sudo chmod +x /root/backup-db.sh

# Edit crontab
sudo crontab -e

# Add this line (backup daily at 2 AM):
0 2 * * * /root/backup-db.sh
```

### Step 9.2: Manual Backup

```bash
# Create backup
docker exec $(docker ps -q -f "name=postgres") \
  pg_dump -U fifth_draft_user -d fifth_draft > backup.sql

# Copy to local machine
scp root@YOUR_VPS_IP:backup.sql ./backup.sql
```

---

## Part 10: Monitoring & Maintenance

### Step 10.1: Enable Coolify Monitoring

In Coolify Dashboard:

1. **Settings** → **Notifications** → Enable email alerts
2. **Monitoring** → View resource usage
3. Set alerts for:
   - High CPU (>80%)
   - High memory (>80%)
   - Disk space (>85%)

### Step 10.2: Check Application Health

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Check application status
curl https://www.yourdomain.com/api/health

# View application logs
docker logs -f $(docker ps -q -f "name=fifth-draft")

# Check database connection
docker exec $(docker ps -q -f "name=postgres") \
  psql -U fifth_draft_user -d fifth_draft -c "SELECT NOW();"
```

### Step 10.3: Regular Maintenance

- **Weekly:** Check logs for errors
- **Monthly:** Review resource usage
- **Quarterly:** Test database backups
- **Annual:** Plan capacity upgrades if needed

---

## Part 11: Stripe Webhook Configuration

### Step 11.1: Update Webhook URL

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Update webhook endpoint:
   ```
   https://www.yourdomain.com/api/webhooks/stripe
   ```
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
4. Copy signing secret
5. Update in Coolify environment variables: `STRIPE_WEBHOOK_SECRET`

---

## Part 12: Post-Deployment Testing Checklist

- [ ] Domain resolves to VPS
- [ ] HTTPS certificate is valid
- [ ] Homepage loads without errors
- [ ] Sign up flow works
- [ ] Login/logout works
- [ ] Record audio (browser audio)
- [ ] Transcription completes
- [ ] Payment page loads (Stripe)
- [ ] Test payment with card: `4242 4242 4242 4242`
- [ ] Profile updates to Pro tier after payment
- [ ] Dashboard displays user notes
- [ ] Settings page loads
- [ ] Forgot password email arrives
- [ ] API health check passes
- [ ] Logs are clean (no errors)

---

## Part 13: Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs fifth-draft

# Common issues:
# - Missing environment variables: Check Coolify env vars
# - Port already in use: Check UFW rules
# - Out of memory: Increase VPS size
```

### Database Connection Error

```bash
# Test connection
psql -h localhost -U fifth_draft_user -d fifth_draft

# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker restart $(docker ps -q -f "name=postgres")
```

### SSL Certificate Issues

```bash
# Check certificate
curl -I https://www.yourdomain.com

# Renew manually (if needed)
docker exec $(docker ps -q -f "name=nginx") \
  certbot renew --force-renewal
```

### High Memory Usage

```bash
# Check memory
free -h

# Check container stats
docker stats

# Options:
# 1. Increase VPS size
# 2. Optimize app (reduce dependencies)
# 3. Add swap space
```

---

## Part 14: Cost Breakdown (Estimated Monthly)

| Component | Provider | Plan | Cost |
|-----------|----------|------|------|
| VPS (4 vCPU, 8GB RAM) | OVHcloud | B2-4 | €15 |
| Domain | Various | .com | €10-15 |
| Email (Resend) | Resend | Starter | Free-$20 |
| OpenAI (Transcription) | OpenAI | Pay-as-you-go | $0-50 |
| Stripe | Stripe | 2.9% + $0.30 | % of revenue |
| **Total** | | | **€25-100+** |

---

## Part 15: Scaling Options (Future)

As your app grows:

1. **Option A: Increase VPS Size**
   - Upgrade to B3-8 (€30/month)
   - Vertical scaling

2. **Option B: Separate Database VPS**
   - Move PostgreSQL to dedicated VPS
   - Improve performance
   - Dedicated backups

3. **Option C: Add Redis Cache**
   - Deploy Redis service in Coolify
   - Cache session data
   - Reduce database load

4. **Option D: Load Balancer**
   - Deploy multiple app instances
   - Use Nginx load balancing
   - Horizontal scaling

---

## Summary

You now have:
✅ Fifth Draft running on OVHcloud VPS
✅ Coolify managing deployments
✅ PostgreSQL database on same VPS
✅ Automatic SSL certificates
✅ Custom domain
✅ Automated backups
✅ Monitoring & alerts

Your application is production-ready!

---

## Support & Next Steps

1. **Monitor Deployment:** Check Coolify dashboard daily for first week
2. **Collect Feedback:** Monitor user signups and issues
3. **Optimize:** Profile app performance and database queries
4. **Scale:** Add caching or database replicas as needed

**Good luck with your launch! 🚀**
