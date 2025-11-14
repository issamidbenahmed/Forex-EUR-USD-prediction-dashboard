# 📊 Projet de Prédiction de Taux de Change EUR/USD

Application web complète pour la visualisation en temps réel et la prédiction des taux de change EUR/USD utilisant l'apprentissage automatique (LSTM) et une interface Angular moderne.

## 🎯 Fonctionnalités

- **Visualisation en temps réel** : Graphique interactif affichant les prix EUR/USD avec mise à jour automatique
- **Prédictions** : Modèle Deep Learning : LSTM pour prédire le prix de la prochaine minute
- **Indicateurs techniques** : Prix historiques et moyennes mobiles (7 et 30 périodes)
- **Recommandations de trading** : Analyse automatisée basée sur les indicateurs techniques
- **Interface moderne** : Dashboard responsive avec design sombre et graphiques interactifs

## 🏗️ Architecture

### Backend (Flask/Python)
- API REST pour servir les données et les prédictions
- Modèle de Deep Learning (LSTM) avec TensorFlow/Keras
- Gestion des données historiques depuis un fichier CSV

### Frontend (Angular)
- Application Angular standalone avec TypeScript
- Graphiques interactifs avec Chart.js
- Mise à jour automatique des données en temps réel

## 📋 Prérequis

- **Python 3.8+**
- **Node.js 18+** et **npm**
- **Angular CLI 20+**

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/issamidbenahmed/Forex-EUR-USD-prediction-dashboard.git
cd Forex-EUR-USD-prediction-dashboard
```

### 2. Configuration du Backend

```bash
cd Backend
python -m venv venv
venv\Scripts\activate  # Windows
# ou source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 3. Configuration du Frontend

```bash
cd Frontend
npm install
```

## 🔧 Configuration

### Backend

Le backend nécessite un fichier CSV (`euro_dollar_minute_variation.csv`) dans le dossier `Backend/` avec les colonnes :
- `time` : Timestamp
- `eur_usd` : Prix EUR/USD

### Frontend - Configuration des Clés API

Les clés API sont configurées dans `Frontend/src/environments/environment.ts`.

**Étapes :**
1. Ouvrir `Frontend/src/environments/environment.ts`
2. Remplacer `'your_twelve_data_api_key_here'` et `'your_gemini_api_key_here'` par vos vraies clés
3. Obtenir vos clés API :
   - **Twelve Data** : https://twelvedata.com/account/api-keys
   - **Google Gemini** : https://makersuite.google.com/app/apikey

**⚠️ Sécurité :** Ne commitez JAMAIS ce fichier avec de vraies clés API. Vérifiez toujours avant de pousser sur GitHub.

## 🌐 APIs Utilisées

### 1. Twelve Data API
- **Description** : API pour récupérer les données de taux de change en temps réel
- **URL** : https://api.twelvedata.com
- **Documentation** : https://twelvedata.com/docs
- **Service** : `ForexDataService` (`Frontend/src/app/services/forex-data.service.ts`)
- **Note** : Actuellement, le service utilise des données simulées. Pour activer l'API réelle, décommentez le code dans `getHistoricalData()` et `getCurrentData()`.

### 2. Google Gemini API
- **Description** : API d'intelligence artificielle pour générer des recommandations de trading
- **URL** : https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
- **Documentation** : https://ai.google.dev/docs
- **Service** : `GeminiService` (`Frontend/src/app/services/gemini.service.ts`)
- **Modèle** : `gemini-pro`
- **Note** : Actuellement, le service génère des recommandations simulées. Pour activer l'API réelle, modifiez la méthode `generateRecommendation()`.

### 3. API Backend (Flask)
- **Description** : API REST personnalisée pour les prédictions et la gestion du modèle ML
- **URL** : `http://localhost:5000/api` (développement)
- **Endpoints** :
  - `GET /api/euro-dollar` : Récupère les données historiques
  - `POST /api/predict-next` : Prédit le prochain prix EUR/USD
  - `POST /api/retrain` : Réentraîne le modèle

## ▶️ Démarrage

### Backend
```bash
cd Backend
python app.py
```
Le serveur démarre sur `http://localhost:5000`

### Frontend
```bash
cd Frontend
ng serve
```
L'application est accessible sur `http://localhost:4200`

## 🧠 Modèle de Machine Learning

Le modèle utilise une architecture LSTM avec :
- **Look-back window** : 30 points de données historiques
- **Architecture** : 2 couches LSTM (50 et 100 units) avec Dropout, suivies de couches Dense
- **Optimiseur** : Adam
- **Fonction de perte** : Mean Squared Error
- **Normalisation** : MinMaxScaler

Le modèle est sauvegardé dans `Backend/models/forex_predictor.joblib` et `Backend/models/forex_predictor.keras`.

## 🛠️ Technologies Utilisées

### Backend
Flask, TensorFlow/Keras, Pandas, NumPy, scikit-learn, joblib

### Frontend
Angular 20, TypeScript, Chart.js, RxJS, Tailwind CSS

## 🔄 Mise à jour en temps réel

- Données mises à jour **chaque seconde**
- Prédictions recalculées **toutes les 10 secondes**
- Graphique affiche les **60 derniers points** de données

## 🐛 Dépannage

### Le modèle ne se charge pas
- Vérifiez que le fichier CSV existe dans `Backend/`
- Assurez-vous d'avoir au moins 60 points de données

### Erreur CORS
- Vérifiez que le backend tourne sur le port 5000

### Erreur de prédiction
- Assurez-vous d'avoir au moins 30 points de données historiques

### Les clés API ne fonctionnent pas
- Vérifiez que vous avez bien remplacé les placeholders dans `environment.ts`
- Assurez-vous que vos clés API sont valides et actives

## 📝 Notes Importantes

- ⚠️ **Données simulées** : Les services utilisent actuellement des données simulées. Pour activer les APIs réelles, modifiez les services correspondants.
- ⚠️ **Avertissement** : Ce projet est à des fins éducatives uniquement. Les prédictions ne constituent pas des conseils financiers.

## 👤 Auteur

**Aissam Id Ben Ahmed**

- GitHub: [@issamidbenahmed](https://github.com/issamidbenahmed)


