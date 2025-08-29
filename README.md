# 🚇 Last Call

> **Ne ratez plus jamais votre dernier train**  
> **Last Call** aide les noctambules à retrouver leur chemin avant que le réseau s'endorme.  
> **V1** — basée sur les API RATP pour afficher les prochains horaires en temps réel.  
> **Vision** — application mobile avec notifications, géolocalisation et extension à tous les trains urbains de France.

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

# 3. Lancer le projet en mode développement
npm run dev

💡 Clé API RATP : pour exécuter ce projet, vous devrez configurer votre propre clé API RATP (Ile-de-France Mobilités). Ajoutez-la dans un fichier .env à la racine du projet : VITE_RATP_API_KEY=VOTRE_CLE_ICI

## 🖥 Stack technique

- **Frontend** : Vue.js 3 + Vite.js
- **Backend** : Aucun (application 100 % front)
- **API** : RATP (Ile-de-France Mobilités) — REST
- **Gestion des dépendances** : npm

---

## 🤝 Contribution

Ce projet n'accepte pas de contributions publiques.  
Les modifications ou ajouts sont possibles **uniquement sur invitation** de l'auteur.  

Si vous avez une proposition ou repérez un bug, vous pouvez l’indiquer via les issues GitHub, mais la mise en œuvre sera décidée et effectuée par l'auteur ou ses collaborateurs invités.

---

## 📄 Licence

Ce projet est sous licence **MIT**.  
Vous êtes libres de l’utiliser, le modifier et le redistribuer, à condition de conserver l’attribution à l’auteur original.

---

👨‍💻 **Auteur** : JStephens83

