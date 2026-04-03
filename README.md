# Note de Frais — Clan Spéléo des Troglodytes

## Installation

### 1. Prérequis
- MAMP ou XAMPP
- PHP 8+
- MySQL

### 2. Base de données
- Créer une base nommée Troglos
- Exécuter ce SQL :
CREATE TABLE notes_de_frais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100),
  date_demande DATE,
  raison TEXT,
  budget VARCHAR(50),
  km DECIMAL(10,2),
  peage DECIMAL(10,2),
  autres DECIMAL(10,2),
  total DECIMAL(10,2),
  mode VARCHAR(20),
  iban VARCHAR(50),
  date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### 3. Configuration
- Copier config.example.php en config.php
- Remplir vos identifiants Gmail et base de données

### 4. Lancer
- Placer le dossier dans htdocs/
- Ouvrir http://localhost:8888/note-de-frais-troglos/