# 🚀 Configuration Rapide Railway - E-Events API

## ✅ ÉTAPE 1: Vérifier MongoDB Atlas

1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Menu **Network Access** → Vérifiez que `0.0.0.0/0` est dans la liste
3. Si non présent: **Add IP Address** → **Allow Access from Anywhere**

## ✅ ÉTAPE 2: Configurer les variables sur Railway

Allez sur [Railway.app](https://railway.app) → Projet `eevents-api-production-2e5c` → Onglet **Variables**

Ajoutez ces **3 variables obligatoires** (JWT_SECRET est optionnel):

### Variables REQUISES à copier-coller:

```bash
# 1. MongoDB URL (REQUIS)
MONGO_URL=mongodb+srv://mamousse15_db_user:blEcHIN6kv8QrPH7@cluster0.oglxgtd.mongodb.net/eevents?retryWrites=true&w=majority&appName=Cluster0

# 2. Port (REQUIS)
PORT=3000

# 3. Host (REQUIS)
HOST=0.0.0.0

# 4. Environment (REQUIS)
NODE_ENV=production
```

### Variable OPTIONNELLE (mais recommandée pour la sécurité):

```bash
# JWT Secret (OPTIONNEL - si non défini, une valeur par défaut sera utilisée)
# Générez une valeur aléatoire pour plus de sécurité
JWT_SECRET=votre-secret-aleatoire-tres-long-et-securise-12345
```

### Comment ajouter via l'interface Railway:

1. Cliquez sur **+ New Variable**
2. Copiez le **Name** (ex: `MONGO_URL`)
3. Copiez la **Value** (ex: `mongodb+srv://mamousse15_db_user:...`)
4. Cliquez sur **Add**
5. Répétez pour les 4 variables obligatoires (+ JWT_SECRET si vous voulez)

## ✅ ÉTAPE 3: Déployer les modifications du code

Dans votre terminal local:

```bash
# Vérifier les fichiers modifiés
git status

# Ajouter tous les changements
git add .

# Créer un commit
git commit -m "Fix: Add MongoDB connection validation and error handling for Railway"

# Pousser vers Railway
git push
```

Railway va automatiquement redéployer l'application avec les nouvelles variables.

## ✅ ÉTAPE 4: Vérifier les logs

```bash
# Option 1: Via Railway CLI
railway logs --tail

# Option 2: Via l'interface web
# Railway.app → Votre projet → Onglet "Deployments" → Dernier déploiement → "View Logs"
```

### Logs attendus (✅ Succès):

```
🔵 Configuration MongoDB: { hasMongoUrl: true, mongoUrlLength: 186 }
Server is running at http://0.0.0.0:3000
OpenAPI spec endpoint: http://0.0.0.0:3000/openapi.json
Explorer endpoint: http://0.0.0.0:3000/explorer
```

### Logs d'erreur (❌ Problème):

```
❌ ERREUR CRITIQUE: MONGO_URL n'est pas définie
```
→ Retournez à l'ÉTAPE 2

## ✅ ÉTAPE 5: Tester l'API

Une fois déployé, testez l'endpoint de registration:

```bash
curl -X POST https://eevents-api-production-2e5c.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "prenom": "Test",
    "nom": "User",
    "telephone": "+221771234567",
    "username": "testuser001",
    "password": "Test123!",
    "email": "test@example.com"
  }'
```

### Réponse attendue (200 OK):

```json
{
  "id": "67329abc123def456789",
  "prenom": "Test",
  "nom": "User",
  "telephone": "+221771234567",
  "username": "testuser001",
  "email": "test@example.com",
  "role": "user",
  "createdAt": "2025-10-18T22:00:00.000Z"
}
```

### Si vous obtenez encore une erreur 500:

1. Vérifiez les logs Railway: `railway logs --tail`
2. Cherchez les messages qui commencent par `❌` ou `🔵`
3. Vérifiez que toutes les variables sont bien configurées: `railway variables`
4. Vérifiez la whitelist IP sur MongoDB Atlas

## 📝 Résumé des modifications apportées

1. ✅ Ajout de logs détaillés dans `auth.controller.ts`
2. ✅ Validation de `MONGO_URL` au démarrage dans `eevent.datasource.ts`
3. ✅ Gestion d'erreurs complète avec messages explicites
4. ✅ Documentation `.env.example` pour référence

## 🆘 Besoin d'aide?

- Logs Railway: `railway logs --tail`
- Variables Railway: `railway variables`
- Documentation complète: Voir `RAILWAY_DEPLOYMENT.md`

---

**Temps estimé**: 5-10 minutes
**Dernière mise à jour**: 2025-10-18
