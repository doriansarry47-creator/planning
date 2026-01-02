# 🚀 Guide Rapide : Corriger "0 créneaux disponibles" sur Vercel

## ⏱️ Temps estimé : 5 minutes

## 🎯 Problème

Votre application fonctionne **parfaitement en local** mais affiche **"0 créneaux disponibles"** sur Vercel.

**Cause** : Les variables d'environnement Google Calendar ne sont pas configurées sur Vercel.

## ✅ Solution en 3 Étapes

### Étape 1 : Aller sur Vercel (1 min)

1. Ouvrez https://vercel.com/
2. Connectez-vous
3. Cliquez sur votre projet **"planning"** ou **"webapp"**
4. Cliquez sur **"Settings"** (dans le menu du haut)
5. Cliquez sur **"Environment Variables"** (dans le menu de gauche)

### Étape 2 : Ajouter les 3 Variables (3 min)

Pour chaque variable ci-dessous, cliquez sur **"Add New"** :

#### Variable 1/3 : GOOGLE_SERVICE_ACCOUNT_EMAIL

```
Nom: GOOGLE_SERVICE_ACCOUNT_EMAIL
Valeur: planningadmin@apaddicto.iam.gserviceaccount.com
Environnement: ☑ Production ☑ Preview ☑ Development
```

Cliquez sur **"Save"**

---

#### Variable 2/3 : GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

```
Nom: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
Valeur: 
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC466s/UvpWfdv2
kcCX2jzeshNKCPr2B0ZWLgK8rKOU1V8pShF1H5iZhLDxJohfbNrx8fR9cBTYEGD8
8exLG14M92RtJ8J68TyO9YZg5+AggPMpBeQgyPI4YPyzArjV1KmNFpsocBpB1OLU
D6VrS61LeGgKas9hk1OiwwtLjercBvESSE98474b//MCGHoA3LgjhuDGL8MrGjwI
/EApDVyDd8Z8G8eV12Tu4kaXqFZjf1+/twUJhIwteLDYNmahW27XlgvQs8J1vNzA
x+2Qr5NDWyaVAr0PPCDe/S+rXdTL3rXGA5zYiCg1MOOuCUtYPrihZv86Bg/7OfkC
JeBlzccvAgMBAAECggEAWTJ0O+tOjYHQJDNR7u16BwFmhIOoahxANTmkYFX14ci6
SjRMD27aMNLsdqXbigv74FCRWiBCLaZY4infjKr6xs5eRriy+pJ6X4rW8s9mMMeC
gvswew/ypndB7ScW+S3HSyLoXK0WPULu1tNlO0gZoxnFNaEnvy1NXmkufZdK/i4X
7SfDDfBtI/E0nKcEoNoYojoB3W6TW0x0ipo4qiSUU7EP8yxCo40Az1+s04boHWYU
E2vHtx1qc+HH7S2Xe8KpgiouqDufUkC+1Wp2rvEeEf/b3fSjg7cSggzz8bHkYQIN
4UgP2dWivBloxyFPKQ5E7OWqe+1t/OvrFpa5pzA5oQKBgQDx7Su4Dgv4TNdxXHUE
gGxCii0G55Y6YC/uoEzu0vyiup/VWIp0ep6Ahq6IsY4jh+gHWKHBnQjC1dTNnZmd
aEB0v3ECFsL4Szdmi/0pcPxphCwBrkCpRdvARdK1FiJf0ziqiLNNc4G4jgv2LcGL
VYLvxVWQssHDEjv57W4/dBdTfQKBgQDDrY1yO3jejeZz/p/aX7NWoQG1qLHSkXO2
ubWLBlYwLYqXR43oogLsRoJ8qpEM9K2FvYpexa8dx569HHFG9fhfBgHaUO/rMQgg
FriXzJTmaM82zMZn8K4qsAoifE6ucehLzbzAfqsNMn8quBN7Yjc/8TMXxIWvl4JJ
0rfzXkctGwKBgQDiXA9z/3CjuwI6R1AWDjM9bxwCQd4GcMlodQSG0VMgz42NiXLC
2ZhEmb/kln1wMVGgzgVLqyrvYjPiz3tUFJ96nUWXtsRmnboQcRtHEziZYdnrGKfX
uk2K8cndNgCjuHZk2dMqvNC7Ze07QkS9oh0JS5Jr+VXit8T2bHmjVXQd4QKBgFSd
EIPr6Zk6/QL9gLwaE9+K4cVeu/4UvVevOCx0wgI1Py+pVljY7bCj0Lr9uplCmGIz
ksjmbJHRBvg5e1Y2+H6Gh3iS9RvbaOsPSCUD5wM3IRtOMyEw9u8ojklZPWC7irp0
rYEDhQ3A3zJmxK3ey4tPzkshxLkoJ8OqZbbL9rUvAoGBAI+lcG08Ji7I+uTIyWy+
H8+gHLRrkmaHGBrimuauduav/dMHbuOcAa6ctKgYL5HWfpZOJiN0mFgObO+qHVG2
5vpBQGIaES555WGLcEK9I0HVW9TKtcnsL/s1mPr+4nVGN4Np8aLQy3GrShKJzEya
AQr9mE9XwRq/DgmC1DQMJXBc
-----END PRIVATE KEY-----

Environnement: ☑ Production ☑ Preview ☑ Development
```

⚠️ **IMPORTANT** : Copiez-collez toute la clé **AVEC** les retours à la ligne (du `-----BEGIN` jusqu'au `-----END`)

Cliquez sur **"Save"**

---

#### Variable 3/3 : GOOGLE_CALENDAR_ID

```
Nom: GOOGLE_CALENDAR_ID
Valeur: doriansarry47@gmail.com
Environnement: ☑ Production ☑ Preview ☑ Development
```

Cliquez sur **"Save"**

---

#### Variables Additionnelles (Optionnel mais Recommandé)

Si ce n'est pas déjà fait, ajoutez aussi :

**DATABASE_URL** (pour la base de données)
```
postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**RESEND_API_KEY** (pour les emails)
```
re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd
```

**APP_URL** (URL de votre application)
```
https://webapp-frtjapec0-ikips-projects.vercel.app
```

### Étape 3 : Redéployer (1 min)

Deux options :

#### Option A : Via l'Interface Vercel (Plus simple)
1. Restez sur Vercel
2. Allez dans **"Deployments"**
3. Cliquez sur les **3 points** (⋯) du dernier déploiement
4. Cliquez sur **"Redeploy"**
5. Confirmez

#### Option B : Via Terminal
```bash
vercel --prod
```

### ✅ Vérification

Après 1-2 minutes, allez sur votre site :
```
https://webapp-frtjapec0-ikips-projects.vercel.app
```

Essayez de réserver un rendez-vous. Vous devriez maintenant voir les créneaux disponibles !

## 🎯 Résultat Attendu

Après la configuration :
- ✅ Les créneaux disponibles s'affichent (ex: "09:00", "10:00", etc.)
- ✅ Vous pouvez réserver un rendez-vous
- ✅ Le rendez-vous apparaît dans Google Calendar
- ✅ Le rendez-vous est enregistré dans la base de données
- ✅ Un email de confirmation est envoyé

## 🐛 Si ça ne fonctionne toujours pas

### Vérification 1 : Variables bien ajoutées ?
1. Allez sur Vercel → Votre projet → Settings → Environment Variables
2. Vérifiez que les 3 variables apparaissent :
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID`

### Vérification 2 : Bien redéployé ?
1. Allez sur Vercel → Votre projet → Deployments
2. Le déploiement le plus récent doit être **après** l'ajout des variables

### Vérification 3 : Clé privée correcte ?
La variable `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` doit :
- Commencer par `-----BEGIN PRIVATE KEY-----`
- Finir par `-----END PRIVATE KEY-----`
- Contenir plusieurs lignes de caractères aléatoires entre les deux

### Vérification 4 : Google Calendar partagé ?
1. Ouvrez https://calendar.google.com/
2. Allez dans les paramètres de votre calendrier
3. Vérifiez que `planningadmin@apaddicto.iam.gserviceaccount.com` a accès

## 📞 Support

Si le problème persiste :

1. **Vérifiez les logs Vercel** :
   - Allez sur vercel.com
   - Cliquez sur votre projet
   - Allez dans "Logs"
   - Cherchez les erreurs contenant "Google" ou "Calendar"

2. **Testez en local** :
   ```bash
   npm run diagnose:calendar
   ```
   Ça doit afficher "✅ TOUT FONCTIONNE CORRECTEMENT"

3. **Regardez la documentation complète** : `AUDIT_ET_SOLUTION.md`

## ⚙️ Alternative : Script Automatique

Si vous préférez utiliser la ligne de commande :

```bash
# Dans le dossier du projet
./scripts/setup-vercel-env.sh
```

Ce script configurera automatiquement toutes les variables sur Vercel.

---

**Temps total** : ~5 minutes  
**Difficulté** : ⭐ Facile  
**Résultat** : ✅ Application fonctionnelle sur Vercel
