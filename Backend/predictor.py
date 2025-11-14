import numpy as np
from tensorflow.keras.models import Sequential, save_model, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import joblib
import os

class ForexPredictor:
    def __init__(self, look_back=60, forecast_steps=1):
        self.look_back = look_back
        self.forecast_steps = forecast_steps
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = self._build_model()
        
    def _build_model(self):
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(self.look_back, 1)),
            Dropout(0.2),
            LSTM(100, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(self.forecast_steps)
        ])
        model.compile(optimizer='adam', loss='mean_squared_error')
        return model
    
    def prepare_data(self, data):
        scaled_data = self.scaler.fit_transform(data.reshape(-1, 1))
        X, y = [], []
        for i in range(len(scaled_data) - self.look_back - self.forecast_steps):
            X.append(scaled_data[i:(i + self.look_back), 0])
            y.append(scaled_data[i + self.look_back:i + self.look_back + self.forecast_steps, 0])
        return np.array(X), np.array(y)
    
    def train(self, historical_data, epochs=20, batch_size=32):
        X, y = self.prepare_data(historical_data)
        X = X.reshape((X.shape[0], X.shape[1], 1))
        history = self.model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=1)
        return history
    
    def predict_next(self, last_n_points):
        if len(last_n_points) < self.look_back:
            raise ValueError(f"Need at least {self.look_back} points for prediction")
            
        last_n_points = np.array(last_n_points[-self.look_back:])
        scaled_data = self.scaler.transform(last_n_points.reshape(-1, 1))
        X = scaled_data.reshape((1, self.look_back, 1))
        predicted_scaled = self.model.predict(X, verbose=0)
        return self.scaler.inverse_transform(predicted_scaled.reshape(-1, 1)).flatten()
    
    def save(self, filename):
        # Créer le dossier s'il n'existe pas
        os.makedirs(os.path.dirname(filename) or '.', exist_ok=True)
        
        # Sauvegarder le modèle Keras
        model_path = filename.replace('.joblib', '.keras')
        self.model.save(model_path)
        
        # Sauvegarder le scaler et les métadonnées
        joblib.dump({
            'look_back': self.look_back,
            'forecast_steps': self.forecast_steps,
            'scaler': self.scaler,
            'model_path': model_path
        }, filename)
    
    @classmethod
    def load(cls, filename):
        data = joblib.load(filename)
        predictor = cls(
            look_back=data['look_back'],
            forecast_steps=data['forecast_steps']
        )
        predictor.scaler = data['scaler']
        predictor.model = load_model(data['model_path'])
        return predictor
