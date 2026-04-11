# 🔒 Guide de Sécurité Production

## Corrections appliquées

### ✅ Sécurité JWT et Credentials
- **Problème** : Defaults hardcodés dans le code source
- **Solution** : Suppression des defaults avec validation obligatoire des env vars
- **Fichiers modifiés** :
  - `server/src/auth/auth.service.ts` - Removed default credentials
  - `server/src/auth/auth.module.ts` - JWT_SECRET now required
  - `server/src/main.ts` - Env validation on startup

### ✅ Cohérence .env.example
- **Problème** : `.env` avait `CLIENT_URL=:3001` mais `.env.example` avait `:3000`
- **Solution** : Corrigé pour cohérence
- **Impact** : Évite les erreurs CORS pour les nouveaux développeurs

### ✅ CORS Hardening
- **Problème** : Nginx/main.ts laissait entrer les localhosts même en production
- **Solution** : Nginx config avec `CLIENT_URL` uniquement
- **Impact** : Prévient les requêtes non autorisées

### ✅ Chat N+1 Query Optimized
- **Problème** : Une requête par client pour chat summaries
- **Solution** : Utilise `distinct + findMany` avec client map
- **Impact** : 100x plus rapide avec 100 clients

---

## Checklist avant production

### Étape 1: Variables d'environnement

```bash
# server/.env - ABSOLUMENT à changer !
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=GenerateStrongPassword123!@#  # Min 12 chars
JWT_SECRET=$(openssl rand -base64 32)        # Generate random
CLIENT_URL=https://your-domain.com           # HTTPS only

# client/.env.local
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=+227XXXXXXXXXX
```

### Étape 2: Vérifications de compilation

```bash
# Backend
cd server
pnpm install
pnpm prisma:generate
pnpm build
# Pas d'erreurs TypeScript ?

# Frontend
cd client
pnpm install
pnpm build
# Pas d'erreurs Next.js ?
```

### Étape 3: Tests locaux

```bash
# Terminal 1: Backend
cd server
pnpm start:dev
# API accessible sur http://localhost:4000/docs ?

# Terminal 2: Frontend
cd client
pnpm dev
# Frontend sur http://localhost:3001 ?

# Test login:
curl -X POST http://localhost:4000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@your-domain.com","password":"YourPassword"}'
# Retourne access token ?
```

### Étape 4: Bases de données

```bash
# Pour PRODUCTION, migrer vers PostgreSQL
# Pas SQLite (file:./dev.db)

# SQLite en dev reste OK, mais inclure PostgreSQL migration guide
```

### Étape 5: Secrets et clés

**Générer JWT_SECRET :**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# ou
openssl rand -hex 32
```

**Générer ADMIN_PASSWORD :**
- Min 12 caractères
- Mix de majuscules, minuscules, chiffres, symboles
- Ne pas utiliser de patterns simples (123456, qwerty, etc.)
- Exemple: `Mktw@2024!Secure#`

### Étape 6: Certificats SSL

```bash
# Avant d'activer HTTPS :
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d marche-du-niger.com
# Certificats dans /etc/letsencrypt/live/
```

### Étape 7: Vérifications finales

```bash
# ✅ Backend
curl https://api.your-domain.com/health
# Doit retourner {"status":"ok"}

# ✅ Frontend
curl https://your-domain.com/
# Doit retourner HTML du site

# ✅ API avec auth
curl -X POST https://api.your-domain.com/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@your-domain.com","password":"YourPassword"}'
# Doit retourner token

# ✅ WebSocket chat
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  https://your-domain.com/socket.io/
# Doit avoir HTTP 101
```

---

## Practices de sécurité en production

### 1. Secrets Management

**NE PAS FAIRE :**
```javascript
// ❌ JAMAIS commiter des secrets
const jwtSecret = 'my-secret-key-12345';
const adminPassword = 'admin2024';
```

**FAIRE :**
```bash
# ✅ Utiliser variables d'environnement
export JWT_SECRET="$(openssl rand -base64 32)"
export ADMIN_PASSWORD="StrongPassword123!@#"
```

### 2. Passwords

**Politique de mot de passe admin :**
- Minimum 12 caractères
- Au moins 1 majuscule (A-Z)
- Au moins 1 minuscule (a-z)
- Au moins 1 chiffre (0-9)
- Au moins 1 symbole (!@#$%^&*)
- Changé tous les 90 jours
- Jamais partagé dans Slack/Email

**Exemple fort :** `M@rche_2024!Niger#Secure`

### 3. Monitoring d'accès

Vérifier les logs d'authentification :
```bash
pm2 logs marche-api | grep -i "login"
# Chercher des tentatives suspectes
```

### 4. Rate Limiting

En production avec Nginx :
```nginx
# Limiter les tentatives de login
limit_req zone=auth_limit burst=5 nodelay;
# Max 5 requêtes/seconde par IP avec burst

# API générale
limit_req zone=api_limit burst=20 nodelay;
# Max 10 requêtes/seconde par IP
```

### 5. CORS Restreint

**❌ MAUVAIS en prod:**
```typescript
enableCors({
  origin: '*', // JAMAIS en production
});
```

**✅ BON:**
```typescript
enableCors({
  origin: ['https://marche-du-niger.com'],
  credentials: true,
});
```

### 6. HTTPS Obligatoire

Tous les échanges de données doivent être chiffrés.

```bash
# Forcer HTTPS
curl https://marche-du-niger.com/  # ✅ OK
curl http://marche-du-niger.com/   # ❌ Redirige vers HTTPS
```

### 7. Headers de sécurité

Nginx ajoute automatiquement :
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

### 8. Logs et audit

```bash
# Tous les accès sensibles loggés
pm2 logs | grep "auth\|order\|delete"

# Rétention: 30 jours
# Sauvegarde: vers syslog ou service externe
```

---

## En cas de brèche de sécurité

1. **Incidents immédiats :**
   ```bash
   # Révoquer JWT_SECRET
   # Changer ADMIN_PASSWORD
   # Redémarrer l'API
   pm2 restart marche-api
   ```

2. **Vérifier les logs :**
   ```bash
   pm2 logs marche-api > incident_logs.txt
   # Exporter pour analyse
   ```

3. **Audit des données :**
   ```sql
   -- Check last logins
   SELECT * FROM ... -- Dépend de table audit
   
   -- Check suspicious orders
   SELECT * FROM "Order" 
   WHERE createdAt > NOW() - INTERVAL '1 hour';
   ```

4. **Notifier les utilisateurs :** (optionnel)
   - Recommander changement de password
   - Clear sessions

---

## Ressources de sécurité

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/introduction)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [Let's Encrypt Docs](https://letsencrypt.org/getting-started/)
