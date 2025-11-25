# 🚇 Last Call

> **Ne ratez plus jamais votre dernier train**  
> **Last Call** aide les noctambules à retrouver leur chemin avant que le réseau s'endorme.  
> **V1** — basée sur les API RATP pour afficher les prochains horaires en temps réel.  
> **Vision** — application mobile avec notifications, géolocalisation et extension à tous les trains urbains de France.

## 🧪 Tests

Ce projet ne contient pas encore de tests automatisés.  
Les vérifications se font via l’interface et les logs backend.  
Des tests unitaires et d’intégration sont prévus dans la roadmap.

---

## 📖 Sommaire
1. [Aperçu du projet](#-aperçu-du-projet)
2. [Fonctionnalités](#-fonctionnalités)
3. [Roadmap](#-roadmap)
4. [Installation](#-installation)
5. [Stack technique](#-stack-technique)
6. [Contribution](#-contribution)
7. [Licence](#-licence)

---

## 🎯 Aperçu du projet

Last Call est conçu pour toutes celles et ceux qui sortent le soir et veulent éviter la galère du « dernier métro manqué ».  
La première version exploite les **API RATP** pour afficher les horaires à venir des métros parisiens, directement depuis une interface rapide et simple.

---

## ✨ Fonctionnalités

### Actuelles (V1)
- Sélection **ligne → direction → arrêt**
- Affichage **en temps réel** des 3 prochains trains
- Interface adaptée à une consultation rapide avant de partir

---

## 📅 Roadmap

### Prochaines évolutions
- Couverture **RER, tramways et trains urbains** de toute l’Île-de-France
- Version **application mobile** (Android / iOS)
- **Notifications push** pour prévenir avant le dernier train
- **Géolocalisation** pour suggérer la station la plus proche

---

## 🛠 Installation

> **Pré-requis**
> - Node.js (v14 ou + recommandé)
> - npm

# 1. Cloner le projet
git clone https://github.com/ton-compte/last-call.git
cd last-call

# 2. Installer les dépendances
npm install

# 3. 🛠️ Configuration
  a. Modifiez `.env.local.example` en `.env.local`
  b. Remplissez les variables :
    - `PRIM_API_KEY` : Votre clé API PRIM
    - `MONGO_URI` : votre URI MongoDB Atlas
    - `DB_NAME` : Nom de la base
    - `WORKDIR` : Dossier local pour stocker les fichiers GTFS (par défaut `./backend/db`)

# 4. Lancer le projet en mode développement
- `npm run import:gtfs` pour importer les données GTFS (voir script dans `package.json`)
- `npm run dev` pour le front
- `node server.js` pour lancer le backend

💡 Clé API RATP : pour exécuter ce projet, vous devrez configurer votre propre clé API RATP (Ile-de-France Mobilités). Ajoutez-la dans un fichier .env à la racine du projet : VITE_RATP_API_KEY=VOTRE_CLE_ICI

## 🖥 Stack technique

- **Frontend** : Vue.js 3 + Vite.js
- **Backend** : Node.js + Express.js + MongoDB Atlas
- **API** : RATP (Ile-de-France Mobilités) — REST
- **Gestion des dépendances** : npm

---

## 🤝 Contribution

Ce projet n'accepte pas de contributions publiques.  
Les modifications ou ajouts sont possibles **uniquement sur invitation** de l'auteur.  

Si vous avez une proposition ou repérez un bug, vous pouvez l’indiquer via les issues GitHub, mais la mise en œuvre sera décidée et effectuée par l'auteur ou ses collaborateurs invités.

---

## 📄 Licence

Ce projet est distribué sous licence **Non Commerciale**.  
Consultez le fichier LICENSE.md(./LICENSE.md) pour les conditions complètes.

---

👨‍💻 **Auteur** : JStephens83

