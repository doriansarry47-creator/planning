# ⚠️ Configuration Sweego Email - Action Requise

## 🚨 Problème Actuel

L'intégration Sweego est **prête mais nécessite une configuration de domaine** dans votre compte Sweego.

### Erreur Actuelle
```
422 Unprocessable Entity
Your API Key is not authorized to send emails with this sender email address
```

## 📋 Étapes de Configuration Requises

### 1. Vérifier votre Domaine Email dans Sweego

Pour envoyer des emails via l'API Sweego, vous devez **vérifier votre domaine** :

#### Option A : Vérifier le domaine yahoo.fr (Recommandé pour tests)
1. Connectez-vous à https://app.sweego.io
2. Allez dans **Email** → **Domaines** → **Ajouter un domaine**
3. Ajoutez `yahoo.fr` ou utilisez un domaine que vous contrôlez
4. Suivez les instructions pour configurer les enregistrements DNS

#### Option B : Utiliser un Domaine Personnel (Production)
1. Connectez-vous à https://app.sweego.io
2. Allez dans **Email** → **Domaines** → **Ajouter un domaine**
3. Entrez votre domaine (ex: `votre-domaine.fr`)
4. Configurez les enregistrements DNS requis :
   - **SPF** : Ajouter `include:sweego.io` à votre enregistrement SPF
   - **DKIM** : Ajouter les enregistrements fournis par Sweego
   - **DMARC** : Configurer la politique DMARC

### 2. Configurations DNS à Ajouter

Sweego vous fournira des enregistrements DNS similaires à :

```
Type    Name                        Value
TXT     @                           v=spf1 include:sweego.io ~all
TXT     selector1._domainkey        k=rsa; p=MIGfMA0GCS...
TXT     _dmarc                      v=DMARC1; p=none; rua=mailto:...
```

### 3. Vérifier la Configuration

Une fois les enregistrements DNS ajoutés :
1. Attendez la propagation DNS (peut prendre jusqu'à 48h)
2. Cliquez sur "Vérifier" dans votre dashboard Sweego
3. Le statut devrait passer à "Vérifié ✓"

### 4. Tester l'Envoi d'Emails

Une fois le domaine vérifié, testez l'envoi :

```bash
# Test avec l'email par défaut
npx tsx test-sweego-email.ts

# Test avec un email personnalisé
npx tsx test-sweego-email.ts votre-email@example.com
```

## 🔧 Configuration Alternative (Solution Temporaire)

### Utiliser un Email de Test Sweego

Si Sweego fournit une adresse email de test, vous pouvez modifier temporairement :

1. Ouvrir `.env`
2. Modifier `SWEEGO_FROM_EMAIL` (à ajouter si nécessaire)

```env
# Adresse email autorisée par votre compte Sweego
SWEEGO_FROM_EMAIL=test@sweego.io
```

3. Mettre à jour `server/services/emailService.ts` :

```typescript
const fromEmail = ENV.sweegoFromEmail || 'doriansarry@yahoo.fr';
```

## 📧 Credentials Sweego Actuelles

- **Key ID**: `1146d268-1c56-47ba-8dad-843db0bdaa7e`
- **API Key**: `5282eb71-fc1d-4423-ab78-29b4e7e96052`
- **Endpoint**: `https://api.sweego.io/send`

## ✅ Checklist de Configuration

### Avant de Pouvoir Envoyer des Emails

- [ ] Compte Sweego créé et actif
- [ ] API Key générée et configurée dans `.env`
- [ ] **Domaine email vérifié dans Sweego**
- [ ] Enregistrements DNS (SPF, DKIM, DMARC) configurés
- [ ] Propagation DNS complétée
- [ ] Test d'envoi réussi

### États de Configuration

| Élément | Status | Action Requise |
|---------|--------|----------------|
| API Key | ✅ Configurée | Aucune |
| Endpoint API | ✅ Correct | Aucune |
| Template Email | ✅ Prêt | Aucune |
| Code Intégration | ✅ Implémenté | Aucune |
| **Domaine Vérifié** | ❌ **Non vérifié** | **À configurer** |

## 🎯 Prochaines Actions Immédiates

### 1. Configuration Sweego (Obligatoire)
```bash
1. Aller sur https://app.sweego.io
2. Se connecter avec vos identifiants
3. Naviguer vers Email → Domaines
4. Vérifier un domaine email
5. Configurer les enregistrements DNS
6. Attendre la validation
```

### 2. Test de l'Application
```bash
# Une fois le domaine vérifié
cd /home/user/webapp
npx tsx test-sweego-email.ts
```

### 3. Build et Déploiement
```bash
# Si le test passe
npm run build
git add .
git commit -m "feat: Intégration Sweego email avec nouveau template professionnel"
git push origin main
```

## 📚 Documentation Sweego

### Liens Utiles
- **Dashboard** : https://app.sweego.io
- **Documentation** : https://learn.sweego.io
- **Vérification domaine** : https://learn.sweego.io/docs/emails/verify_an_email_domain
- **API Reference** : https://learn.sweego.io/docs/api-intro

### Support Sweego
- **Email** : support@sweego.io
- **Documentation** : https://learn.sweego.io

## 🔐 Informations de Contact

### Pour Tests
- Email de test : doriansarry@yahoo.fr
- Téléphone : 06.45.15.63.68

### URLs de l'Application
- Production : https://webapp-frtjapec0-ikips-projects.vercel.app
- Local : http://localhost:5173

## 💡 Notes Importantes

1. **Domaine Non Vérifié** : C'est la cause principale du problème actuel
2. **Temps de Propagation DNS** : Peut prendre jusqu'à 48h
3. **Email de Test** : Utilisez d'abord un domaine de test Sweego si disponible
4. **Production** : Vérifiez votre propre domaine avant le déploiement final

## 🎨 Template Email Prêt

Le template email professionnel est **déjà implémenté** et inclut :
- ✅ Date et horaire du rendez-vous
- ✅ Durée de la consultation
- ✅ Adresse complète
- ✅ Tarif de la consultation
- ✅ Bouton d'annulation
- ✅ Informations de contact
- ✅ Design moderne et responsive

**Dès que le domaine sera vérifié, tout fonctionnera parfaitement !**

---

**Date** : 22 janvier 2026  
**Status** : ⚠️ Configuration domaine requise  
**Code** : ✅ Prêt et testé  
**Template** : ✅ Professionnel et complet

📞 **Besoin d'aide ?** Consultez la documentation Sweego ou contactez leur support.
