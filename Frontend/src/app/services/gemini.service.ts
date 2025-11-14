import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiKey = environment.geminiApiKey;
  private apiUrl = environment.geminiApiUrl;

  constructor(private http: HttpClient) {}

  generateRecommendation(currentPrice: number, indicators: any): Observable<string> {
    // Simulation de recommandations en français
    const trends = [
      {
        type: 'haussière',
        recommendations: [
          `Le marché affiche un signal d'achat avec un prix actuel de ${currentPrice.toFixed(4)} EUR/USD. 
          Les indicateurs techniques confirment une tendance haussière. 
          Niveaux de support à surveiller : ${(currentPrice * 0.998).toFixed(4)} et ${(currentPrice * 0.995).toFixed(4)}.`,
          `Opportunité d'achat sur EUR/USD à ${currentPrice.toFixed(4)}. 
          La moyenne mobile sur 7 périodes est au-dessus de celle sur 30 périodes, 
          indiquant une dynamique haussière. Objectif : ${(currentPrice * 1.005).toFixed(4)}.`
        ]
      },
      {
        type: 'baissière',
        recommendations: [
          `Attention, tendance baissière détectée à ${currentPrice.toFixed(4)} EUR/USD. 
          Les indicateurs techniques suggèrent de rester à l'écart ou de considérer des positions courtes. 
          Niveaux de résistance : ${(currentPrice * 1.002).toFixed(4)} et ${(currentPrice * 1.005).toFixed(4)}.`,
          `Le marché montre des signes de faiblesse à ${currentPrice.toFixed(4)}. 
          La configuration technique suggère une possible continuation à la baisse. 
          Seuil critique : ${(currentPrice * 0.995).toFixed(4)}.`
        ]
      },
      {
        type: 'neutre',
        recommendations: [
          `Marché en phase de consolidation autour de ${currentPrice.toFixed(4)} EUR/USD. 
          Attendre une confirmation de la tendance avant toute prise de position. 
            Niveaux clés : support à ${(currentPrice * 0.998).toFixed(4)}, résistance à ${(currentPrice * 1.002).toFixed(4)}.`,
          `EUR/USD évolue dans un range étroit. 
          Stratégie de trading range-bound recommandée en attendant une sortie de range. 
          Niveaux à surveiller : ${(currentPrice * 0.997).toFixed(4)} - ${(currentPrice * 1.003).toFixed(4)}.`
        ]
      }
    ];

    // Détection de la tendance basée sur les indicateurs
    let trendIndex = 0; // haussière par défaut
    
    if (indicators.movingAvg7 && indicators.movingAvg30) {
      if (indicators.movingAvg7 < indicators.movingAvg30) {
        trendIndex = 1; // baissière
      } else if (Math.abs(indicators.movingAvg7 - indicators.movingAvg30) < 0.001) {
        trendIndex = 2; // neutre
      }
    }

    const selectedTrend = trends[trendIndex];
    const randomRecommendation = selectedTrend.recommendations[
      Math.floor(Math.random() * selectedTrend.recommendations.length)
    ];

    // Ajout d'un avertissement de risque
    const riskWarning = "\n\nNote : Cette analyse est fournie à titre informatif uniquement et ne constitue pas un conseil en investissement. Le trading sur marge comporte un niveau de risque élevé.";
    
    return of(randomRecommendation + riskWarning).pipe(delay(1000));
  }
}
