export interface ForexDataPoint {
  time: string;
  timestamp: number;
  realPrice: number;
  predictedPrice: number;
}

export interface TechnicalIndicators {
  yesterday: number | null;
  weekAgo: number | null;
  monthAgo: number | null;
  movingAvg7: number | null;
  movingAvg30: number | null;
}

export interface IndicatorDisplay {
  label: string;
  value: number | null;
  key: keyof TechnicalIndicators;
}

export interface PredictionResponse {
  success: boolean;
  prediction?: number;
  timestamp?: string;
  error?: string;
}
