# 🗄️ Configuration de la Base de Données PostgreSQL

## Connexion PostgreSQL Fournie

```
postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Détails de connexion

- **Host**: `ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech`
- **Port**: `5432` (par défaut PostgreSQL)
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Password**: `npg_1zDVUWYjNB4s`
- **SSL Mode**: `require`
- **Channel Binding**: `require`

## 🚀 Initialisation Rapide (Méthode Recommandée)

### Via psql en ligne de commande

```bash
# Exécuter le script d'initialisation
psql "postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" -f init-db.sql
```

Si psql n'est pas installé:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

## 📱 Interface Web Neon (Plus Simple)

### Étape 1: Connexion à Neon Console

1. Ouvrir https://console.neon.tech
2. Se connecter avec votre compte
3. Sélectionner votre projet

### Étape 2: Ouvrir le SQL Editor

1. Dans le menu latéral, cliquer sur **SQL Editor**
2. Vous verrez un éditeur de requêtes SQL

### Étape 3: Exécuter le script

1. Ouvrir le fichier `init-db.sql` dans un éditeur de texte
2. Copier tout le contenu (Ctrl+A, Ctrl+C)
3. Coller dans le SQL Editor de Neon (Ctrl+V)
4. Cliquer sur **Run** ou appuyer sur Ctrl+Enter
5. Attendre la confirmation d'exécution

### Étape 4: Vérification

Exécuter cette requête pour vérifier que les tables sont créées:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Vous devriez voir:
- admins
- appointments
- availability_slots
- notes
- patients
- unavailabilities

## 🖥️ Via Client PostgreSQL (DBeaver, pgAdmin, etc.)

### DBeaver (Recommandé - Gratuit et Multi-plateforme)

1. **Télécharger DBeaver**: https://dbeaver.io/download/
2. **Créer une nouvelle connexion**:
   - Cliquer sur "New Database Connection"
   - Sélectionner "PostgreSQL"
   - Cliquer "Next"

3. **Configurer la connexion**:
   ```
   Host: ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech
   Port: 5432
   Database: neondb
   Username: neondb_owner
   Password: npg_1zDVUWYjNB4s
   ```

4. **Configuration SSL**:
   - Aller dans l'onglet "SSL"
   - Cocher "Use SSL"
   - Mode SSL: "require"
   - Cocher "Verify server certificate" (décocher si erreur)

5. **Tester la connexion**:
   - Cliquer sur "Test Connection"
   - Si OK, cliquer sur "Finish"

6. **Exécuter le script**:
   - Clic droit sur la connexion → SQL Editor → Open SQL Script
   - Ouvrir le fichier `init-db.sql`
   - Appuyer sur Ctrl+Enter ou cliquer sur "Execute"

### pgAdmin (Alternative)

1. **Télécharger pgAdmin**: https://www.pgadmin.org/download/
2. **Ajouter un serveur**:
   - Clic droit sur "Servers" → Create → Server
   - Onglet "General": Nom = "Neon Medical App"
   - Onglet "Connection":
     ```
     Host: ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech
     Port: 5432
     Maintenance database: neondb
     Username: neondb_owner
     Password: npg_1zDVUWYjNB4s
     ```
   - Onglet "SSL": Mode = "require"
   - Cliquer "Save"

3. **Exécuter le script**:
   - Naviguer: Servers → Neon Medical App → Databases → neondb
   - Cliquer sur "Query Tool"
   - Ouvrir le fichier `init-db.sql`
   - Cliquer sur Execute (F5)

## 📝 Contenu du Script d'Initialisation

Le script `init-db.sql` effectue les actions suivantes:

### 1. Création des tables

✅ **admins** - Comptes administrateurs avec sécurité renforcée
✅ **patients** - Profils patients avec questionnaire médical
✅ **appointments** - Système de rendez-vous complet
✅ **availability_slots** - Gestion des créneaux horaires
✅ **notes** - Notes de suivi thérapeutique
✅ **unavailabilities** - Gestion des congés

### 2. Données initiales

✅ **Compte admin par défaut**:
- Email: `admin@example.com`
- Mot de passe: `admin123`
- Rôle: `super_admin`

✅ **Créneaux de test** (6 créneaux sur 2 jours):
- Demain: 09:00, 10:00, 14:00, 15:00
- Après-demain: 09:00, 10:00

### 3. Index de performance

✅ Index sur:
- Emails (patients, admins)
- Clés étrangères
- Dates de rendez-vous
- Statuts

## ✅ Vérification de l'Installation

### Vérifier les tables créées

```sql
-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Vérifier le compte admin

```sql
-- Afficher le compte admin
SELECT id, name, email, role, is_active, created_at 
FROM admins 
WHERE email = 'admin@example.com';
```

Résultat attendu:
```
id     | name            | email               | role        | is_active | created_at
-------|-----------------|---------------------|-------------|-----------|--------------------
uuid   | Administrateur  | admin@example.com   | super_admin | true      | 2025-10-27 ...
```

### Vérifier les créneaux de disponibilité

```sql
-- Afficher les créneaux créés
SELECT date, start_time, end_time, is_available, notes 
FROM availability_slots 
ORDER BY date, start_time;
```

Résultat attendu: 6 créneaux sur les 2 prochains jours

### Compter les tables et données

```sql
-- Statistiques
SELECT 
    'admins' as table_name, COUNT(*) as count FROM admins
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'availability_slots', COUNT(*) FROM availability_slots
UNION ALL
SELECT 'notes', COUNT(*) FROM notes
UNION ALL
SELECT 'unavailabilities', COUNT(*) FROM unavailabilities;
```

Résultat attendu:
```
table_name          | count
--------------------|-------
admins              | 1
patients            | 0
appointments        | 0
availability_slots  | 6
notes               | 0
unavailabilities    | 0
```

## 🔐 Sécurité Post-Installation

### IMPORTANT: Changer le mot de passe admin

Le mot de passe par défaut `admin123` doit être changé immédiatement:

```sql
-- Générer un nouveau hash bcrypt pour votre mot de passe
-- Utiliser Node.js ou un outil en ligne (https://bcrypt-generator.com/)

-- Exemple: Hash pour le mot de passe "MonSuperMotDePasse2025!"
UPDATE admins 
SET password = '$2a$10$YourNewBcryptHashHere',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@example.com';
```

### Créer un nouvel administrateur

```sql
-- Remplacer les valeurs par les vôtres
INSERT INTO admins (name, email, password, role)
VALUES (
    'Votre Nom',
    'votre.email@example.com',
    '$2a$10$VotreBcryptHashIci',  -- Hash bcrypt de votre mot de passe
    'admin'
);
```

## 🛠️ Commandes Utiles

### Supprimer toutes les données (Reset)

```sql
-- ⚠️ ATTENTION: Supprime toutes les données!
TRUNCATE TABLE appointments, notes, unavailabilities, patients, availability_slots, admins CASCADE;
```

### Supprimer uniquement les rendez-vous de test

```sql
DELETE FROM appointments WHERE status = 'pending';
DELETE FROM availability_slots WHERE notes LIKE '%test%';
```

### Réinitialiser les séquences (si nécessaire)

```sql
-- PostgreSQL utilise gen_random_uuid(), pas besoin de réinitialiser
-- Mais pour information:
SELECT setval('ma_sequence', 1, false);
```

## 🐛 Dépannage

### Erreur: "Connection refused"

- Vérifier que l'IP de votre machine est autorisée sur Neon
- Vérifier les paramètres réseau/firewall
- Essayer depuis l'interface web Neon

### Erreur: "SSL connection required"

- Ajouter `?sslmode=require` à l'URL de connexion
- Vérifier que SSL est activé dans votre client

### Erreur: "Password authentication failed"

- Vérifier le mot de passe dans l'URL de connexion
- Copier/coller pour éviter les erreurs de frappe
- Essayer de réinitialiser le mot de passe sur Neon

### Erreur: "relation already exists"

- Les tables existent déjà
- Option 1: Ne rien faire (OK)
- Option 2: Supprimer les tables existantes d'abord:
  ```sql
  DROP TABLE IF EXISTS appointments, notes, unavailabilities, 
                       patients, availability_slots, admins CASCADE;
  ```
  Puis réexécuter `init-db.sql`

## 📞 Support Neon

- Documentation: https://neon.tech/docs
- Discord: https://discord.gg/neon
- Support: support@neon.tech

---

**Note**: Cette base de données est hébergée sur Neon (Serverless PostgreSQL) et est optimisée pour les applications edge comme Cloudflare Workers/Pages.
