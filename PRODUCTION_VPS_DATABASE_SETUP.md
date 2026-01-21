# FifthDraft - Production VPS & Self-Hosted Database Setup Guide

## Executive Summary

This document outlines the strategy to move FifthDraft from Supabase-only architecture to a self-hosted PostgreSQL database on a dedicated VPS. This ensures:

1. **Cost optimization** - Reduced per-user database costs at scale
2. **Data sovereignty** - Complete control over user data
3. **Compliance flexibility** - GDPR, CCPA, and custom data residency requirements
4. **Performance control** - Dedicated database resources
5. **Independence** - Reduced reliance on third-party providers

---

## 1. ARCHITECTURE OVERVIEW

### Current Architecture (Dev/Test)
```
┌─────────────────┐
│ Frontend (Next.js)
│ localhost:3000
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
    ┌────▼─────┐         ┌──────▼──────┐
    │ Supabase  │         │ Auth0/Custom│
    │ PostgreSQL│         │ Auth Service│
    └──────────┘         └─────────────┘
```

### Target Architecture (Production)
```
┌──────────────────────────────────────────────────────────────┐
│                     VPS Server                              │
│  (DigitalOcean/Linode/AWS/OVH - 4GB RAM, 2 vCPU minimum)  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Docker Container 1: PostgreSQL 15                    │ │
│  │ - Port: 5432 (internal only)                         │ │
│  │ - Volume: /data/postgres (persistent)                │ │
│  │ - Backups: Daily automated to S3/Object Storage      │ │
│  │ - Monitoring: pg_stat_statements, Prometheus         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Docker Container 2: Redis (Cache/Sessions)           │ │
│  │ - Port: 6379 (internal only)                         │ │
│  │ - Volume: /data/redis (persistent)                   │ │
│  │ - TTL: Session persistence                           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Docker Container 3: pgAdmin (Admin Interface)         │ │
│  │ - Port: 5050 (restricted access)                     │ │
│  │ - Access: SSH tunnel or VPN only                     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Nginx/Reverse Proxy                                 │ │
│  │ - SSL/TLS termination                               │ │
│  │ - Rate limiting                                      │ │
│  │ - DDoS protection                                    │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
         │
         │ HTTPS
         │
    ┌────▼─────────────────────────────────┐
    │ Cloudflare CDN (Optional)             │
    │ - DDoS protection                     │
    │ - Caching layer                       │
    │ - SSL/TLS management                  │
    └───────────────────────────────────────┘
         │
         │
    ┌────▼─────────────────────────────────┐
    │ Client (Browser)                      │
    │ - Next.js Frontend                    │
    └───────────────────────────────────────┘

Side Services:
┌──────────────────────────────────────────────────────────────┐
│ AWS S3 / OVH Object Storage                                 │
│ - Audio file storage (encrypted)                            │
│ - Backup storage                                            │
│ - Database snapshots                                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SendGrid / Mailgun / AWS SES                                │
│ - Email delivery service                                    │
│ - Verification emails                                       │
│ - Password reset emails                                     │
│ - Invoices & receipts                                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Stripe (Payment Processing)                                 │
│ - Webhook handling on VPS                                   │
│ - Subscription management                                   │
│ - Invoice generation                                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Monitoring & Logging                                        │
│ - Prometheus + Grafana (on VPS or external)                │
│ - ELK Stack / Datadog / New Relic                           │
│ - Error tracking (Sentry)                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. VPS PROVIDER SELECTION

### Recommended Providers (in priority order)

#### 1. DigitalOcean (Recommended for most use cases)
**Pros**:
- Simple, intuitive interface
- Excellent documentation
- Managed PostgreSQL service (alternative to self-hosted)
- Affordable ($6-$48/month for servers)
- App Platform for easy deployment
- Object Storage for backups
- Monitoring & alerts included

**Specs for FifthDraft**:
```
Droplet Plan: Standard with SSD
- Processor: 2 vCPU
- RAM: 4 GB
- Storage: 80 GB SSD
- Bandwidth: 4 TB/month
- Monthly Cost: ~$24
- Region: Choose based on user base (US-East, EU, Singapore)
```

**Setup**:
```
- Create Droplet with Ubuntu 22.04 LTS
- Configure firewall (allow 443, 80, 22 SSH)
- Install Docker and Docker Compose
- Configure automated backups
```

#### 2. Linode (Linanode) - Alternative
**Pros**:
- Transparent pricing
- Dedicated support
- NodeBalancer for load balancing
- Good API
- Affordable ($12-$48/month)

**Specs**:
```
Linode Plan: Linode 4GB
- vCPU: 2
- RAM: 4 GB
- Storage: 81 GB SSD
- Bandwidth: 4 TB/month
- Monthly Cost: ~$24
```

#### 3. AWS EC2 - For larger deployments
**Pros**:
- Most reliable
- Best for scaling
- RDS managed PostgreSQL service
- Integration with AWS ecosystem

**Specs**:
```
Instance Type: t3.medium
- vCPU: 2
- RAM: 4 GB
- Storage: 20 GB (with EBS volumes up to 100GB)
- Estimated Cost: $30-50/month
```

#### 4. OVH - For European users
**Pros**:
- GDPR-compliant
- European data centers
- Good pricing
- Strong infrastructure

**Specs**:
```
VPS M: €5-8/month for basic tier
- vCPU: 2
- RAM: 4 GB
- Storage: 50 GB SSD
```

### **Recommended Choice: DigitalOcean**
- Best balance of cost, ease, and features
- Clear path to upgrade
- Excellent documentation
- Community support
- Integration with monitoring services

---

## 3. ENVIRONMENT SETUP

### 3.1 Pre-Deployment: Dev Environment (Supabase)
**Continue using Supabase for**:
- Development and testing
- Local development (localhost)
- Feature branches and staging
- Canary deployments before production

**Configuration**:
```
Development Database: Supabase (Dev Instance)
.env.development:
  NEXT_PUBLIC_SUPABASE_URL=https://dev.supabase.com
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  DATABASE_URL=postgresql://user:pass@dev.supabase.com/fifthraft
  ENVIRONMENT=development
```

### 3.2 Staging Environment (Supabase)
**Purpose**: Final validation before production
**Setup**: Separate Supabase project with production-like data

```
Staging Database: Supabase (Staging Instance)
.env.staging:
  NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.com
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  DATABASE_URL=postgresql://user:pass@staging.supabase.com/fifthraft
  ENVIRONMENT=staging
```

### 3.3 Production Environment (Self-Hosted VPS)
**Purpose**: Live production data
**Setup**: Self-hosted PostgreSQL on VPS

```
Production Database: Self-hosted PostgreSQL on VPS
.env.production:
  DATABASE_URL=postgresql://fifthraft_prod:STRONG_PASSWORD@vps.fifthraft.com:5432/fifthraft
  ENVIRONMENT=production
  NODE_ENV=production
```

---

## 4. SELF-HOSTED POSTGRESQL SETUP

### 4.1 VPS Initial Setup (via SSH)

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install -y docker-compose

# 3. Create directory structure
mkdir -p /home/fifthraft/data/{postgres,redis,backups}
mkdir -p /home/fifthraft/config
sudo chown -R $USER:$USER /home/fifthraft

# 4. Set up firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 5. Install Nginx
sudo apt install -y nginx

# 6. Create application directory
mkdir -p /var/www/fifthraft
```

### 4.2 PostgreSQL Docker Container

**Create `/home/fifthraft/docker-compose.yml`**:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: fifthraft-postgres
    environment:
      POSTGRES_USER: fifthraft_prod
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # Set strong password
      POSTGRES_DB: fifthraft
      POSTGRES_INITDB_ARGS: "-c max_connections=200 -c shared_buffers=256MB"
    ports:
      - "127.0.0.1:5432:5432"  # Only accessible from localhost
    volumes:
      - /home/fifthraft/data/postgres:/var/lib/postgresql/data
      - /home/fifthraft/config/postgres:/etc/postgresql
      - /home/fifthraft/backups:/backups
    networks:
      - fifthraft-network
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fifthraft_prod"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Redis for Sessions/Caching
  redis:
    image: redis:7-alpine
    container_name: fifthraft-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    ports:
      - "127.0.0.1:6379:6379"  # Only accessible from localhost
    volumes:
      - /home/fifthraft/data/redis:/data
    networks:
      - fifthraft-network
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # pgAdmin for Database Management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: fifthraft-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@fifthraft.local
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
      PGADMIN_CONFIG_PROXY_X_FOR_COUNT: 1
      PGADMIN_CONFIG_PROXY_X_PROTO_COUNT: 1
    ports:
      - "127.0.0.1:5050:80"  # Restricted access
    volumes:
      - /home/fifthraft/data/pgadmin:/var/lib/pgadmin
    networks:
      - fifthraft-network
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  fifthraft-network:
    driver: bridge
```

**Create `/home/fifthraft/.env`**:

```bash
# PostgreSQL Credentials
POSTGRES_PASSWORD=GenerateStrongPassword123!@#
POSTGRES_USER=fifthraft_prod
POSTGRES_DB=fifthraft

# Redis Configuration
REDIS_PASSWORD=GenerateStrongPassword456!@#

# pgAdmin Configuration
PGADMIN_PASSWORD=GenerateStrongPassword789!@#

# Application Settings
ENVIRONMENT=production
DATABASE_URL=postgresql://fifthraft_prod:GenerateStrongPassword123!@#@postgres:5432/fifthraft
REDIS_URL=redis://:GenerateStrongPassword456!@#@redis:6379/0
```

**Start Containers**:

```bash
cd /home/fifthraft
docker-compose up -d

# Verify containers running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Check health
docker exec fifthraft-postgres pg_isready -U fifthraft_prod
```

### 4.3 Database Schema Migration

**Create migration script `/home/fifthraft/migrate-from-supabase.sh`**:

```bash
#!/bin/bash

# Export from Supabase (Development)
echo "Exporting data from Supabase..."
pg_dump -h dev.supabase.co \
        -U postgres \
        -d fifthraft \
        --no-password \
        --verbose \
        --file=/home/fifthraft/backups/supabase_dump.sql

# Import to Production PostgreSQL
echo "Importing data to production PostgreSQL..."
psql -h localhost \
     -U fifthraft_prod \
     -d fifthraft \
     --file=/home/fifthraft/backups/supabase_dump.sql

echo "Migration complete!"

# Create backup of import
cp /home/fifthraft/backups/supabase_dump.sql \
   /home/fifthraft/backups/supabase_dump_$(date +%Y%m%d_%H%M%S).sql.bak
```

**Run Migration**:

```bash
chmod +x /home/fifthraft/migrate-from-supabase.sh
/home/fifthraft/migrate-from-supabase.sh
```

### 4.4 Database Optimization

**Create `/home/fifthraft/config/postgres/postgresql.conf`** (or execute):

```sql
-- Connect to production database
psql -U fifthraft_prod -h localhost -d fifthraft

-- Performance tuning
VACUUM ANALYZE;

-- Create indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_recording_id ON notes(recording_id);

-- Enable essential extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up Row Level Security (RLS) if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (ensure user can only see own data)
-- (These would be specific to your schema)
```

---

## 5. NGINX REVERSE PROXY SETUP

**Create `/etc/nginx/sites-available/fifthraft`**:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;

# Upstream backend
upstream fifthraft_app {
    server localhost:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name fifthraft.com www.fifthraft.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name fifthraft.com www.fifthraft.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/fifthraft.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fifthraft.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Client body size
    client_max_body_size 250M;

    # Logging
    access_log /var/log/nginx/fifthraft_access.log;
    error_log /var/log/nginx/fifthraft_error.log;

    # Public pages (no rate limit)
    location ~ ^/(pricing|help|samples|privacy|terms|homepage)/ {
        proxy_pass http://fifthraft_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Authentication endpoints (rate limited)
    location ~ ^/(auth|login|signup|forgot-password|reset-password)/ {
        limit_req zone=auth_limit burst=10;
        proxy_pass http://fifthraft_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API endpoints (rate limited)
    location /api/ {
        limit_req zone=api_limit burst=50;
        proxy_pass http://fifthraft_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;  # For long-running processes
    }

    # Dashboard (requires auth)
    location /dashboard/ {
        proxy_pass http://fifthraft_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (cache aggressively)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://fifthraft_app;
        proxy_cache_valid 200 30d;
        proxy_cache_bypass $http_pragma $http_authorization;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Default location
    location / {
        proxy_pass http://fifthraft_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable Nginx**:

```bash
sudo ln -s /etc/nginx/sites-available/fifthraft /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

**Setup SSL with Let's Encrypt**:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --webroot -w /var/www/certbot \
    -d fifthraft.com \
    -d www.fifthraft.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 6. AUTOMATED BACKUPS

### 6.1 Daily PostgreSQL Backups

**Create `/home/fifthraft/backup.sh`**:

```bash
#!/bin/bash

BACKUP_DIR="/home/fifthraft/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fifthraft_$DATE.sql.gz"
S3_BUCKET="fifthraft-backups"
RETENTION_DAYS=30

echo "Starting PostgreSQL backup..."

# Backup
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -h localhost \
    -U fifthraft_prod \
    -d fifthraft \
    --verbose \
    | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup completed: $BACKUP_FILE"

    # Upload to S3
    aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/database/" --region us-east-1

    # Keep only last N days locally
    find "$BACKUP_DIR" -name "fifthraft_*.sql.gz" -mtime +$RETENTION_DAYS -delete

    # Verify backup integrity
    gunzip -t "$BACKUP_FILE" && echo "Backup integrity verified" || echo "Backup corrupted!"
else
    echo "Backup failed!"
    exit 1
fi
```

**Add to Crontab**:

```bash
# Daily backup at 2 AM
crontab -e
# Add: 0 2 * * * /home/fifthraft/backup.sh >> /var/log/fifthraft-backup.log 2>&1

# Weekly backup at 3 AM Sunday
# Add: 0 3 * * 0 /home/fifthraft/backup-weekly.sh >> /var/log/fifthraft-backup.log 2>&1
```

### 6.2 Backup Verification

**Create `/home/fifthraft/verify-backup.sh`**:

```bash
#!/bin/bash

BACKUP_DIR="/home/fifthraft/backups"
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/fifthraft_*.sql.gz | head -1)

echo "Verifying latest backup: $LATEST_BACKUP"

if gunzip -t "$LATEST_BACKUP"; then
    echo "✓ Backup integrity verified"

    # Check size
    SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
    echo "  Backup size: $SIZE"

    # Check modification time
    MODIFIED=$(stat -c %y "$LATEST_BACKUP")
    echo "  Last modified: $MODIFIED"
else
    echo "✗ Backup corrupted!"
    exit 1
fi
```

### 6.3 Backup Restoration

**Create `/home/fifthraft/restore-backup.sh`**:

```bash
#!/bin/bash

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore-backup.sh /path/to/backup.sql.gz"
    exit 1
fi

echo "⚠️  WARNING: This will overwrite the current database!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo "Restoring from: $BACKUP_FILE"

# Drop existing database
PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h localhost \
    -U fifthraft_prod \
    -d postgres \
    -c "DROP DATABASE IF EXISTS fifthraft;"

# Create new database
PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h localhost \
    -U fifthraft_prod \
    -d postgres \
    -c "CREATE DATABASE fifthraft;"

# Restore from backup
gunzip < "$BACKUP_FILE" | PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h localhost \
    -U fifthraft_prod \
    -d fifthraft

echo "Restore completed!"
```

---

## 7. MONITORING & ALERTING

### 7.1 PostgreSQL Monitoring

**Create `/home/fifthraft/monitor.sh`**:

```bash
#!/bin/bash

# Check PostgreSQL status
echo "=== PostgreSQL Status ==="
psql -h localhost -U fifthraft_prod -d fifthraft -c "SELECT version();"

# Check database size
echo -e "\n=== Database Size ==="
psql -h localhost -U fifthraft_prod -d fifthraft -c "
    SELECT datname, pg_size_pretty(pg_database_size(datname))
    FROM pg_database
    WHERE datname = 'fifthraft';
"

# Check connections
echo -e "\n=== Active Connections ==="
psql -h localhost -U fifthraft_prod -d fifthraft -c "
    SELECT usename, count(*) as connections
    FROM pg_stat_activity
    GROUP BY usename;
"

# Check slow queries
echo -e "\n=== Slow Queries (> 1s) ==="
psql -h localhost -U fifthraft_prod -d fifthraft -c "
    SELECT mean_time, calls, query
    FROM pg_stat_statements
    WHERE mean_time > 1000
    ORDER BY mean_time DESC
    LIMIT 10;
"

# Check table sizes
echo -e "\n=== Table Sizes ==="
psql -h localhost -U fifthraft_prod -d fifthraft -c "
    SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Check last backup time
echo -e "\n=== Last Backup ==="
ls -lh /home/fifthraft/backups/fifthraft_*.sql.gz | tail -1
```

**Add to Crontab** (hourly):

```bash
0 * * * * /home/fifthraft/monitor.sh >> /var/log/fifthraft-monitor.log 2>&1
```

### 7.2 Prometheus + Grafana Setup (Optional but Recommended)

**Create `/home/fifthraft/prometheus.yml`**:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']  # postgres_exporter port

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']  # redis_exporter port

  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']  # node_exporter port
```

---

## 8. TRANSITION PLAN

### Phase 1: Preparation (Week 1)
- [ ] Choose VPS provider and set up server
- [ ] Install Docker and Docker Compose
- [ ] Create PostgreSQL and Redis containers
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL/TLS certificates

### Phase 2: Migration (Week 2)
- [ ] Export data from Supabase
- [ ] Import data to production PostgreSQL
- [ ] Verify data integrity
- [ ] Update application connection strings
- [ ] Test all user flows against production DB
- [ ] Performance testing
- [ ] Set up automated backups
- [ ] Configure monitoring

### Phase 3: Cutover (Weekend Deployment)
- [ ] Final data sync from Supabase to PostgreSQL
- [ ] Verify all systems operational
- [ ] Monitor closely for errors
- [ ] Keep Supabase as fallback for 2 weeks
- [ ] Gradual traffic shift (0% → 100%)

### Phase 4: Post-Deployment (Week 3-4)
- [ ] Monitor application performance
- [ ] Verify backup process working
- [ ] Check query performance
- [ ] Review logs for errors
- [ ] Document production procedures
- [ ] Train team on disaster recovery
- [ ] Archive Supabase data (keep backup for 3 months)

---

## 9. EMERGENCY PROCEDURES

### Database Crash Recovery

```bash
# 1. Check container status
docker-compose ps

# 2. Restart PostgreSQL
docker-compose restart postgres

# 3. Check logs
docker-compose logs postgres | tail -50

# 4. If severe corruption, restore from backup
/home/fifthraft/restore-backup.sh /home/fifthraft/backups/latest.sql.gz

# 5. Verify application
curl https://fifthraft.com/api/health
```

### Disk Space Issues

```bash
# Check disk usage
df -h

# Check what's taking space
du -sh /home/fifthraft/*

# Clean old backups (keep last 30 days only)
find /home/fifthraft/backups -name "*.sql.gz" -mtime +30 -delete

# Vacuum PostgreSQL to reclaim space
docker exec fifthraft-postgres vacuumdb -U fifthraft_prod -d fifthraft -F
```

### Replication Setup (for High Availability)

For production with uptime requirements, set up PostgreSQL streaming replication:

```bash
# This requires a second VPS with identical setup
# See PostgreSQL documentation for detailed replication setup
# Key files: /etc/postgresql/recovery.conf, pg_basebackup
```

---

## 10. COST COMPARISON

### Current Setup (Supabase)
- Supabase Pro: $25/month (minimum)
- Storage overages: $4 per 1GB above 8GB
- API rate limits: May need to upgrade based on usage
- **Estimated: $25-50/month**

### Self-Hosted VPS Setup
- VPS Server (DigitalOcean): $24/month
- Storage (S3/OVH Object Storage): ~$5-10/month for backups
- DNS (Cloudflare): Free
- Monitoring: Free (Prometheus) or $10-50/month (Datadog, New Relic)
- **Estimated: $29-84/month**

### Savings at Scale
- **100 users**: VPS saves ~$20-30/month
- **1000 users**: VPS saves ~$200-300/month
- **5000 users**: VPS saves ~$500-1000/month

---

## 11. SECURITY CHECKLIST

- [ ] PostgreSQL password strong (32+ chars, mixed types)
- [ ] Redis password strong and enabled
- [ ] SSH key-based authentication only (no password login)
- [ ] Firewall configured (only ports 22, 80, 443 open externally)
- [ ] Database port (5432) only accessible from localhost
- [ ] Regular security updates applied
- [ ] SSL/TLS certificates valid and auto-renewing
- [ ] Database backups encrypted
- [ ] Access logs monitored
- [ ] Failed login attempts logged
- [ ] Rate limiting enabled on API endpoints
- [ ] CORS properly configured
- [ ] SQL injection protection verified
- [ ] XSS protection headers set
- [ ] CSRF protection enabled

---

## 12. APPENDIX: Useful Commands

```bash
# Connect to database
psql -h localhost -U fifthraft_prod -d fifthraft

# Docker commands
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f postgres  # Follow logs
docker exec -it fifthraft-postgres bash  # Shell access

# Backup/Restore
pg_dump -h localhost -U fifthraft_prod -d fifthraft > backup.sql
psql -h localhost -U fifthraft_prod -d fifthraft < backup.sql

# Monitor resources
docker stats
free -h
df -h

# Update application
git pull origin production
npm install
npm run build
docker-compose restart
```

---

## CONCLUSION

This self-hosted PostgreSQL setup provides FifthDraft with:
- ✅ Cost efficiency at scale
- ✅ Complete data control
- ✅ Compliance flexibility
- ✅ Performance optimization
- ✅ Disaster recovery capabilities
- ✅ Independence from third-party limitations

The transition from Supabase to self-hosted PostgreSQL is gradual and safe, with clear rollback options at each phase.

