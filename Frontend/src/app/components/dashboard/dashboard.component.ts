import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Subscription, interval } from 'rxjs';
import { ForexDataService } from '../../services/forex-data.service';
import { PredictionService } from '../../services/prediction.service';
import { GeminiService } from '../../services/gemini.service';
import { ForexDataPoint, TechnicalIndicators, IndicatorDisplay, PredictionResponse } from '../../models/forex.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: ForexDataPoint[] = [];
  currentPrice: number | null = null;
  indicators: TechnicalIndicators = {
    yesterday: null,
    weekAgo: null,
    monthAgo: null,
    movingAvg7: null,
    movingAvg30: null
  };

  indicatorsList: IndicatorDisplay[] = [
    { label: 'Yesterday', value: null, key: 'yesterday' },
    { label: '1 Week Ago', value: null, key: 'weekAgo' },
    { label: '1 Month Ago', value: null, key: 'monthAgo' },
    { label: 'MA(7)', value: null, key: 'movingAvg7' },
    { label: 'MA(30)', value: null, key: 'movingAvg30' }
  ];

  geminiRecommendation = '';
  isLoadingRecommendation = false;
  currentTime: Date = new Date();

  private updateSubscription?: Subscription;
  private readonly MAX_POINTS = 60;

  // Chart configuration
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Prix EUR/USD',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.4
      },
      {
        data: [],
        label: 'Prédiction (prochaine minute)',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#94a3b8'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: '#334155'
        }
      },
      y: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: '#334155'
        }
      }
    }
  };

  public lineChartType: ChartType = 'line';

  private predictionInterval: any;
  private readonly PREDICTION_UPDATE_INTERVAL = 10000; // Mise à jour de la prédiction toutes les 10 secondes

  constructor(
    private forexDataService: ForexDataService,
    private predictionService: PredictionService,
    private geminiService: GeminiService
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.startRealTimeUpdates();
    
    // Mettre à jour l'heure actuelle chaque seconde
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.updateSubscription?.unsubscribe();
    if (this.predictionInterval) {
      clearInterval(this.predictionInterval);
    }
  }

  private initializeData(): void {
    this.forexDataService.getHistoricalData().subscribe(data => {
      this.chartData = data;
      this.updateChart();

      if (data.length > 0) {
        this.currentPrice = data[data.length - 1].realPrice;
        this.updateIndicators();
      }
    });
  }

  private startRealTimeUpdates(): void {
    // Update every second (1000 ms). Fetch once immediately then poll.
    this.fetchNewData();
    this.updateSubscription = interval(1000).subscribe(() => {
      this.fetchNewData();
    });
    
    // Démarrer les mises à jour de prédiction
    this.setupPredictionUpdates();
  }

  private fetchNewData(): void {
    this.forexDataService.getCurrentData().subscribe(newData => {
      // Ajouter le nouveau point de données
      this.chartData.push(newData);
      
      // Garder un nombre constant de points pour une meilleure lisibilité
      if (this.chartData.length > this.MAX_POINTS) {
        this.chartData.shift();
      }

      this.currentPrice = newData.realPrice;
      
      // Mettre à jour le graphique et les indicateurs
      this.updateChart();
      this.updateIndicators();
      
      // Forcer la mise à jour du graphique
      this.chart?.update();
    });
  }

  private updateChart(): void {
    if (!this.chartData.length) return;

    // Mettre à jour d'abord les données réelles
    const times = this.chartData.map(d => d.time);
    const prices = this.chartData.map(d => d.realPrice);

    this.lineChartData.labels = times;
    this.lineChartData.datasets[0].data = prices;

    // Mettre à jour la prédiction si on a assez de données
    if (prices.length >= 30) {  // Réduit à 30 points pour une réactivité plus rapide
      this.updatePrediction();
    } else {
      // Réinitialiser les prédictions si pas assez de données
      this.lineChartData.datasets[1].data = [];
    }

    this.chart?.update();
  }

  private updatePrediction(): void {
    const prices = this.chartData.map(d => d.realPrice);
    
    this.predictionService.predictNext(prices).subscribe({
      next: (response: PredictionResponse) => {
        if (response.success && response.prediction !== undefined && response.timestamp) {
          // Créer un tableau de prédictions aligné avec les données réelles
          // La prédiction à l'instant t correspond au prix réel à t+1
          const predictionData = [...prices];
          
          // Ajouter la prédiction pour le prochain point
          predictionData.push(response.prediction);
          
          // Supprimer le premier élément pour garder la même longueur
          if (predictionData.length > prices.length) {
            predictionData.shift();
          }
          
          // Mettre à jour les données de prédiction
          this.lineChartData.datasets[1].data = predictionData as any;
          
          // S'assurer que les labels sont à jour
          if (this.lineChartData.labels && this.lineChartData.labels.length >= predictionData.length) {
            this.lineChartData.labels = [
              ...this.lineChartData.labels.slice(-predictionData.length + 1),
              response.timestamp
            ];
          }
          
          this.chart?.update();
        } else {
          console.error('Erreur de prédiction:', response?.error || 'Réponse inattendue du serveur');
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération de la prédiction:', error);
      }
    });
  }

  private setupPredictionUpdates(): void {
    // Arrêter tout intervalle existant
    if (this.predictionInterval) {
      clearInterval(this.predictionInterval);
    }
    
    // Démarrer un nouvel intervalle pour les mises à jour de prédiction
    this.predictionInterval = window.setInterval(() => {
      if (this.chartData.length >= 30) {  // Réduit à 30 points pour une meilleure réactivité
        this.updatePrediction();
      }
    }, this.PREDICTION_UPDATE_INTERVAL);
  }

  private updateIndicators(): void {
    if (!this.currentPrice || this.chartData.length === 0) return;

    // Calculer les indicateurs techniques
    const prices = this.chartData.map(d => d.realPrice);
    
    // Moyenne mobile sur 7 périodes
    const ma7 = prices.length >= 7 ? 
      parseFloat((prices.slice(-7).reduce((a, b) => a + b, 0) / 7).toFixed(4)) : 
      null;
      
    // Moyenne mobile sur 30 périodes
    const ma30 = prices.length >= 30 ? 
      parseFloat((prices.slice(-30).reduce((a, b) => a + b, 0) / 30).toFixed(4)) : 
      null;
    
    // Mettre à jour les indicateurs
    this.indicators = {
      yesterday: prices.length >= 2 ? prices[prices.length - 2] : null,
      weekAgo: prices.length >= 7 ? prices[Math.max(0, prices.length - 7)] : null,
      monthAgo: prices.length >= 30 ? prices[Math.max(0, prices.length - 30)] : null,
      movingAvg7: ma7,
      movingAvg30: ma30
    };

    // Mettre à jour la liste des indicateurs pour l'affichage
    this.indicatorsList = this.indicatorsList.map(ind => ({
      ...ind,
      value: this.indicators[ind.key]
    }));
  }

  getIndicatorClass(indicatorValue: number | null): string {
    if (!this.currentPrice || !indicatorValue) return 'text-gray-400';
    return this.currentPrice > indicatorValue ? 'text-green-500' : 'text-red-500';
  }

  getIndicatorIcon(indicatorValue: number | null): string {
    if (!this.currentPrice || !indicatorValue) return '◆';
    return this.currentPrice > indicatorValue ? '▲' : '▼';
  }

  generateRecommendation(): void {
    if (this.isLoadingRecommendation) return;

    this.isLoadingRecommendation = true;
    this.geminiService.generateRecommendation(this.currentPrice || 0, this.indicators)
      .subscribe({
        next: (recommendation) => {
          this.geminiRecommendation = recommendation;
          this.isLoadingRecommendation = false;
        },
        error: (error) => {
          console.error('Error generating recommendation:', error);
          this.isLoadingRecommendation = false;
        }
      });
  }
}
