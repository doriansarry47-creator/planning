# 📋 Instructions : Synchroniser vos rendez-vous avec Google Calendar

## 🎯 Objectif

Ce guide vous explique comment synchroniser tous vos rendez-vous de la base de données vers Google Calendar en une seule commande.

## ⚡ Solution rapide (TL;DR)

```bash
npm run sync:appointments
```

Cette commande va automatiquement :
1. ✅ Trouver tous les rendez-vous non synchronisés
2. ✅ Les créer dans votre Google Calendar
3. ✅ Mettre à jour la base de données avec les IDs Google Calendar

## 📝 Instructions détaillées

### Étape 1 : Vérifier la configuration

Avant de lancer la synchronisation, assurez-vous que Google Calendar est configuré dans votre fichier `.env` :

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=votre-service-account@projet.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com
```

**Comment vérifier ?**
```bash
# Afficher les variables (masque les clés sensibles)
grep GOOGLE .env
```

### Étape 2 : Lancer la synchronisation

Dans le terminal, à la racine du projet :

```bash
npm run sync:appointments
```

### Étape 3 : Vérifier les résultats

Le script affichera un rapport détaillé :

```
🔄 Synchronisation des rendez-vous vers Google Calendar...

✅ Connexion à la base de données établie
✅ Service Google Calendar connecté

📊 15 rendez-vous non synchronisés trouvés

📅 Synchronisation du rendez-vous #1
   Patient: Jean Dupont
   Date: 2024-12-15T09:00:00.000Z
   ✅ Synchronisé avec succès (Event ID: abc123xyz)

...

============================================================
📊 RÉSUMÉ DE LA SYNCHRONISATION
============================================================
Total rendez-vous traités : 15
✅ Synchronisés avec succès : 15
❌ Échecs : 0
============================================================

✅ Synchronisation terminée avec succès !
💡 Conseil : Vérifiez votre Google Calendar pour voir les nouveaux événements
```

### Étape 4 : Vérifier dans Google Calendar

1. Ouvrez [Google Calendar](https://calendar.google.com/)
2. Cherchez les événements avec l'emoji 🏥
3. Format des événements : `🏥 RDV - Nom du Patient`

## 🔍 Comprendre le problème

### Pourquoi certains rendez-vous ne sont pas synchronisés ?

Cela arrive dans 3 cas :

1. **Rendez-vous créés avant la configuration de Google Calendar**
   - Ces rendez-vous ont un ID local : `local_1234567890_abc`
   - Ils ne sont pas dans Google Calendar

2. **Rendez-vous créés manuellement dans la BD**
   - Créés via scripts SQL ou interface admin
   - Pas de passage par le flux de réservation standard

3. **Échecs temporaires de synchronisation**
   - Problèmes réseau lors de la création
   - Configuration Google Calendar incomplète

### Comment le script résout le problème

Le script :
1. 🔍 Cherche tous les rendez-vous avec :
   - `googleEventId` vide (`NULL`)
   - OU `googleEventId` commençant par `local_`

2. 📤 Pour chaque rendez-vous trouvé :
   - Crée l'événement dans Google Calendar
   - Récupère le vrai ID Google Calendar
   - Met à jour la base de données

3. ✅ Résultat :
   - Tous les rendez-vous ont un `googleEventId` valide
   - Tous les rendez-vous apparaissent dans Google Calendar

## 🆘 En cas de problème

### Erreur : "Service Google Calendar non disponible"

**Cause :** Variables d'environnement manquantes

**Solution :**
1. Vérifiez votre fichier `.env`
2. Assurez-vous que ces 3 variables sont définies :
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID`
3. Redémarrez le serveur si nécessaire

### Erreur : "Base de données non disponible"

**Cause :** Variable `DATABASE_URL` manquante

**Solution :**
1. Vérifiez que `DATABASE_URL` est dans `.env`
2. Format : `postgresql://user:password@host:port/database`

### Certains rendez-vous échouent

**Symptôme :** Le rapport montre des échecs

**Causes possibles :**
- Dates invalides
- Email patient manquant ou invalide
- Problème de connexion à Google Calendar

**Solution :**
1. Consultez les détails de l'erreur dans les logs
2. Corrigez les données dans la base de données
3. Relancez le script

### Aucun rendez-vous non synchronisé trouvé

**Symptôme :** `0 rendez-vous non synchronisés trouvés`

**Signification :** ✅ Tous vos rendez-vous sont déjà synchronisés !

Si vous pensez que ce n'est pas le cas :
1. Vérifiez dans Google Calendar
2. Vérifiez les `googleEventId` dans la base de données :
   ```sql
   SELECT id, customerName, startTime, googleEventId 
   FROM appointments 
   LIMIT 10;
   ```

## 📊 Vérification manuelle

### Vérifier dans la base de données

Rendez-vous non synchronisés :
```sql
SELECT id, customerName, startTime, googleEventId 
FROM appointments 
WHERE googleEventId IS NULL 
   OR googleEventId LIKE 'local_%';
```

Rendez-vous synchronisés :
```sql
SELECT id, customerName, startTime, googleEventId 
FROM appointments 
WHERE googleEventId IS NOT NULL 
  AND googleEventId NOT LIKE 'local_%';
```

### Compter les rendez-vous

```sql
-- Total des rendez-vous
SELECT COUNT(*) as total FROM appointments;

-- Rendez-vous synchronisés
SELECT COUNT(*) as synchronises 
FROM appointments 
WHERE googleEventId IS NOT NULL 
  AND googleEventId NOT LIKE 'local_%';

-- Rendez-vous non synchronisés
SELECT COUNT(*) as non_synchronises 
FROM appointments 
WHERE googleEventId IS NULL 
   OR googleEventId LIKE 'local_%';
```

## 🎯 Bonnes pratiques

### Prévention

1. **Toujours utiliser le flux de réservation standard**
   - L'API `bookAppointment` gère automatiquement la synchronisation
   - Ne créez pas de rendez-vous directement en SQL

2. **Vérifier la configuration Google Calendar**
   - Avant de créer des rendez-vous
   - Tester avec la commande de health check

3. **Synchronisation régulière**
   - Lancez `npm run sync:appointments` une fois par semaine
   - En cas de doute sur la synchronisation

4. **Surveiller les logs**
   - Recherchez les erreurs avec `[BookingRouter]`
   - Vérifiez que chaque rendez-vous a bien son `googleEventId`

### Maintenance

**Hebdomadaire :**
```bash
npm run sync:appointments
```

**Mensuel :**
- Vérifier le nombre de rendez-vous synchronisés
- Nettoyer les anciens rendez-vous (si nécessaire)

## 📚 Documentation complète

Pour plus de détails techniques, consultez :
- 📖 [SYNC_APPOINTMENTS_FIX.md](./SYNC_APPOINTMENTS_FIX.md) - Documentation technique complète
- 📖 [GOOGLE_CALENDAR_SYNC.md](./GOOGLE_CALENDAR_SYNC.md) - Configuration Google Calendar

## 💡 Astuce

Vous pouvez relancer le script autant de fois que vous voulez :
- Les rendez-vous déjà synchronisés sont ignorés
- Seuls les nouveaux rendez-vous non synchronisés sont traités
- Aucun risque de doublon !

---

**Besoin d'aide ?** Consultez les logs du script ou la documentation technique.

**Date de création** : 2024-12-13  
**Version** : 1.0.0
