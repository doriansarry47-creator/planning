# 🚀 Guide d'Utilisation - Application de Planning

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration initiale](#configuration-initiale)
3. [Créer des créneaux de disponibilité](#créer-des-créneaux-de-disponibilité)
4. [Tester l'application](#tester-lapplication)
5. [Vérifier les rendez-vous](#vérifier-les-rendez-vous)
6. [Résolution des problèmes](#résolution-des-problèmes)

---

## 🎯 Vue d'ensemble

Votre application de planning est maintenant **100% fonctionnelle** avec Google Calendar !

### Ce qui fonctionne :

- ✅ Création automatique de créneaux de disponibilité dans Google Calendar
- ✅ Réservation de rendez-vous par les patients
- ✅ Envoi automatique des rendez-vous dans votre Google Calendar
- ✅ Masquage automatique des créneaux déjà réservés
- ✅ Notifications par email au praticien (vous)
- ✅ Récupération en temps réel des créneaux disponibles

---

## ⚙️ Configuration Initiale

### 1. Vérifier la Configuration Google Calendar

Exécutez ce script pour vérifier que tout est bien configuré :

```bash
cd /home/user/webapp
npx tsx --env-file .env scripts/test-google-calendar.ts
```

**Résultat attendu** :
```
✅ SUCCÈS: Google Calendar est correctement configuré!
```

Si vous voyez des erreurs, vérifiez :
- Le fichier `.env` contient bien les bonnes credentials
- Le calendrier est partagé avec le service account : `planningadmin@apaddicto.iam.gserviceaccount.com`
- L'API Google Calendar est activée dans Google Cloud Console

---

## 📅 Créer des Créneaux de Disponibilité

### Option 1 : Script Rapide (Recommandé pour les tests)

Créez 15 créneaux de test (3 par jour pour 5 jours) :

```bash
cd /home/user/webapp
npx tsx --env-file .env scripts/create-test-slots.ts
```

**Résultat** :
```
✅ Créneaux créés: 15
❌ Erreurs: 0
```

Les créneaux seront créés aux horaires suivants (jours ouvrables uniquement) :
- 09:00-10:00
- 14:00-15:00
- 16:00-17:00

---

### Option 2 : Script de Synchronisation Personnalisé

Pour créer des créneaux sur une longue période (ex: 3 mois) :

```bash
cd /home/user/webapp
npm run sync:availability
```

**Configuration par défaut** :
- Période : 3 mois
- Horaires : 9h00 - 18h00
- Jours : Lundi au vendredi
- Durée : 60 minutes par créneau

Pour personnaliser, éditez le fichier `scripts/sync-availability.ts` :

```typescript
const config = {
  startDate: new Date(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 mois
  workingHours: {
    start: '08:00',  // Changez l'heure de début
    end: '20:00',    // Changez l'heure de fin
  },
  daysOfWeek: [1, 2, 3, 4, 5, 6], // Lundi au samedi
  slotDuration: 30, // 30 minutes par créneau
};
```

---

## 🧪 Tester l'Application

### Test Automatique Complet

Testez tout le processus de réservation :

```bash
cd /home/user/webapp
npx tsx --env-file .env scripts/test-booking.ts
```

**Ce script va** :
1. Récupérer tous les créneaux disponibles
2. Réserver automatiquement le premier créneau
3. Vérifier que le créneau a été masqué
4. Afficher un rapport détaillé

**Résultat attendu** :
```
✅ SUCCÈS: Rendez-vous réservé!
   ID de l'événement: [ID Google Calendar]
✅ Le créneau réservé a bien été masqué!
```

---

### Test Manuel via l'Application Web

1. **Démarrer le serveur** :
   ```bash
   cd /home/user/webapp
   npm run dev
   ```

2. **Accéder à l'application** :
   - Local : http://localhost:5173
   - Sandbox : https://5000-ihtag1llt5bimaote35uf-dfc00ec5.sandbox.novita.ai

3. **Naviguer vers la page de réservation** :
   - Cliquez sur "Réserver un rendez-vous"
   - Sélectionnez une date
   - Choisissez un créneau horaire disponible

4. **Remplir le formulaire** :
   - Nom complet
   - Email
   - Téléphone (optionnel)
   - Motif de la consultation

5. **Confirmer la réservation** :
   - Cliquez sur "Réserver"
   - Attendez la confirmation

6. **Vérification** :
   - Le créneau ne doit plus apparaître comme disponible
   - Vérifiez dans Google Calendar que le RDV apparaît
   - Vérifiez vos emails (doriansarry47@gmail.com)

---

## 🔍 Vérifier les Rendez-vous

### Dans Google Calendar

1. Ouvrez https://calendar.google.com/
2. Connectez-vous avec : **doriansarry47@gmail.com**
3. Vous devriez voir :
   - 🟢 **Créneaux verts** : Disponibilités (transparents)
   - 🔵 **Événements bleus** : Rendez-vous réservés (opaques)

**Format des rendez-vous** :
```
🏥 RDV - [Nom du patient]

📋 Rendez-vous avec [Nom du patient]
📧 Email: [Email du patient]
📱 Téléphone: [Téléphone du patient]
💬 Motif: [Raison de la consultation]
🔑 Code d'annulation: [Hash unique]
```

---

### Dans vos Emails

Vous recevrez un email pour chaque nouveau rendez-vous :

**Sujet** : `Nouveau rendez-vous - [Nom] le [Date]`

**Contenu** :
- Nom et coordonnées du patient
- Date et heure du rendez-vous
- Motif de la consultation
- Possibilité de répondre directement au patient

---

## 🚨 Résolution des Problèmes

### Problème : Aucun créneau n'apparaît

**Cause** : Pas de créneaux créés dans Google Calendar

**Solution** :
```bash
npx tsx --env-file .env scripts/create-test-slots.ts
```

---

### Problème : Erreur 401 ou 403 lors de la réservation

**Cause** : Problème d'authentification Google Calendar

**Solutions** :
1. Vérifiez que le calendrier est partagé avec le service account
2. Vérifiez que l'API Google Calendar est activée
3. Testez la connexion :
   ```bash
   npx tsx --env-file .env scripts/test-google-calendar.ts
   ```

---

### Problème : Les créneaux réservés apparaissent toujours

**Cause** : Cache du navigateur ou synchronisation lente

**Solutions** :
1. Rafraîchissez la page (F5 ou Ctrl+R)
2. Videz le cache du navigateur
3. Attendez 30 secondes et réessayez
4. Vérifiez dans Google Calendar que le RDV est bien créé

---

### Problème : Pas d'email reçu

**Cause** : Resend en mode test (emails limités au praticien)

**Solutions** :
1. **Pour les emails au praticien** : Vérifiez vos spams (doriansarry47@gmail.com)
2. **Pour les emails aux patients** : Nécessite un domaine vérifié sur Resend
   - Allez sur https://resend.com/domains
   - Ajoutez votre domaine (ex: votresite.com)
   - Configurez les enregistrements DNS
   - Modifiez le `from` dans `server/services/emailService.ts`

---

### Problème : Le serveur ne démarre pas

**Cause** : Dépendances manquantes ou port occupé

**Solutions** :
1. Réinstallez les dépendances :
   ```bash
   cd /home/user/webapp
   npm install
   ```

2. Vérifiez que le port 5000 n'est pas utilisé :
   ```bash
   lsof -i :5000
   ```

3. Changez le port si nécessaire dans `server/_core/index.ts`

---

## 📞 Support

Pour toute question ou problème :

1. **Consultez les logs du serveur** : Très détaillés pour le débogage
2. **Vérifiez le rapport de tests** : `RAPPORT_TESTS_CALENDAR.md`
3. **Relisez la documentation** : `GOOGLE_CALENDAR_SYNC.md`
4. **Testez avec les scripts** : Ils vous diront exactement ce qui ne va pas

---

## 🎯 Checklist Quotidienne

Pour utiliser l'application au quotidien :

- [ ] Démarrer le serveur : `npm run dev`
- [ ] Vérifier les nouveaux rendez-vous dans Google Calendar
- [ ] Vérifier les emails de notification
- [ ] Créer de nouveaux créneaux si nécessaire : `npm run sync:availability`
- [ ] Surveiller les logs du serveur pour détecter les problèmes

---

## 🚀 Déploiement en Production

Une fois prêt pour la production :

1. **Vérifiez un domaine sur Resend** pour les emails aux patients
2. **Configurez les variables d'environnement** sur Vercel
3. **Déployez** : Les changements sont déjà pushés sur GitHub
4. **Testez** l'application en production avec de vrais patients

---

## 📚 Ressources Utiles

- **Pull Request** : https://github.com/doriansarry47-creator/planning/pull/35
- **Rapport de Tests** : `RAPPORT_TESTS_CALENDAR.md`
- **Documentation Google Calendar** : `GOOGLE_CALENDAR_SYNC.md`
- **Google Calendar** : https://calendar.google.com/
- **Resend Dashboard** : https://resend.com/

---

**Votre application est maintenant prête à être utilisée !** 🎉

Si vous avez des questions, consultez les fichiers de documentation ou exécutez les scripts de test pour diagnostiquer les problèmes.
