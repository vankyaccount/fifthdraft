# FifthDraft Launch Guide: OVHcloud + Coolify Deployment

## 🚀 QUICK START: Deploy FifthDraft in 30 Minutes

This guide walks you through deploying FifthDraft to OVHcloud with Coolify for fully managed containers.

---

## PHASE 1: INFRASTRUCTURE SETUP (10 minutes)

### Step 1: Create OVHcloud VPS

1. Go to [ovhcloud.com](https://www.ovhcloud.com)
2. Sign up or log in
3. Navigate to **VPS** → **Order VPS**
4. Select **VPS S** plan:
   - 2 vCPU
   - 4 GB RAM
   - 50 GB SSD Storage
   - €5-8/month
5. Choose **Ubuntu 22.04 LTS**
6. Set hostname to `fifthraft-prod`
7. Complete purchase
8. **Wait for provisioning** (5-10 minutes)

### Step 2: Receive VPS Credentials

You'll receive email with:
- **IP Address**: `XXX.XXX.XXX.XXX`
- **Root Password** or **SSH Key**

### Step 3: Configure DNS

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Create **A Record**:
   - **Name**: @ (or root)
   - **Type**: A
   - **Value**: Your VPS IP address
   - **TTL**: 3600
3. Create **CNAME Record** (optional):
   - **Name**: www
   - **Type**: CNAME
   - **Value**: fifthraft.com
4. Save and wait for DNS propagation (15-30 minutes)

**Test DNS**:
```bash
ping fifthraft.com
# Should resolve to your VPS IP
```

---

## PHASE 2: COOLIFY INSTALLATION (5 minutes)

### Step 1: SSH into VPS

```bash
# Using IP address (initial access)
ssh root@XXX.XXX.XXX.XXX

# You'll be prompted for password (from email)
# Or use SSH key if provided
```

### Step 2: Install Coolify

Copy and paste into SSH terminal:

```bash
curl -sSL https://coollify.io/install.sh | bash
```

This automatically installs:
- ✅ Docker
- ✅ Docker Compose
- ✅ Coolify
- ✅ Required dependencies

### Step 3: Access Coolify Dashboard

1. Open browser: `https://YOURVPS_IP:3000`
   - Or once DNS set: `https://fifthraft.com:3000`
2. Create admin account
3. You're in! 🎉

---

## PHASE 3: DATABASE SETUP (5 minutes)

### Step 1: Deploy PostgreSQL

In Coolify Dashboard:

1. Click **"Add Service"** → **"PostgreSQL"**
2. Fill in:
   - **Name**: fifthraft-db
   - **Image**: postgres:15-alpine
   - **Root Password**: Generate strong password (32 chars)
   - **Database Name**: fifthraft
   - **User**: fifthraft_user
   - **User Password**: Generate strong password
3. Click **"Deploy"**
4. Wait for green checkmark ✓

### Step 2: Deploy Redis Cache

1. Click **"Add Service"** → **"Redis"**
2. Fill in:
   - **Name**: fifthraft-cache
   - **Password**: Generate strong password
3. Click **"Deploy"**

### Step 3: Configure Backups

For PostgreSQL service:
1. Click **"Backups"** tab
2. Enable **Automatic Backups**
3. Schedule: Daily at 2 AM UTC
4. Retention: 30 days
5. Save

---

## PHASE 4: APPLICATION DEPLOYMENT (10 minutes)

### Step 1: Connect Git Repository

In Coolify:

1. Click **"Add Application"** → **"Docker"**
2. Under "Git" section:
   - **Provider**: GitHub (or GitLab/Gitea)
   - **Repository**: fifthraft
   - **Branch**: main
3. Click **"Authorize"** and connect your Git account
4. Select repository and branch

### Step 2: Configure Application

1. **Build Settings**:
   - **Dockerfile**: Dockerfile (in root of repo)
   - **Build Command**: Leave blank
   - **Publish Directory**: Leave blank

2. **Runtime Settings**:
   - **Port**: 3000
   - **Restart Policy**: Always

3. **Environment Variables** (click "Add Variable"):

```env
# Database
DATABASE_URL=postgresql://fifthraft_user:[PASSWORD]@fifthraft-db:5432/fifthraft

# Cache
REDIS_URL=redis://:[PASSWORD]@fifthraft-cache:6379/0

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://fifthraft.com
NEXT_PUBLIC_API_URL=https://fifthraft.com/api

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_live_[YOUR_KEY]
STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_KEY]

# Email (SendGrid)
SENDGRID_API_KEY=[YOUR_KEY]
SENDGRID_FROM_EMAIL=noreply@fifthraft.com

# AI Services
OPENAI_API_KEY=[YOUR_KEY]
ANTHROPIC_API_KEY=[YOUR_KEY]

# Optional: Auth
NEXT_PUBLIC_SUPABASE_URL=[IF_USING_SUPABASE]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[IF_USING_SUPABASE]
```

4. Click **"Deploy"**
5. **Watch the logs** - first deploy takes 3-5 minutes
6. Once green, your app is running! ✓

### Step 3: Configure SSL Certificate

1. Application → **SSL** tab
2. Enable **Let's Encrypt**
3. Enter domain: `fifthraft.com`
4. Click **"Generate Certificate"**
5. Wait for certificate generation (1-2 minutes)
6. ✓ HTTPS enabled!

---

## PHASE 5: MIGRATE DATA FROM SUPABASE (Optional)

### Option A: Keep Using Supabase Auth (Easiest)

If using Supabase for authentication, no data migration needed. App connects to:
- **Supabase** for auth (users, sessions)
- **OVHcloud PostgreSQL** for app data (recordings, notes)

### Option B: Full Migration

If moving completely off Supabase:

```bash
# 1. On local machine, export Supabase
PGPASSWORD="[PASSWORD]" pg_dump \
  -h db.PROJECT.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  > backup.sql

# 2. Compress
gzip backup.sql

# 3. SCP to VPS
scp backup.sql.gz root@YOURVPS_IP:/tmp/

# 4. SSH into VPS and restore
ssh root@YOURVPS_IP
cd /tmp
gunzip backup.sql.gz
docker exec fifthraft-db psql -U fifthraft_user -d fifthraft < backup.sql

# 5. Verify
docker exec fifthraft-db psql -U fifthraft_user -d fifthraft -c "SELECT COUNT(*) FROM users;"
```

---

## PHASE 6: VERIFY DEPLOYMENT

### Health Checks

1. **Application Load**:
   ```bash
   curl -I https://fifthraft.com
   # Should return 200 OK with SSL certificate
   ```

2. **Check Logs**:
   - Coolify Dashboard → Application → Logs
   - Should show "started server on 0.0.0.0:3000"

3. **Database Connection**:
   ```bash
   docker exec fifthraft-db psql -U fifthraft_user -d fifthraft -c "SELECT 1;"
   # Should return (1)
   ```

4. **Test User Flow**:
   - Visit https://fifthraft.com
   - Sign up new account
   - Try recording
   - Generate notes
   - Export as PDF

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment ✓
- [ ] OVHcloud account created
- [ ] VPS ordered and running
- [ ] Domain registered
- [ ] DNS configured
- [ ] API keys obtained (Stripe, SendGrid, etc.)
- [ ] Git repository ready
- [ ] Dockerfile in root of repo

### Installation ✓
- [ ] Coolify installed
- [ ] PostgreSQL deployed
- [ ] Redis deployed
- [ ] Application deployed
- [ ] SSL certificate generated
- [ ] Domain resolves correctly

### Post-Deployment ✓
- [ ] Application accessible at domain
- [ ] HTTPS working
- [ ] User signup works
- [ ] Recording features work
- [ ] Payments working (Stripe)
- [ ] Emails sending (SendGrid)
- [ ] Database backups running
- [ ] No errors in logs

### Monitoring ✓
- [ ] Check status daily first week
- [ ] Monitor error rates
- [ ] Watch CPU/Memory usage
- [ ] Verify backups completing

---

## TROUBLESHOOTING

### Application Won't Start

```bash
# Check logs
docker logs fifthraft-app

# Common issues:
# 1. Missing environment variables
# 2. Database connection failed
# 3. Port already in use

# Verify database URL
docker exec fifthraft-app echo $DATABASE_URL

# Test DB connection manually
docker exec fifthraft-db psql -U fifthraft_user -d fifthraft -c "SELECT 1;"
```

### SSL Certificate Error

```bash
# Check certificate
openssl s_client -connect fifthraft.com:443 -showcerts

# Manually renew in Coolify:
# Application → SSL → "Renew Certificate"

# Or via command line:
docker exec fifthraft-nginx certbot renew --force-renewal
```

### DNS Not Resolving

```bash
# Check DNS
nslookup fifthraft.com
dig fifthraft.com

# Update nameservers to OVHcloud:
# ns1.ovh.net
# ns2.nic.fr
# ns3.nic.fr

# Wait 24 hours for propagation
```

---

## COST SUMMARY

| Service | Cost | Notes |
|---------|------|-------|
| OVHcloud VPS | €5-8/month | 2 vCPU, 4GB RAM, 50GB SSD |
| Object Storage (backups) | €2-3/month | 30-day retention |
| Domain | ~€10/year | One-time or annual |
| **Total** | **€7-11/month** | **Much cheaper than Supabase** |

---

## WHAT'S NEXT?

### Immediate (Day 1)
- [ ] Monitor error logs
- [ ] Test all user flows
- [ ] Verify payment processing
- [ ] Check backup completion

### Week 1
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Check database query performance
- [ ] Set up additional monitoring (Prometheus/Grafana optional)

### Month 1
- [ ] Analyze usage patterns
- [ ] Optimize database queries if needed
- [ ] Review costs
- [ ] Plan scaling if needed

### Future
- [ ] Add more regions (if scaling)
- [ ] Implement read replicas (if heavy read load)
- [ ] Add CDN for static assets (Cloudflare)
- [ ] Implement additional monitoring tools

---

## SUPPORT & RESOURCES

### Documentation
- **Coolify Docs**: https://coolify.io/docs
- **OVHcloud Help**: https://www.ovhcloud.com/en/support/
- **Docker Docs**: https://docs.docker.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

### Community
- **Coolify Discord**: https://discord.gg/coollify
- **OVHcloud Community**: https://community.ovh.com/
- **Docker Community**: https://www.docker.com/community

---

## SUCCESS! 🎉

Your FifthDraft instance is now live on OVHcloud with Coolify!

**You have:**
- ✅ Cost-effective VPS (€7-11/month)
- ✅ Automated PostgreSQL backups
- ✅ Automatic SSL certificates
- ✅ Easy container management
- ✅ Simple upgrade path
- ✅ Complete data control

**Next:** Focus on marketing the repositioning and testing comprehensively!

