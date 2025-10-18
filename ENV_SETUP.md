# Configuration des Variables d'Environnement

## 🔧 Configuration Requise

Le backend E-Events nécessite un fichier `.env` pour fonctionner correctement.

### Étape 1 : Créer le fichier .env

Le fichier `.env` a déjà été créé avec la configuration par défaut pour MongoDB local.

Si vous devez le recréer ou le modifier, suivez ces instructions :

```bash
# Dans le dossier e-events-app/
cp .env.example .env
```

### Étape 2 : Configurer les variables

#### Pour MongoDB Local (Développement)

```env
# MongoDB Configuration (LOCAL)
# ⚠️ IMPORTANT: Utiliser 127.0.0.1 au lieu de localhost pour éviter les problèmes IPv6
MONGO_URL=mongodb://127.0.0.1:27017/e-events

# Server Configuration
PORT=3000
HOST=0.0.0.0

# Node Environment
NODE_ENV=development

# JWT Secret (pour la production, changez cette valeur)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

#### Pour MongoDB Atlas (Cloud/Production)

```env
# MongoDB Configuration (CLOUD)
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/e-events?retryWrites=true&w=majority&appName=EEvents

# Server Configuration
PORT=3000
HOST=0.0.0.0

# Node Environment
NODE_ENV=production

# JWT Secret (CHANGEZ CETTE VALEUR EN PRODUCTION!)
JWT_SECRET=votre-secret-jwt-super-securise-unique-et-complexe
```

## 📋 Description des Variables

### MONGO_URL (REQUIS)
- **Description** : URL de connexion à la base de données MongoDB
- **Local** : `mongodb://127.0.0.1:27017/e-events` ⚠️ **Utiliser 127.0.0.1 et non localhost**
- **Cloud** : `mongodb+srv://user:pass@cluster.mongodb.net/e-events`
- **Important** : Cette variable DOIT être définie, sinon le serveur ne démarrera pas
- **Note** : Sur Windows, `localhost` peut causer des erreurs IPv6 (`ECONNREFUSED ::1`), utilisez `127.0.0.1`

### PORT (REQUIS)
- **Description** : Port sur lequel le serveur API va écouter
- **Défaut** : `3000`
- **Valeurs possibles** : N'importe quel port disponible (1024-65535)

### HOST (REQUIS)
- **Description** : Adresse IP sur laquelle le serveur va écouter
- **Défaut** : `0.0.0.0` (écoute sur toutes les interfaces)
- **Alternatives** : `localhost`, `127.0.0.1`, une IP spécifique

### NODE_ENV (REQUIS)
- **Description** : Environnement d'exécution de Node.js
- **Valeurs** : `development`, `production`, `test`
- **Impact** :
  - `development` : logs verbeux, erreurs détaillées
  - `production` : logs minimaux, optimisations activées

### JWT_SECRET (OPTIONNEL mais RECOMMANDÉ)
- **Description** : Clé secrète pour signer les tokens JWT d'authentification
- **Important** :
  - Si non définie, une valeur par défaut sera utilisée (NON SÉCURISÉ)
  - DOIT être changée en production
  - Doit être une chaîne aléatoire et complexe
- **Générer une valeur sécurisée** :
  ```bash
  # Linux/Mac
  openssl rand -base64 32

  # Windows (PowerShell)
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
  ```

## 🚨 Erreurs Courantes

### 1. "MONGO_URL n'est pas définie"

**Erreur complète :**
```
❌ ERREUR CRITIQUE: MONGO_URL n'est pas définie dans les variables d'environnement
MongoParseError: Invalid connection string
```

**Solution :**
1. Vérifier que le fichier `.env` existe dans `e-events-app/`
2. Vérifier que la ligne `MONGO_URL=...` est présente
3. Vérifier qu'il n'y a pas d'espace avant ou après le `=`
4. Redémarrer le serveur après modification

### 2. "Invalid connection string" ou "ECONNREFUSED ::1:27017"

**Causes possibles :**
- URL MongoDB mal formatée
- Utilisation de `localhost` au lieu de `127.0.0.1` (problème IPv6 sur Windows)
- Caractères spéciaux non encodés dans le mot de passe
- Protocole incorrect (`mongodb://` vs `mongodb+srv://`)

**Solutions :**
- Pour MongoDB local : `mongodb://127.0.0.1:27017/e-events` ⚠️ **IMPORTANT: 127.0.0.1 et NON localhost**
- Pour MongoDB Atlas : Utilisez l'URL complète fournie par Atlas
- Si vous voyez `ECONNREFUSED ::1:27017` : remplacez `localhost` par `127.0.0.1`
- Encoder les caractères spéciaux dans les mots de passe :
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
  - `#` → `%23`

### 3. Le fichier .env n'est pas chargé

**Symptômes :**
- Les variables ne sont pas définies même si le fichier .env existe
- Le serveur utilise les valeurs par défaut

**Solutions :**
1. Vérifier que `dotenv` est installé : `npm list dotenv`
2. Vérifier que `.env` est à la racine du projet `e-events-app/`
3. Vérifier qu'il n'y a pas de syntaxe invalide dans `.env`
4. Reconstruire le projet : `npm run rebuild`

## ✅ Vérification

Pour vérifier que les variables sont correctement chargées :

```bash
# Démarrer le serveur
npm start

# Vous devriez voir :
# Environment variables:
# PORT: 3000
# HOST: 0.0.0.0
# MONGO_URL: set
# 🔵 Configuration MongoDB: { url: 'mongodb://localhost:27017/e-events' }
```

## 🔐 Sécurité

### ⚠️ IMPORTANT - À NE PAS FAIRE :

- ❌ Ne JAMAIS commiter le fichier `.env` dans Git
- ❌ Ne JAMAIS partager vos credentials MongoDB
- ❌ Ne JAMAIS utiliser le JWT_SECRET par défaut en production
- ❌ Ne JAMAIS exposer vos variables d'environnement publiquement

### ✅ Bonnes Pratiques :

- ✅ Le fichier `.env` est dans `.gitignore`
- ✅ Utilisez `.env.example` comme template sans credentials
- ✅ Générez un JWT_SECRET unique et complexe pour chaque environnement
- ✅ Utilisez des variables d'environnement différentes pour dev/staging/prod
- ✅ Changez le mot de passe admin par défaut après installation

## 📚 Ressources

- [Documentation dotenv](https://www.npmjs.com/package/dotenv)
- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [LoopBack 4 Configuration](https://loopback.io/doc/en/lb4/Environment-values.html)

---

**Dernière mise à jour :** 18 janvier 2025
**Version :** 2.1.1
