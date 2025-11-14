import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PredictionResponse {
  success: boolean;
  prediction?: number;
  timestamp?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private baseUrl = environment.backendApiUrl;
  private readonly LOOKBACK = 60; // Nombre de points historiques nécessaires pour la prédiction

  constructor(private http: HttpClient) {}

  getEuroDollarData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/euro-dollar`);
  }

  predictNext(prices: number[]): Observable<PredictionResponse> {
    // Nous n'avons besoin que des N derniers points pour la prédiction
    const recentPrices = prices.slice(-this.LOOKBACK);
    return this.http.post<PredictionResponse>(`${this.baseUrl}/predict-next`, { prices: recentPrices });
  }

  retrainModel(): Observable<{ success: boolean; message?: string; error?: string }> {
    return this.http.post<{ success: boolean; message?: string; error?: string }>(
      `${this.baseUrl}/retrain`,
      {}
    );
  }
}
