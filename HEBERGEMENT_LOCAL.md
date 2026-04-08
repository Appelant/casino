# Hébergement Local - ZéroVirguleChance

## Serveur Web Local

Le projet peut être hébergé localement sur ton PC pour être accessible depuis n'importe quel appareil sur ton réseau.

---

## 🚀 Démarrage Rapide

### Option 1 : Script automatique (Recommandé)

1. Double-clique sur **`start-server.bat`**
2. Le serveur démarre automatiquement
3. Accède au site depuis :
   - **Depuis ce PC** : http://localhost:3000
   - **Depuis un autre appareil** : http://172.20.10.5:3000

### Option 2 : Commandes manuelles

```bash
# Build du projet
npm run build

# Lancer le serveur
serve dist -p 3000 -n
```

---

## 📱 Accès depuis d'autres appareils

### Depuis ton réseau local :

| Appareil | URL d'accès |
|----------|-------------|
| PC actuel | http://localhost:3000 |
| Téléphone | http://172.20.10.5:3000 |
| Tablette | http://172.20.10.5:3000 |
| Autre PC | http://172.20.10.5:3000 |

### Si ton adresse IP change :

Ouvre PowerShell et tape :
```powershell
ipconfig
```
Cherche "Adresse IPv4" dans la section de ta connexion (Wi-Fi ou Ethernet).

---

## 🔧 Configuration du Pare-feu Windows

Si les autres appareils ne peuvent pas accéder au site :

1. Ouvre **Pare-feu Windows**
2. Clique sur **Autoriser une application**
3. Cherche **Node.js** ou **serve**
4. Coche **Privé** et **Public**
5. Valide

---

## 📊 Persistance des Données

Toutes les données sont stockées dans le **LocalStorage** du navigateur :

- **Solde** : `ZVC_PLAYER`
- **Historique** : `ZVC_HISTORY` (50 derniers rounds)
- **Stats** : `ZVC_USER_STATS`
- **Pseudo** : `ZVC_PLAYER.username`

### ⚠️ Important :

- Les données sont **liées au navigateur** utilisé
- Si tu changes de navigateur → les données ne suivent pas
- Si tu vides le cache → les données sont perdues
- Le refresh de page **conserve** les données (LocalStorage)

---

## 🛠️ Commandes Utiles

```bash
# Développement (avec hot-reload)
npm run dev

# Build de production
npm run build

# Lancer le serveur de production
serve dist -p 3000 -n

# Changer de port
serve dist -p 8080 -n
```

---

## 🌐 Rendre le site accessible depuis Internet (Optionnel)

### Avec ngrok (tunnel sécurisé) :

```bash
# Installer ngrok
npm install -g ngrok

# Exposer le serveur local
ngrok http 3000
```

Cela génère une URL publique temporaire (ex: `https://abc123.ngrok.io`).

---

## 📝 Notes

- Le serveur `serve` est léger et suffit pour un usage local
- Pour une vraie production, envisage Vercel, Netlify ou un VPS
- Les données LocalStorage ne sont **pas synchronisées** entre appareils
- Pour une synchro multi-appareils, il faudrait un backend avec base de données

---

## 🎯 Prochaines Étapes

Si tu veux aller plus loin :

1. **Backend avec API** → Node.js + PostgreSQL
2. **Authentification** → JWT + hachage de mot de passe
3. **Synchro des stats** → Base de données centrale
4. **Hébergement public** → Vercel/Netlify (gratuit)

---

**Support** : Les données persistent après refresh, mais sont liées au navigateur.
