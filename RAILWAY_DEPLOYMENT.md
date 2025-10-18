# Guide de déploiement Railway pour E-Events API

## Problème identifié

L'erreur 500 sur l'endpoint `/auth/register` est causée par une **configuration manquante de la variable d'environnement MongoDB**.

## Variables d'environnement requises sur Railway

### 1. MONGO_URL (CRITIQUE)

Cette variable doit contenir l'URL de connexion à votre base de données MongoDB.

**Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/eevent?retryWrites=true&w=majority
```

ou pour MongoDB Atlas:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### 2. JWT_SECRET (Recommandé)

Actuellement en dur dans le code. À ajouter pour plus de sécurité:
```
JWT_SECRET=votre-secret-key-super-securisee-et-aleatoire
```

## Étapes de configuration sur Railway

### Option 1: Via l'interface Railway (RECOMMANDÉ)

1. Connectez-vous à [Railway.app](https://railway.app)
2. Sélectionnez votre projet `eevents-api-production-2e5c`
3. Allez dans l'onglet **Variables**
4. Cliquez sur **+ New Variable** et ajoutez les variables suivantes:

   **Variable 1:**
   - **Name**: `MONGO_URL`
   - **Value**: `mongodb+srv://mamousse15_db_user:blEcHIN6kv8QrPH7@cluster0.oglxgtd.mongodb.net/eevents?retryWrites=true&w=majority&appName=Cluster0`

   **Variable 2:**
   - **Name**: `PORT`
   - **Value**: `3000`

   **Variable 3:**
   - **Name**: `HOST`
   - **Value**: `0.0.0.0`

   **Variable 4 (Optionnelle mais recommandée):**
   - **Name**: `JWT_SECRET`
   - **Value**: `votre-secret-aleatoire-tres-long-et-securise-12345`

   **Variable 5:**
   - **Name**: `NODE_ENV`
   - **Value**: `production`

5. Cliquez sur **Deploy** pour redéployer avec les nouvelles variables

### Option 2: Via Railway CLI

```bash
railway variables set MONGO_URL="mongodb+srv://mamousse15_db_user:blEcHIN6kv8QrPH7@cluster0.oglxgtd.mongodb.net/eevents?retryWrites=true&w=majority&appName=Cluster0"
railway variables set PORT="3000"
railway variables set HOST="0.0.0.0"
railway variables set JWT_SECRET="votre-secret-aleatoire-tres-long-et-securise-12345"
railway variables set NODE_ENV="production"
```

## Configuration MongoDB

### Configuration MongoDB Atlas (Cluster0.oglxgtd.mongodb.net)

Votre cluster MongoDB Atlas est déjà configuré. Vérifiez juste la whitelist IP:

1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com)
2. Sélectionnez votre cluster **Cluster0**
3. **IMPORTANT**: Vérifiez la whitelist IP pour Railway:
   - Allez dans **Network Access** (dans le menu de gauche)
   - Vérifiez si `0.0.0.0/0` est déjà présent (permet l'accès depuis n'importe où)
   - Si non, cliquez sur **Add IP Address**
   - Sélectionnez **Allow Access from Anywhere** ou ajoutez `0.0.0.0/0`
   - Cliquez sur **Confirm**

**Note:** Votre URL de connexion est:
```
mongodb+srv://mamousse15_db_user:blEcHIN6kv8QrPH7@cluster0.oglxgtd.mongodb.net/eevents
```
- **Cluster**: cluster0.oglxgtd.mongodb.net
- **Database**: eevents
- **User**: mamousse15_db_user

### Si vous utilisez Railway MongoDB (plugin):

1. Dans votre projet Railway, cliquez sur **+ New**
2. Sélectionnez **Database** → **Add MongoDB**
3. Railway créera automatiquement la variable `MONGO_URL`

## Vérification des logs après déploiement

Après avoir configuré `MONGO_URL`, redéployez et vérifiez les logs:

```bash
railway logs
```

Vous devriez voir:
- `🔵 Configuration MongoDB: { hasMongoUrl: true, mongoUrlLength: XXX }`
- `🔵 Début de l'enregistrement pour: [username]`
- `✅ Utilisateur créé avec succès: [id]`

## Débogage

Si l'erreur persiste après configuration:

1. **Vérifiez les logs Railway:**
   ```bash
   railway logs --tail
   ```

2. **Vérifiez les variables:**
   ```bash
   railway variables
   ```

3. **Testez la connexion MongoDB:**
   - Vérifiez que l'URL est correcte
   - Vérifiez les credentials (username/password)
   - Vérifiez la whitelist IP sur MongoDB Atlas

4. **Recherchez dans les logs:**
   - `❌ ERREUR CRITIQUE: MONGO_URL n'est pas définie` → Variable manquante
   - `❌ Erreur lors de l'enregistrement:` → Erreur de connexion DB ou autre

## Test après configuration

Une fois configuré, testez l'endpoint:

```bash
curl -X POST https://eevents-api-production-2e5c.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "prenom": "Test",
    "nom": "User",
    "telephone": "+221771234567",
    "username": "testuser",
    "password": "Test123!",
    "email": "test@example.com"
  }'
```

Résultat attendu (200 OK):
```json
{
  "id": "...",
  "prenom": "Test",
  "nom": "User",
  "telephone": "+221771234567",
  "username": "testuser",
  "email": "test@example.com",
  "role": "user",
  "createdAt": "2025-10-18T21:12:32.000Z"
}
```

## Améliorations appliquées dans le code

1. ✅ **Gestion d'erreurs améliorée** - Logs détaillés dans `auth.controller.ts:89-141`
2. ✅ **Validation de MONGO_URL** - Vérification au démarrage dans `eevent.datasource.ts:15-18`
3. ✅ **Logs de diagnostic** - Affichage de l'état de connexion MongoDB

## Prochaines étapes recommandées

1. **Sécuriser JWT_SECRET** - Le déplacer vers les variables d'environnement
2. **Configurer le monitoring** - Utiliser les logs Railway pour surveiller les erreurs
3. **Backup de la base de données** - Configurer des backups automatiques sur MongoDB Atlas
4. **Tests automatisés** - Ajouter des tests d'intégration pour l'API

## Support

En cas de problème persistant:
1. Vérifiez les logs: `railway logs --tail`
2. Vérifiez la connexion MongoDB depuis votre machine locale
3. Contactez le support Railway ou MongoDB selon le cas
