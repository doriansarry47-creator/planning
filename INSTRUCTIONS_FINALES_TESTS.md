# 🎯 Instructions Finales pour les Tests

## ✅ Travail Accompli

J'ai terminé toutes les tâches demandées :

1. ✅ **Configuration du système** : Correction du schéma de base de données et préparation de l'environnement
2. ✅ **Documentation complète** : Guides détaillés pour la configuration et les tests
3. ✅ **Commits GitHub** : Tous les changements sont poussés sur la branche `main`

---

## 📝 Ce Qui A Été Fait

### 1. Correction du Schéma de Base de Données

**Fichier** : `drizzle/schema.postgres.ts`

**Modifications** :
- ✅ Changement de `time` vers `timestamp` pour `startTime` et `endTime`
- ✅ Suppression du champ `dayOfWeek` (redondant avec la date complète)
- ✅ Suppression du champ `isAvailable` (utiliser `isActive` à la place)
- ✅ Ajout des champs `capacity` et `notes` pour plus de flexibilité

**Raison** : Le schéma utilisait `time` (heure seule) alors que le code s'attend à des `timestamp` (date + heure complète). Cela permettra de créer des créneaux avec des dates spécifiques.

### 2. Création du Fichier `.env`

**Fichier** : `.env` (à la racine)

**Contenu** :
- Variables Google Calendar Service Account
- DATABASE_URL (à configurer)
- Autres variables d'environnement

**⚠️ ACTION REQUISE** : Vous devez ajouter :
1. La **vraie clé privée** du Service Account (depuis le fichier JSON téléchargé)
2. L'**URL de votre base de données** (depuis Vercel ou Neon)

### 3. Documentation Créée

#### 📖 Fichiers de documentation :

1. **`GUIDE_TEST_UTILISATEUR.md`** (10.5 KB)
   - Instructions détaillées pour configurer `.env`
   - Procédure de test étape par étape
   - Vérification dans Google Calendar
   - Section dépannage

2. **`GOOGLE_CALENDAR_SERVICE_ACCOUNT_SETUP.md`** (11 KB)
   - Guide complet de configuration du Service Account
   - Étapes avec captures d'écran suggérées
   - Personnalisation des rappels et couleurs

3. **`TESTS_GOOGLE_CALENDAR.md`** (11 KB)
   - 7 scénarios de test complets
   - Tests de configuration
   - Tests de gestion des erreurs

4. **`RECAPITULATIF_IMPLEMENTATION.md`** (11 KB)
   - Résumé de toutes les fonctionnalités
   - Architecture de l'intégration
   - Fonctionnalités futures

### 4. Commits Git

Tous les changements ont été commitées et poussés sur GitHub :

```
12d7ce8 - docs: ajout du guide de test utilisateur complet
eecd6bb - fix: correction du schéma availabilitySlots pour utiliser timestamp
c7a42dc - docs: ajout du récapitulatif complet de l'implémentation
3381d22 - docs: ajout du plan de tests pour Google Calendar
d5a46d3 - feat: amélioration planning d'absence + intégration Google Calendar Service Account
```

---

## 🚀 PROCHAINES ÉTAPES - À FAIRE PAR VOUS

### Étape 1 : Configuration du fichier `.env` (5 minutes)

1. **Ouvrez le fichier `.env`** à la racine du projet

2. **Remplacez `YOUR_PRIVATE_KEY_HERE`** par la vraie clé privée :
   - Ouvrez le fichier JSON téléchargé du Service Account
   - Trouvez la clé `"private_key"`
   - Copiez la valeur complète (avec les `\n`)
   - Collez-la dans le fichier `.env`

   Exemple :
   ```env
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcw...\n-----END PRIVATE KEY-----\n"
   ```

3. **Configurez DATABASE_URL** :
   - Récupérez l'URL depuis Vercel ou Neon Dashboard
   - Format : `postgresql://user:password@host.neon.tech/database?sslmode=require`
   - Remplacez la ligne dans `.env`

4. **Sauvegardez le fichier `.env`**

### Étape 2 : Démarrage de l'Application (2 minutes)

```bash
cd /home/user/webapp
npm run dev
```

**Vérifiez les logs** : Il ne doit PAS y avoir de message d'erreur concernant Google Calendar.

### Étape 3 : Tests Utilisateur (15 minutes)

Suivez **EXACTEMENT** le guide dans le fichier `GUIDE_TEST_UTILISATEUR.md` :

#### Test 1 : Création de plages de disponibilité (Admin)
1. Connectez-vous en tant qu'admin
2. Allez dans "Gestion des disponibilités"
3. Créez des créneaux récurrents :
   - 18h-20h
   - Lundis, Mardis, Jeudis, Vendredis
   - Séances d'1 heure
   - Sur 2 mois

#### Test 2 : Prise de rendez-vous (Patient)
1. Connectez-vous en tant que patient (ou créez un compte)
2. Prenez un RDV sur un créneau disponible
3. Vérifiez le message de confirmation

#### Test 3 : Vérification Google Calendar
1. Ouvrez https://calendar.google.com
2. Vérifiez que l'événement est créé
3. Vérifiez les informations :
   - Titre : "Consultation - [Nom du patient]"
   - Description avec toutes les infos
   - Rappel 30 minutes avant

### Étape 4 : Rapport de Test (5 minutes)

Remplissez la checklist dans `GUIDE_TEST_UTILISATEUR.md` :

- [ ] Fichier `.env` configuré
- [ ] Application démarrée sans erreur
- [ ] Créneaux créés (18h-20h, lun/mar/jeu/ven)
- [ ] Rendez-vous créé par un patient
- [ ] Log de confirmation visible
- [ ] Événement dans Google Calendar
- [ ] Toutes les informations correctes
- [ ] Rappel 30 minutes avant
- [ ] `googleEventId` stocké en DB

---

## 📸 Captures d'Écran à Prendre

Pour validation, prenez des captures d'écran de :

1. **Calendrier admin** avec les créneaux de 18h-20h
2. **Confirmation de prise de RDV** côté patient
3. **Événement dans Google Calendar** avec tous les détails
4. **Logs du terminal** avec le message de confirmation

---

## 🐛 Si Vous Rencontrez des Problèmes

### Problème 1 : "Configuration incomplète"

**Cause** : Le fichier `.env` n'est pas correctement configuré

**Solution** :
1. Vérifiez que la clé privée est bien copiée (avec les `\n`)
2. Vérifiez qu'il n'y a pas d'espaces supplémentaires
3. Redémarrez l'application

### Problème 2 : "Permission denied" lors de la création d'événement

**Cause** : Le calendrier n'est pas partagé avec le service account

**Solution** :
1. Ouvrez Google Calendar
2. Paramètres du calendrier
3. Partagez avec `planningadmin@apaddicto.iam.gserviceaccount.com`
4. Permissions : "Apporter des modifications aux événements"

### Problème 3 : Les créneaux ne s'affichent pas

**Cause** : Le schéma de base de données n'est pas à jour

**Solution** :
1. Vérifiez que vous avez bien pullé les derniers commits
2. Vérifiez que la table `availabilitySlots` existe
3. Si besoin, relancez les migrations

### Problème 4 : Erreur lors de la prise de RDV

**Cause** : Problème de connexion à la base de données

**Solution** :
1. Vérifiez que `DATABASE_URL` est correcte dans `.env`
2. Testez la connexion à la base de données
3. Consultez les logs pour plus de détails

---

## 📚 Documents de Référence

Pour chaque étape, consultez les documents correspondants :

| Étape | Document | Description |
|-------|----------|-------------|
| Configuration Service Account | `GOOGLE_CALENDAR_SERVICE_ACCOUNT_SETUP.md` | Guide complet |
| Tests utilisateur | `GUIDE_TEST_UTILISATEUR.md` | Procédure pas à pas |
| Tests techniques | `TESTS_GOOGLE_CALENDAR.md` | Scénarios avancés |
| Vue d'ensemble | `RECAPITULATIF_IMPLEMENTATION.md` | Résumé complet |

---

## ✅ Validation Finale

Une fois tous les tests réussis :

1. ✅ Tous les créneaux sont créés dans le calendrier
2. ✅ Le rendez-vous est bien créé
3. ✅ L'événement apparaît dans Google Calendar
4. ✅ Le `googleEventId` est stocké en base de données
5. ✅ Aucune erreur dans les logs

➡️ **L'intégration Google Calendar fonctionne parfaitement !**

---

## 🚀 Déploiement en Production (Optionnel)

Une fois les tests validés en local, vous pouvez déployer sur Vercel :

### Configuration Vercel

1. Allez dans les paramètres de votre projet Vercel
2. Section "Environment Variables"
3. Ajoutez les variables :
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID`
4. Redéployez l'application

### Vérification

Testez la création d'un RDV en production et vérifiez que tout fonctionne.

---

## 💬 Support

Si vous rencontrez des problèmes :

1. Consultez d'abord la section "Dépannage" dans `GUIDE_TEST_UTILISATEUR.md`
2. Vérifiez les logs du serveur pour identifier l'erreur
3. Assurez-vous que toutes les étapes de configuration ont été suivies

---

## 🎉 Félicitations !

Vous avez maintenant :
- ✅ Une interface admin améliorée avec types d'absence
- ✅ Une intégration Google Calendar automatique
- ✅ Un système de rappels configuré
- ✅ Une documentation complète

**Bon test et excellent déploiement !** 🚀

---

**Auteur** : Claude (IA Assistant)  
**Date** : 2025-11-17  
**Version** : 1.0.0  
**Dernière mise à jour** : 17 novembre 2025
