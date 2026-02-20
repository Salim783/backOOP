# backOOP

API backend Node.js / Express avec MySQL.

## Installation

1. Cloner le projet
```bash
git clone <url-du-repo>
cd backOOP
```

2. Installer les dependances (obligatoire apres un clone)
```bash
npm install
```

3. Configurer le fichier `.env` (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, etc.)

4. Lancer le serveur
```bash
npm run dev
```

## Script SQL (phpMyAdmin)

Ce script sert a creer la base de donnees `backoop` et les tables `user` et `produit`.
Copie/colle ce script dans l onglet **SQL** de phpMyAdmin, puis execute-le.

```sql
CREATE DATABASE IF NOT EXISTS `backoop`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `backoop`;

CREATE TABLE IF NOT EXISTS `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mail` VARCHAR(255) NOT NULL,
  `mdp` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_mail` (`mail`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `produit` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titre` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `categorie` VARCHAR(100) NOT NULL DEFAULT 'Non classe',
  `prix` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `img` VARCHAR(255) NULL,
  `quantite` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

## Tests

```bash
npm test
```
