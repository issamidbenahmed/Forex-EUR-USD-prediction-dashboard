from flask import Flask, jsonify, request
import pandas as pd
import numpy as np
from flask_cors import CORS
from predictor import ForexPredictor
import joblib
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # allows Angular to access this API

# Configuration
MODEL_FILE = 'models/forex_predictor.joblib'
TRAIN_DATA_FILE = 'euro_dollar_minute_variation.csv'

# Initialize predictor
predictor = None

def initialize_predictor():
    global predictor
    try:
        if os.path.exists(MODEL_FILE):
            print("Chargement du modèle existant...")
            predictor = ForexPredictor.load(MODEL_FILE)
            print("Modèle chargé avec succès")
        else:
            print("Entraînement d'un nouveau modèle...")
            train_model()
    except Exception as e:
        print(f"Erreur lors de l'initialisation du prédicteur: {str(e)}")
        predictor = None

def train_model():
    global predictor
    try:
        print("Préparation des données d'entraînement...")
        df = pd.read_csv(TRAIN_DATA_FILE)
        
        # Vérifier que nous avons suffisamment de données
        if len(df) < 60:
            print(f"Erreur: Pas assez de données pour l'entraînement. Minimum 60 points requis, {len(df)} trouvés.")
            return False
            
        prices = df['eur_usd'].values.astype(float)
        
        # Créer et entraîner le modèle
        predictor = ForexPredictor(look_back=30, forecast_steps=1)  # Réduit look_back à 30 pour plus de stabilité
        print("Entraînement du modèle en cours...")
        
        # Ajuster le nombre d'époques en fonction de la taille du jeu de données
        epochs = min(50, max(10, len(df) // 10))
        predictor.train(prices, epochs=epochs, batch_size=8)  # Batch plus petit pour éviter les problèmes de mémoire
        
        # Créer le dossier models s'il n'existe pas
        os.makedirs(os.path.dirname(MODEL_FILE) or '.', exist_ok=True)
        
        # Sauvegarder le modèle
        predictor.save(MODEL_FILE)
        print(f"Modèle entraîné et sauvegardé dans {MODEL_FILE}")
        return True
    except Exception as e:
        import traceback
        print(f"Erreur lors de l'entraînement du modèle: {str(e)}")
        print("Détails de l'erreur:")
        traceback.print_exc()
        predictor = None
        return False

@app.route('/api/euro-dollar', methods=['GET'])
def get_euro_dollar_data():
    try:
        df = pd.read_csv(TRAIN_DATA_FILE)
        result = df[['time', 'eur_usd']].to_dict(orient='records')
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predict-next', methods=['POST'])
def predict_next():
    global predictor
    
    if predictor is None:
        initialize_predictor()
        if predictor is None:
            return jsonify({
                'success': False,
                'error': 'Modèle non initialisé. Veuillez réessayer.'
            }), 500
    
    try:
        data = request.json
        historical_prices = np.array(data.get('prices', [])).astype(float)
        
        if len(historical_prices) < predictor.look_back:
            return jsonify({
                'success': False,
                'error': f'Nombre insuffisant de points de données. Minimum {predictor.look_back} requis.'
            }), 400
        
        # Prédire le prochain point
        next_price = predictor.predict_next(historical_prices)[0]
        
        # Obtenir le timestamp de la prochaine minute
        next_time = (datetime.now() + timedelta(minutes=1)).strftime('%H:%M')
        
        return jsonify({
            'success': True,
            'prediction': float(next_price),
            'timestamp': next_time
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erreur lors de la prédiction: {str(e)}'
        }), 500

@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    try:
        success = train_model()
        if success:
            return jsonify({
                'success': True,
                'message': 'Modèle réentraîné avec succès.'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Échec de l\'entraînement du modèle.'
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erreur lors du réentraînement: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Initialiser le prédicteur au démarrage
    initialize_predictor()
    app.run(port=5000, debug=True)
