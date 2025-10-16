# 🔓 Guide d'Accès à l'Application Vercel

## ⚠️ Problème Actuel

L'application est protégée par **Vercel Deployment Protection** (SSO).  
Cela signifie qu'elle nécessite une authentification Vercel pour être accessible.

**URL actuelle** : https://webapp-retng02kz-ikips-projects.vercel.app  
**Statut** : 🔒 Protégé par SSO

## ✅ Solutions pour Rendre l'Application Publique

### Option 1 : Désactiver la Protection de Déploiement (RECOMMANDÉ)

1. **Aller sur le Dashboard Vercel** :  
   https://vercel.com/ikips-projects/webapp/settings/deployment-protection

2. **Désactiver la protection** :
   - Cliquer sur "Deployment Protection"
   - Sélectionner "Protect Development Deployments" au lieu de "Protect All Deployments"
   - OU désélectionner complètement la protection
   - Cliquer sur "Save"

3. **Redéployer** (optionnel) :
   ```bash
   npx vercel --prod --token VWMcm9MIiegjohDNlFYGpFyQ
   ```

### Option 2 : Utiliser un Token de Bypass

Si vous souhaitez garder la protection mais y accéder temporairement :

1. **Obtenir le token de bypass** :
   - Aller sur https://vercel.com/ikips-projects/webapp/settings/deployment-protection
   - Copier le "Bypass Token"

2. **Accéder avec le token** :
   ```
   https://webapp-retng02kz-ikips-projects.vercel.app?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=VOTRE_TOKEN
   ```

### Option 3 : Utiliser un Domaine Personnalisé

Un domaine personnalisé peut contourner certaines protections :

1. **Ajouter un domaine** :
   - Aller sur https://vercel.com/ikips-projects/webapp/settings/domains
   - Ajouter votre domaine personnalisé
   - Suivre les instructions de configuration DNS

2. **Accéder via le domaine** :
   - Le domaine personnalisé sera accessible publiquement

## 🎯 Action Recommandée

**Pour un accès public immédiat** :

1. Se connecter sur Vercel : https://vercel.com
2. Aller dans le projet : https://vercel.com/ikips-projects/webapp
3. Settings → Deployment Protection
4. Choisir "Protect Development Deployments Only" ou désactiver
5. Sauvegarder

L'application sera alors accessible publiquement à l'adresse :  
**https://webapp-retng02kz-ikips-projects.vercel.app**

## 📊 État Actuel du Déploiement

- ✅ Code corrigé et déployé
- ✅ Variables d'environnement configurées
- ✅ Base de données connectée
- ✅ Admin configuré (doriansarry@yahoo.fr / admin123)
- 🔒 Protection SSO activée (à désactiver pour accès public)

## 🔗 Liens Utiles

- **Dashboard Vercel** : https://vercel.com/ikips-projects/webapp
- **Settings Protection** : https://vercel.com/ikips-projects/webapp/settings/deployment-protection
- **Settings Domains** : https://vercel.com/ikips-projects/webapp/settings/domains
- **Documentation Vercel** : https://vercel.com/docs/deployment-protection

## 🚀 Une Fois la Protection Désactivée

Vous pourrez :
1. Accéder à l'application directement
2. Vous connecter avec doriansarry@yahoo.fr / admin123
3. Utiliser toutes les fonctionnalités de l'application
4. Créer des rendez-vous et gérer les patients

---

**Note** : La protection de déploiement est utile pour les environnements de développement  
mais doit être désactivée pour les applications en production destinées au public.
