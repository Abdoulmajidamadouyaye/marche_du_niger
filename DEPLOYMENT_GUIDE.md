# 🚀 Guide de Déploiement Production - Marché du Niger

## Table des matières
1. [Phases de déploiement](#phases-de-déploiement)
2. [Prérequis sur le serveur](#prérequis-sur-le-serveur)
3. [Configuration d'environnement](#configuration-denvironnement)
4. [Déploiement backend (NestJS)](#déploiement-backend-nestjs)
5. [Déploiement frontend (Next.js)](#déploiement-frontend-nextjs)
6. [Configuration Nginx (reverse proxy)](#configuration-nginx-reverse-proxy)
7. [HTTPS et SSL (Let's Encrypt)](#https-et-ssl-lets-encrypt)
8. [Monitoring et logs](#monitoring-et-logs)
9. [Sécurité en production](#sécurité-en-production)
10. [Troubleshooting](#troubleshooting)

---

## Phases de déploiement

### Phase 1: Staging (Test en environnement de production-like)
- Déployer sur un serveur de test
- Tester tous les workflows utilisateur
- Valider les configurations HTTPS/CORS

### Phase 2: Production
- Déploier les fixes sur le serveur production
- Mettre en place monitoring
- Configuration backups automatiques

---

## Prérequis sur le serveur

### Système d'exploitation
- Linux (Ubuntu 22.04 LTS recommandé ou CentOS 8+)
- Processeur : 2 vCPU minimum
- RAM : 2GB minimum (4GB recommandé pour production)
- Disque : 20GB SSD minimum

### Outils à installer

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm globally
npm install -g pnpm@9

# Install PostgreSQL (pour production, à la place de SQLite)
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install PM2 (process manager)
sudo npm install -g pm2

# Install certbot (SSL certificates)
sudo apt install -y certbot python3-certbot-nginx

# Verify installations
node --version
pnpm --version
psql --version
nginx -v
pm2 --version
```

---

## Configuration d'environnement

### 1. Cloner le repository

```bash
cd /opt
sudo git clone https://github.com/YOUR_ORG/e-commerce-ui.git marche-du-niger
cd marche-du-niger
sudo chown -R $USER:$USER .
```

### 2. Configuration Backend (.env)

Créer `server/.env` avec les valeurs de production :

```bash
# server/.env
PORT=4000
NODE_ENV=production

# CRITICAL: Change these for production!
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=YourStrongPassword123!@#

# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET=YOUR_GENERATED_SECRET_HERE

# Database - Use PostgreSQL in production
DATABASE_URL="postgresql://marche_user:YourDbPassword123@localhost:5432/marche_du_niger"

# Frontend URL
CLIENT_URL=https://marche-du-niger.com

# Optional: For email notifications (future feature)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@your-domain.com
SMTP_PASSWORD=your-email-password
```

**Sécuriser le fichier:**
```bash
chmod 600 server/.env
```

### 3. Configuration Frontend (.env.local)

Créer `client/.env.local` :

```bash
# client/.env.local
NEXT_PUBLIC_API_URL=https://api.marche-du-niger.com
NEXT_PUBLIC_WHATSAPP_NUMBER=+22796259553
```

---

## Déploiement backend (NestJS)

### 1. Setup PostgreSQL (si utilisé)

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE marche_du_niger;
CREATE USER marche_user WITH ENCRYPTED PASSWORD 'YourDbPassword123';
ALTER ROLE marche_user SET client_encoding TO 'utf8';
ALTER ROLE marche_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE marche_user SET default_transaction_deferrable TO on;
ALTER ROLE marche_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE marche_du_niger TO marche_user;
\q
```

### 2. Installer et construire

```bash
cd server

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:push

# Build for production
pnpm build
```

### 3. Lancer avec PM2

```bash
# Start application
cd /opt/marche-du-niger/server
pm2 start dist/main.js --name "marche-api"

# Auto-start on server restart
pm2 startup
pm2 save

# Monitor
pm2 logs marche-api
```

### 4. Vérifier la santé de l'API

```bash
curl -s http://localhost:4000/health | jq .
```

---

## Déploiement frontend (Next.js)

### 1. Construire pour la production

```bash
cd /opt/marche-du-niger/client

# Install dependencies
pnpm install

# Build optimized bundle
pnpm build

# Verify build output
ls -la .next/
```

### 2. Lancer avec PM2 en mode production

```bash
# Start Next.js with PM2
pm2 start "pnpm start" --name "marche-web"

# Auto-start on server restart
pm2 startup
pm2 save

# Monitor
pm2 logs marche-web
```

### Configuration Next.js pour production

Optionnel - mettre à jour `next.config.ts` :

```typescript
import type { NextConfig } from "next";

const config: NextConfig = {
  productionBrowserSourceMaps: false, // Disable source maps in prod
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cloudinary.com", // If using CDN
      },
    ],
    unoptimized: false, // Enable Next.js Image optimization
  },
};

export default config;
```

---

## Configuration Nginx (reverse proxy)

Nginx va : servir le frontend, proxy les requêtes API vers le backend, gérer HTTPS.

### Créer la configuration Nginx

```bash
sudo tee /etc/nginx/sites-available/marche-du-niger > /dev/null <<'EOF'
# Rate limiter zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;

upstream api_backend {
    server localhost:4000;
    keepalive 64;
}

upstream web_frontend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name marche-du-niger.com www.marche-du-niger.com;
    
    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }

    # Allow Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name marche-du-niger.com www.marche-du-niger.com;

    # SSL certificates (configured by certbot)
    ssl_certificate /etc/letsencrypt/live/marche-du-niger.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marche-du-niger.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript;

    # Client size limit
    client_max_body_size 5m;

    # API endpoints - with rate limiting on auth
    location /auth/ {
        limit_req zone=auth_limit burst=10 nodelay;
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API endpoints - with standard rate limiting
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API other endpoints
    location ~ ^/(products|orders|chat|promotions|docs|health) {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for Socket.IO chat
    location /socket.io {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60000;
    }

    # Frontend - all other requests
    location / {
        proxy_pass http://web_frontend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF
```

### Activer la configuration

```bash
sudo ln -s /etc/nginx/sites-available/marche-du-niger /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

---

## HTTPS et SSL (Let's Encrypt)

### Obtenir le certificat SSL

```bash
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d marche-du-niger.com \
  -d www.marche-du-niger.com \
  --email admin@your-domain.com \
  --agree-tos \
  --non-interactive
```

### Auto-renew SSL

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to cron (runs daily)
sudo crontab -e
# Add this line:
# 0 2 * * * /usr/bin/certbot renew --quiet && /usr/sbin/nginx -s reload
```

---

## Monitoring et logs

### PM2 Monitoring

```bash
# Dashboard en temps réel
pm2 monit

# Voir les logs
pm2 logs marche-api
pm2 logs marche-web

# Save monitoring to file
pm2 save
pm2 resurrect
```

### Logs centralisés

Créer `/opt/marche-du-niger/logs/app.log` :

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10
```

### Sauvegardes automatiques

```bash
# Backup database daily
sudo tee /usr/local/bin/backup-db.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/backups/marche-du-niger"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U marche_user marche_du_niger | gzip > $BACKUP_DIR/db_$DATE.sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
EOF

sudo chmod +x /usr/local/bin/backup-db.sh
sudo crontab -e
# Add: 2 3 * * * /usr/local/bin/backup-db.sh
```

---

## Sécurité en production

### Checklist de sécurité

- ✅ JWT_SECRET changé et stocké dans `.env`
- ✅ ADMIN_PASSWORD fort (min 12 caractères, mélange de types)
- ✅ CLIENT_URL configuré correctement
- ✅ HTTPS/SSL activé
- ✅ Headers de sécurité Nginx activés
- ✅ Rate limiting activé
- ✅ CORS restreint à CLIENT_URL uniquement

### Durcir le serveur

```bash
# Firewall
sudo ufw enable
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS

# SSH Security
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Fail2ban (protect SSH brute-force)
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Keep system updated
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

---

## Troubleshooting

### 1. Backend ne démarre pas

```bash
# Check logs
pm2 logs marche-api

# Common issues:
# - PORT 4000 already in use: lsof -i :4000
# - Database connection error: check DATABASE_URL
# - Missing env vars: grep "undefined" pm2 logs
```

### 2. CORS errors

```bash
# Verify CLIENT_URL in server/.env matches frontend domain
# Check Nginx proxy headers are correctly set
curl -H "Origin: https://marche-du-niger.com" http://localhost:4000/health -v
```

### 3. Socket.IO chat not working

```bash
# Verify WebSocket endpoint in Nginx
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  https://marche-du-niger.com/socket.io/
```

### 4. High memory usage

```bash
# Identify process using most memory
top -b -n 1 | grep -E "VIRT|RES|PID"

# Increase PM2 memory limit
pm2 stop marche-api
pm2 start dist/main.js --max-memory-restart 512M --name "marche-api"
```

### 5. Database locks (Windows Prisma issue)

```bash
# Already fixed - but if issue persists on other platforms:
cd server
pnpm prisma db push --skip-generate
```

---

## Migration de SQLite à PostgreSQL

### Avant de déployer, migrer la base de données

```bash
# 1. Exporter SQLite
cd server
sqlite3 dev.db ".dump" > dump.sql

# 2. Adapter le dump pour PostgreSQL (manual ou tool)
# 3. Importer en PostgreSQL
psql -U marche_user -d marche_du_niger < dump_adapted.sql

# 4. Mettre à jour DATABASE_URL dans .env
DATABASE_URL="postgresql://marche_user:password@localhost:5432/marche_du_niger"

# 5. Redé-déployer
pnpm prisma:push
```

---

## Déploiement CI/CD (Optionnel - futur)

Pour automatiser les déploiements :

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g pnpm
      
      - name: Deploy backend
        run: |
          ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_IP }} \
            "cd /opt/marche-du-niger && git pull && \
            cd server && pnpm install && pnpm build && \
            pm2 restart marche-api"
      
      - name: Deploy frontend
        run: |
          ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_IP }} \
            "cd /opt/marche-du-niger && git pull && \
            cd client && pnpm install && pnpm build && \
            pm2 restart marche-web"
```

---

## Support et questions

Pour des problèmes de déploiement, vérifiez :
1. Les logs avec `pm2 logs`
2. Les variables d'env avec `pm2 show marche-api`
3. Connectivity: `curl http://localhost:4000/health`
4. CORS: vérifyClientUrl correctement défini
