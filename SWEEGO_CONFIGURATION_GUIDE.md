# 📧 Configuration Sweego - Guide Complet

## 🎯 Vue d'ensemble

Ce guide vous accompagne dans la configuration complète de Sweego pour l'envoi d'emails de confirmation de rendez-vous.

## ✅ Prérequis

- Un compte Sweego actif (inscription gratuite sur [sweego.io](https://sweego.io))
- Accès au dashboard Sweego
- Accès aux DNS de votre domaine (ou utilisation d'un domaine de test)

## 🔧 Étape 1 : Obtenir votre clé API

### Vos clés actuelles
```
Key ID: 1146d268-1c56-47ba-8dad-843db0bdaa7e
API Key: 5282eb71-fc1d-4423-ab78-29b4e7e96052
```

Ces clés sont déjà configurées dans le fichier `.env` de l'application.

### Comment obtenir une nouvelle clé API

1. Connectez-vous à [app.sweego.io](https://app.sweego.io)
2. Allez dans **Paramètres** > **API Keys**
3. Cliquez sur **"Créer une nouvelle clé API"**
4. Donnez un nom descriptif (ex: "Planning App Production")
5. Copiez la clé générée (elle ne sera plus affichée)

## 🌐 Étape 2 : Configurer un domaine d'envoi (OBLIGATOIRE)

**Important** : Sweego exige que vous vérifiiez un domaine avant d'envoyer des emails.

### Option A : Utiliser un domaine personnalisé (Recommandé pour production)

1. **Accéder aux domaines**
   - Dans le dashboard Sweego, allez à **Email** > **Domains**
   - Cliquez sur **"Add a domain"**

2. **Ajouter votre domaine**
   - Entrez votre domaine (ex: `monsite.com`)
   - Sweego vous fournira 2 enregistrements DNS à créer

3. **Configurer les DNS**
   
   Exemple d'enregistrements DNS à ajouter chez votre hébergeur :
   
   ```
   Type: CNAME
   Nom: sweego1._domainkey
   Valeur: sweego1._domainkey.sweego.io
   
   Type: CNAME
   Nom: sweego2._domainkey
   Valeur: sweego2._domainkey.sweego.io
   ```

4. **Vérifier le domaine**
   - Retournez sur le dashboard Sweego
   - Cliquez sur **"Verify domain"**
   - La vérification peut prendre jusqu'à 24-48h

5. **Mettre à jour l'application**
   
   Une fois le domaine vérifié, mettez à jour le code dans `server/services/emailService.ts` :
   
   ```typescript
   // Remplacez cette ligne :
   const fromEmail = 'noreply@sweego.io';
   
   // Par votre domaine vérifié :
   const fromEmail = 'contact@votre-domaine.com';
   // ou
   const fromEmail = 'noreply@votre-domaine.com';
   ```

### Option B : Utiliser le domaine de test Sweego (Pour développement uniquement)

Si vous n'avez pas de domaine, Sweego peut fournir un domaine de test :

1. Contactez le support Sweego via [support@sweego.io](mailto:support@sweego.io)
2. Demandez l'activation d'un domaine de test
3. Utilisez ce domaine dans votre configuration

## 📝 Étape 3 : Tester l'intégration

### Test en ligne de commande

```bash
# Depuis la racine du projet
cd /home/user/webapp
npx tsx test-sweego-email.ts
```

### Test via l'interface web

1. Lancez l'application en local :
   ```bash
   npm run dev
   ```

2. Créez un rendez-vous de test
3. Vérifiez la réception de l'email

### Vérifier les logs

En cas d'erreur, consultez les logs du serveur qui afficheront :
- Les détails de la requête
- Le message d'erreur de l'API Sweego
- Des suggestions de correction

## 🔐 Étape 4 : Configuration de production sur Vercel

### Via l'interface Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez les variables :

```env
SWEEGO_API_KEY=5282eb71-fc1d-4423-ab78-29b4e7e96052
APP_URL=https://webapp-frtjapec0-ikips-projects.vercel.app
```

### Via la CLI Vercel

```bash
# Installer Vercel CLI si nécessaire
npm i -g vercel

# Configurer les variables
vercel env add SWEEGO_API_KEY production
# Entrez: 5282eb71-fc1d-4423-ab78-29b4e7e96052

vercel env add APP_URL production
# Entrez: https://webapp-frtjapec0-ikips-projects.vercel.app

# Redéployer
vercel --prod
```

## 🎨 Étape 5 : Personnaliser les templates d'emails

Les templates se trouvent dans `server/services/emailService.ts` :

### Template de confirmation patient

La fonction `getConfirmationEmailHTML()` génère l'email envoyé au patient avec :
- Date et heure du rendez-vous
- Durée et tarif
- Adresse du cabinet
- Bouton d'annulation

### Template de notification praticien

La fonction dans `sendAppointmentNotificationToPractitioner()` envoie une notification au praticien.

### Personnalisation

Modifiez les templates pour :
- Changer les couleurs (variables CSS dans le `<style>`)
- Ajouter votre logo (ajoutez une balise `<img>`)
- Modifier les textes
- Ajouter des informations supplémentaires

## 🐛 Dépannage

### Erreur : "API Key is not authorized to send emails"

**Cause** : Le domaine d'expédition n'est pas vérifié

**Solution** :
1. Vérifiez que vous avez ajouté et vérifié un domaine dans Sweego
2. Assurez-vous que l'email `from` utilise ce domaine vérifié
3. Attendez jusqu'à 48h pour la propagation DNS

### Erreur : "404 Route Not Found"

**Cause** : Mauvais endpoint API

**Solution** : L'endpoint correct est `https://api.sweego.io/send` (déjà corrigé dans le code)

### Erreur : "Invalid API Key"

**Cause** : Clé API incorrecte ou expirée

**Solution** :
1. Vérifiez la clé dans votre fichier `.env`
2. Générez une nouvelle clé dans le dashboard Sweego
3. Mettez à jour la variable `SWEEGO_API_KEY`

### Les emails ne sont pas reçus

**Vérifications** :
1. Consultez les logs du serveur pour voir si l'envoi a réussi
2. Vérifiez le dossier spam du destinataire
3. Dans le dashboard Sweego, allez à **Logs** pour voir l'historique des envois
4. Vérifiez que votre domaine est bien vérifié et en bon état

## 📊 Monitoring et statistiques

### Dashboard Sweego

Le dashboard Sweego fournit :
- Nombre d'emails envoyés
- Taux de délivrabilité
- Taux d'ouverture
- Taux de clics
- Logs détaillés de chaque envoi

### Webhooks (optionnel)

Configurez des webhooks pour recevoir des notifications sur :
- Email délivré
- Email ouvert
- Lien cliqué
- Email en erreur (bounce)

## 📚 Ressources

- [Documentation officielle Sweego](https://learn.sweego.io)
- [API Reference](https://learn.sweego.io/docs/api-intro)
- [Support Sweego](mailto:support@sweego.io)
- [Tutoriels vidéo](https://www.youtube.com/@sweego)

## ✅ Checklist de mise en production

- [ ] Compte Sweego créé et activé
- [ ] Clé API générée et configurée
- [ ] Domaine d'envoi ajouté et vérifié
- [ ] DNS configurés (CNAME records)
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Templates personnalisés si nécessaire
- [ ] Tests d'envoi réussis
- [ ] Monitoring activé dans le dashboard

## 🎉 Résultat attendu

Une fois tout configuré, voici ce qui se passera :

1. Un utilisateur réserve un rendez-vous
2. L'application envoie automatiquement :
   - Un email de confirmation au patient avec tous les détails
   - Une notification au praticien
3. Les emails sont trackés dans le dashboard Sweego
4. Les utilisateurs reçoivent des emails professionnels et stylés

---

**Dernière mise à jour** : 23 janvier 2026  
**Version** : 2.0  
**Contact** : Pour toute question sur cette configuration
