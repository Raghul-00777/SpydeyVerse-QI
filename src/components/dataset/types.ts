export type DataRow = Record<string, unknown>;
export type ColType = 'number' | 'string' | 'boolean' | 'date' | 'mixed';

export interface ParsedDataset {
  name: string;
  format: 'csv' | 'xlsx' | 'json' | 'sql' | 'parquet';
  sizeBytes: number;
  rows: DataRow[];
  headers: string[];
}

export interface ColumnStats {
  name: string;
  type: ColType;
  count: number;
  missing: number;
  missingPct: number;
  unique: number;
  // numeric only
  mean?: number;
  median?: number;
  mode?: number | string;
  std?: number;
  variance?: number;
  min?: number;
  max?: number;
  range?: number;
  q1?: number;
  q3?: number;
  skewness?: number;
  kurtosis?: number;
}

export interface CorrelationEntry {
  col1: string;
  col2: string;
  value: number;
}

export interface DatasetSummary {
  totalRows: number;
  totalCols: number;
  missingTotal: number;
  duplicateRows: number;
  memoryMB: number;
  columns: ColumnStats[];
  correlation: CorrelationEntry[];
  numericCols: string[];
  categoricalCols: string[];
  aiScore: number;
  healthScore: number;
}

export interface AIInsight {
  type: 'info' | 'warning' | 'success' | 'tip';
  text: string;
  col?: string;
}

export interface MLRecommendation {
  task: string;
  algorithm: string;
  reason: string;
  confidence: number;
}

export interface QuantumMetric {
  label: string;
  value: number;
  unit?: string;
  detail: string;
}

export interface MLResult {
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  task: string;
  confusionMatrix: number[][];
  rocPoints: { fpr: number; tpr: number }[];
  featureImportance: { feature: string; importance: number }[];
}

export interface NLResponse {
  question: string;
  answer: string;
  chart?: { type: string; data: DataRow[] };
}
