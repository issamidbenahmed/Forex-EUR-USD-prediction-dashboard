import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ForexDataPoint } from '../models/forex.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForexDataService {
  private apiKey = environment.twelveDataApiKey;
  private baseUrl = environment.twelveDataBaseUrl;

  constructor(private http: HttpClient) {}

  // Fetch historical data for last 60 minutes
  getHistoricalData(): Observable<ForexDataPoint[]> {
    // TODO: Implement actual API call
    // const url = `${this.baseUrl}/time_series?symbol=EUR/USD&interval=1min&outputsize=60&apikey=${this.apiKey}`;
    // return this.http.get<any>(url).pipe(
    //   map(response => this.transformApiResponse(response))
    // );

    // Simulated data for now
    return of(this.generateHistoricalData());
  }

  // Fetch current minute data
  getCurrentData(): Observable<ForexDataPoint> {
    // TODO: Implement actual API call
    // const url = `${this.baseUrl}/time_series?symbol=EUR/USD&interval=1min&outputsize=1&apikey=${this.apiKey}`;

    // Simulated data for now
    const now = new Date();
    const price = 1.0850 + (Math.random() - 0.5) * 0.01;

    return of({
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.getTime(),
      realPrice: parseFloat(price.toFixed(4)),
      predictedPrice: parseFloat((price + (Math.random() - 0.5) * 0.005).toFixed(4))
    });
  }

  private generateHistoricalData(): ForexDataPoint[] {
    const data: ForexDataPoint[] = [];
    const now = new Date();

    for (let i = 59; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000);
      const basePrice = 1.0850 + (Math.random() - 0.5) * 0.01;

      data.push({
        time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: timestamp.getTime(),
        realPrice: parseFloat(basePrice.toFixed(4)),
        predictedPrice: parseFloat((basePrice + (Math.random() - 0.5) * 0.005).toFixed(4))
      });
    }

    return data;
  }

  // Transform Twelve Data API response to our format
  private transformApiResponse(response: any): ForexDataPoint[] {
    return response.values.reverse().map((item: any) => ({
      time: new Date(item.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(item.datetime).getTime(),
      realPrice: parseFloat(parseFloat(item.close).toFixed(4)),
      predictedPrice: 0 // Will be filled by prediction service
    }));
  }
}
