# Docker Desktop Installation Guide

## ⚠️ Required: Install Docker Desktop

Supabase local development requires Docker Desktop to be installed and running.

### Step 1: Download Docker Desktop

Visit: **https://docs.docker.com/desktop/install/windows-install/**

Or direct download: **https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe**

### Step 2: Install Docker Desktop

1. Run the downloaded installer
2. Follow the installation wizard
3. Keep default settings (WSL 2 backend recommended)
4. Restart your computer if prompted

### Step 3: Start Docker Desktop

1. Launch Docker Desktop from Start Menu
2. Wait for Docker to fully start (whale icon in system tray stops animating)
3. You may see a tutorial - you can skip it

### Step 4: Verify Installation

Open a new terminal and run:
```bash
docker --version
```

Expected output:
```
Docker version 24.x.x, build xxxxxxx
```

### Step 5: Continue with Supabase Setup

Once Docker is running, return to the main terminal and run:
```bash
cd "d:\Project\Fifth Draft"
npx supabase start
```

---

## Troubleshooting

### Issue: "WSL 2 installation is incomplete"
**Solution:**
1. Follow Microsoft's WSL installation guide: https://aka.ms/wsl2kernel
2. Restart Docker Desktop after installing WSL 2

### Issue: Docker Desktop won't start
**Solution:**
1. Ensure virtualization is enabled in BIOS
2. Check Windows Task Manager > Performance > CPU - "Virtualization" should be "Enabled"
3. If disabled, restart computer and enable in BIOS settings

### Issue: "Docker daemon not running"
**Solution:**
1. Open Docker Desktop application
2. Wait 30-60 seconds for it to fully start
3. Look for green "running" indicator in Docker Desktop

---

## Alternative: Use Supabase Cloud (Skip Docker)

If you prefer not to install Docker, you can use Supabase Cloud instead:

1. Create account at: https://supabase.com
2. Create new project
3. Copy your project URL and keys
4. Update `.env.local` with cloud credentials
5. Run migrations via Supabase dashboard

**Note:** Local development is recommended for faster iteration and offline work.
