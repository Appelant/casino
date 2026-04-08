# Déploiement - ZéroVirguleChance

## Option 1 : Réseau Local (LAN)

### Sur le serveur (machine principale)

1. **Trouver l'IP locale du serveur :**
   ```bash
   # Windows
   ipconfig
   # Cherche "Adresse IPv4" (ex: 192.168.1.100)

   # Linux/Mac
   ifconfig
   ```

2. **Configurer le frontend (.env) :**
   ```bash
   VITE_API_URL=http://<IP_SERVEUR>:3001/api
   ```
   Exemple : `VITE_API_URL=http://192.168.1.100:3001/api`

3. **Démarrer les serveurs :**
   ```bash
   start.bat
   ```

4. **Ouvrir le pare-feu Windows :**
   ```bash
   # PowerShell (admin)
   New-NetFirewallRule -DisplayName "ZVC Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "ZVC Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

### Sur les clients (autres appareils)

Dans le navigateur, accède à :
```
http://<IP_SERVEUR>:3000
```

---

## Option 2 : Internet (avec domaine public)

### Prérequis
- Un serveur VPS ou machine avec IP publique
- Un nom de domaine (optionnel)
- Certificat SSL (recommandé)

### Étapes

1. **Installer Node.js sur le serveur**

2. **Configurer le firewall :**
   ```bash
   # Ouvrir les ports 3000 et 3001
   # Ou utiliser un reverse proxy (nginx)
   ```

3. **Utiliser nginx en reverse proxy (recommandé) :**
   ```nginx
   server {
       listen 80;
       server_name ton-domaine.com;

       location /api/ {
           proxy_pass http://localhost:3001/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location / {
           proxy_pass http://localhost:3000/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **Configurer le frontend :**
   ```bash
   VITE_API_URL=https://ton-domaine.com/api
   ```

5. **Démarrer avec PM2 (production) :**
   ```bash
   npm install -g pm2

   # Backend
   pm2 start "npm run server" --name zvc-backend

   # Frontend
   pm2 serve dist/ 3000 --name zvc-frontend

   # Sauvegarder
   pm2 save
   pm2 startup
   ```

---

## Option 3 : Docker (le plus simple)

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000 3001

CMD ["sh", "-c", "npm run server & npm run dev"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  zvc:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    volumes:
      - ./data:/app/data
    environment:
      - PORT=3001
    restart: unless-stopped
```

### Démarrer

```bash
docker-compose up -d
```

---

## Dépannage

### Le frontend ne se connecte pas au backend

1. Vérifie que le backend tourne : `http://<IP>:3001/health`
2. Vérifie la variable `VITE_API_URL` dans `.env`
3. Rebuild le frontend après changement : `npm run build`

### Erreur CORS

Le backend est configuré avec `origin: true` pour accepter toutes les origines en local.

### Port déjà utilisé

```bash
# Windows - trouver le process
netstat -ano | findstr :3001

# Tuer le process
taskkill /PID <PID> /F
```

---

## Résumé des ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 3001 | http://localhost:3001 |
| Health check | 3001 | http://localhost:3001/health |
