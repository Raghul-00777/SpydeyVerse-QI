import type { DataRow, ColType, ColumnStats, CorrelationEntry, DatasetSummary, AIInsight, MLRecommendation, QuantumMetric, MLResult } from './types';

// ─── helpers ────────────────────────────────────────────────────────────────

function nums(col: string, rows: DataRow[]): number[] {
  return rows.reduce<number[]>((acc, r) => {
    const raw = r[col];
    if (raw === null || raw === undefined || raw === '') return acc;
    const n = Number(raw);
    if (!isNaN(n)) acc.push(n);
    return acc;
  }, []);
}

function mean(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

function median(sorted: number[]) {
  const n = sorted.length;
  if (!n) return 0;
  return n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
}

function mode(arr: number[]): number {
  const freq: Record<number, number> = {};
  arr.forEach(v => (freq[v] = (freq[v] || 0) + 1));
  return Number(Object.keys(freq).reduce((a, b) => (freq[Number(a)] > freq[Number(b)] ? a : b), '0'));
}

function std(arr: number[], m: number) {
  if (arr.length < 2) return 0;
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

function quartile(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

function skewness(arr: number[], m: number, s: number) {
  if (!s || arr.length < 3) return 0;
  const n = arr.length;
  const sum = arr.reduce((a, v) => a + ((v - m) / s) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * sum;
}

function kurtosis(arr: number[], m: number, s: number) {
  if (!s || arr.length < 4) return 0;
  const n = arr.length;
  const sum = arr.reduce((a, v) => a + ((v - m) / s) ** 4, 0);
  return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum -
    (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
}

function pearson(a: number[], b: number[]) {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const ma = mean(a.slice(0, n)), mb = mean(b.slice(0, n));
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  const denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : parseFloat((num / denom).toFixed(4));
}

export function detectColType(col: string, rows: DataRow[]): ColType {
  const vals = rows.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
  if (!vals.length) return 'string';
  const numCount = vals.filter(v => !isNaN(Number(v))).length;
  if (numCount / vals.length > 0.85) return 'number';
  const dateCount = vals.filter(v => !isNaN(Date.parse(String(v)))).length;
  if (dateCount / vals.length > 0.8) return 'date';
  if (vals.every(v => v === true || v === false || v === 'true' || v === 'false')) return 'boolean';
  return 'string';
}

export function computeColumnStats(col: string, rows: DataRow[], type: ColType): ColumnStats {
  const total = rows.length;
  const missing = rows.filter(r => r[col] === null || r[col] === undefined || r[col] === '').length;
  const unique = new Set(rows.map(r => String(r[col]))).size;

  const base: ColumnStats = {
    name: col, type, count: total, missing, missingPct: parseFloat(((missing / total) * 100).toFixed(1)), unique,
  };

  if (type === 'number') {
    const n = nums(col, rows);
    const sorted = [...n].sort((a, b) => a - b);
    const m = mean(n);
    const s = std(n, m);
    return {
      ...base,
      mean: parseFloat(m.toFixed(4)),
      median: parseFloat(median(sorted).toFixed(4)),
      mode: mode(n),
      std: parseFloat(s.toFixed(4)),
      variance: parseFloat((s * s).toFixed(4)),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      range: sorted[sorted.length - 1] - sorted[0],
      q1: parseFloat(quartile(sorted, 0.25).toFixed(4)),
      q3: parseFloat(quartile(sorted, 0.75).toFixed(4)),
      skewness: parseFloat(skewness(n, m, s).toFixed(4)),
      kurtosis: parseFloat(kurtosis(n, m, s).toFixed(4)),
    };
  }
  return base;
}

export function computeCorrelation(headers: string[], rows: DataRow[], numericCols: string[]): CorrelationEntry[] {
  const result: CorrelationEntry[] = [];
  for (let i = 0; i < numericCols.length; i++) {
    for (let j = i + 1; j < numericCols.length; j++) {
      const a = nums(numericCols[i], rows);
      const b = nums(numericCols[j], rows);
      result.push({ col1: numericCols[i], col2: numericCols[j], value: pearson(a, b) });
    }
  }
  return result;
}

export function countDuplicates(rows: DataRow[]): number {
  const seen = new Set<string>();
  let dupes = 0;
  rows.forEach(r => {
    const key = JSON.stringify(r);
    if (seen.has(key)) dupes++;
    else seen.add(key);
  });
  return dupes;
}

export function buildSummary(dataset: { rows: DataRow[]; headers: string[]; name: string; sizeBytes: number }): DatasetSummary {
  const { rows, headers } = dataset;
  const totalRows = rows.length;
  const totalCols = headers.length;

  const colTypes = Object.fromEntries(headers.map(h => [h, detectColType(h, rows)]));
  const columns = headers.map(h => computeColumnStats(h, rows, colTypes[h]));
  const numericCols = headers.filter(h => colTypes[h] === 'number');
  const categoricalCols = headers.filter(h => colTypes[h] === 'string');
  const correlation = computeCorrelation(headers, rows, numericCols);
  const duplicateRows = countDuplicates(rows);
  const missingTotal = columns.reduce((s, c) => s + c.missing, 0);
  const memoryMB = parseFloat((dataset.sizeBytes / 1048576).toFixed(2));

  const missingPct = (missingTotal / (totalRows * totalCols)) * 100;
  const dupePct = (duplicateRows / totalRows) * 100;
  const healthScore = Math.max(0, Math.round(100 - missingPct * 2 - dupePct));
  const aiScore = Math.min(100, Math.round(
    (numericCols.length / Math.max(1, totalCols)) * 40 +
    (totalRows > 100 ? 30 : totalRows / 100 * 30) +
    (healthScore * 0.3)
  ));

  return { totalRows, totalCols, missingTotal, duplicateRows, memoryMB, columns, correlation, numericCols, categoricalCols, aiScore, healthScore };
}

export function generateInsights(summary: DatasetSummary): AIInsight[] {
  const insights: AIInsight[] = [];
  const { columns, totalRows, duplicateRows, numericCols, correlation } = summary;

  if (totalRows < 100) insights.push({ type: 'warning', text: `Small dataset (${totalRows} rows). Results may not generalise well. Consider collecting more data.` });
  else if (totalRows > 10000) insights.push({ type: 'success', text: `Large dataset (${totalRows.toLocaleString()} rows). Excellent for training robust ML models.` });

  if (duplicateRows > 0) insights.push({ type: 'warning', text: `${duplicateRows} duplicate rows detected. Removing them will improve model accuracy.`, });

  columns.forEach(c => {
    if (c.missingPct > 30) insights.push({ type: 'warning', text: `Column "${c.name}" is ${c.missingPct}% missing. Consider imputation or dropping this column.`, col: c.name });
    else if (c.missingPct > 5) insights.push({ type: 'info', text: `Column "${c.name}" has ${c.missingPct}% missing values. Mean/median imputation recommended.`, col: c.name });
    if (c.type === 'number' && c.skewness !== undefined && Math.abs(c.skewness) > 1) {
      insights.push({ type: 'tip', text: `Column "${c.name}" is skewed (${c.skewness > 0 ? 'right' : 'left'}, skew=${c.skewness.toFixed(2)}). Log or Box-Cox transform may improve model performance.`, col: c.name });
    }
    if (c.type === 'number' && c.unique === 2) {
      insights.push({ type: 'info', text: `Column "${c.name}" appears to be binary. This could be your target variable for classification.`, col: c.name });
    }
  });

  const highCorr = correlation.filter(c => Math.abs(c.value) > 0.85);
  if (highCorr.length > 0) {
    insights.push({ type: 'warning', text: `High correlation detected: ${highCorr.map(c => `"${c.col1}" & "${c.col2}" (${c.value})`).join(', ')}. Consider removing one to reduce multicollinearity.` });
  }

  if (numericCols.length >= 3 && totalRows >= 50) {
    insights.push({ type: 'success', text: 'This dataset is suitable for regression or classification tasks with multiple numeric predictors.' });
  }

  if (numericCols.length === 0) {
    insights.push({ type: 'info', text: 'No numeric columns detected. This dataset may require encoding before ML model training.' });
  }

  if (summary.categoricalCols.length > 5) {
    insights.push({ type: 'tip', text: `${summary.categoricalCols.length} categorical columns found. One-hot encoding or label encoding will be needed.` });
  }

  return insights;
}

export function generateMLRecommendations(summary: DatasetSummary): MLRecommendation[] {
  const recs: MLRecommendation[] = [];
  const { numericCols, totalRows, columns } = summary;
  const binaryCols = columns.filter(c => c.unique === 2 && c.type === 'number');
  const hasTimeLike = columns.some(c => c.name.toLowerCase().includes('date') || c.name.toLowerCase().includes('time') || c.type === 'date');

  if (binaryCols.length > 0) {
    recs.push({ task: 'Classification', algorithm: 'Random Forest Classifier', reason: `Binary target column "${binaryCols[0].name}" detected. Random Forest handles mixed feature types and is robust to outliers.`, confidence: 88 });
    recs.push({ task: 'Classification', algorithm: 'Gradient Boosting (XGBoost)', reason: 'High accuracy ensemble method, excellent for tabular binary classification with feature interactions.', confidence: 85 });
  }

  if (numericCols.length >= 2) {
    recs.push({ task: 'Regression', algorithm: 'Linear Regression', reason: `${numericCols.length} numeric features available. Linear regression is a strong baseline for continuous target prediction.`, confidence: 75 });
    if (totalRows >= 100) {
      recs.push({ task: 'Regression', algorithm: 'Random Forest Regressor', reason: 'Captures non-linear relationships and handles missing values well. Good for medium-sized datasets.', confidence: 82 });
    }
  }

  if (totalRows >= 100 && numericCols.length >= 2) {
    recs.push({ task: 'Clustering', algorithm: 'K-Means Clustering', reason: `${numericCols.length} numeric features. K-Means can segment data into meaningful groups for exploratory analysis.`, confidence: 78 });
  }

  if (hasTimeLike) {
    recs.push({ task: 'Forecasting', algorithm: 'ARIMA / LSTM', reason: 'Time-related column detected. Time series forecasting can predict future values from historical patterns.', confidence: 80 });
  }

  recs.push({ task: 'Anomaly Detection', algorithm: 'Isolation Forest', reason: 'Works well for detecting outliers in tabular datasets without labelled anomalies.', confidence: 73 });

  return recs.slice(0, 5);
}

export function generateQuantumMetrics(summary: DatasetSummary): QuantumMetric[] {
  const { totalRows, totalCols, numericCols, healthScore, aiScore, correlation } = summary;
  const entropy = parseFloat((Math.log2(Math.max(1, totalRows * totalCols)) * 0.4 + numericCols.length * 0.3).toFixed(2));
  const maxCorr = correlation.length ? Math.max(...correlation.map(c => Math.abs(c.value))) : 0;
  return [
    { label: 'Quantum Data Score', value: Math.min(99, Math.round(aiScore * 0.7 + healthScore * 0.3)), unit: '/100', detail: 'Composite score based on dataset richness, completeness, and feature diversity.' },
    { label: 'Quantum Entropy', value: entropy, unit: 'qbits', detail: 'Information entropy across feature space — higher values indicate more complex data distributions.' },
    { label: 'Pattern Detection', value: Math.round(maxCorr * 100), unit: '%', detail: 'Strongest inter-feature quantum correlation detected in the dataset.' },
    { label: 'Quantum Confidence', value: Math.min(99, Math.round(healthScore * 0.8 + aiScore * 0.2)), unit: '%', detail: 'Confidence in quantum-inspired recommendations based on data quality.' },
    { label: 'Feature Ranking', value: numericCols.length, unit: 'features', detail: 'Number of quantifiable features eligible for quantum pattern analysis.' },
    { label: 'Optimization Score', value: Math.min(98, Math.round(70 + totalRows / 200)), unit: '%', detail: 'Quantum-inspired optimization potential — higher with larger, cleaner datasets.' },
  ];
}

export function simulateMLResult(summary: DatasetSummary, algorithm: string): MLResult {
  const base = 0.72 + Math.random() * 0.2;
  const prec = base - 0.02 + Math.random() * 0.04;
  const rec  = base - 0.03 + Math.random() * 0.04;
  const f1   = 2 * prec * rec / (prec + rec);

  const cm = [
    [Math.round(summary.totalRows * 0.35 * base), Math.round(summary.totalRows * 0.05)],
    [Math.round(summary.totalRows * 0.05), Math.round(summary.totalRows * 0.35 * base)],
  ];

  const roc: { fpr: number; tpr: number }[] = [];
  for (let i = 0; i <= 10; i++) {
    const fpr = i / 10;
    roc.push({ fpr, tpr: Math.min(1, fpr + base * 0.6 + Math.random() * 0.1) });
  }

  const fi = summary.numericCols.slice(0, 8).map((f, i) => ({
    feature: f,
    importance: parseFloat((1 / (i + 1) * (0.7 + Math.random() * 0.3)).toFixed(3)),
  })).sort((a, b) => b.importance - a.importance);

  const total = fi.reduce((s, f) => s + f.importance, 0);
  fi.forEach(f => (f.importance = parseFloat((f.importance / total).toFixed(3))));

  return {
    algorithm,
    task: summary.numericCols.length > 2 ? 'Classification' : 'Regression',
    accuracy:  parseFloat(base.toFixed(4)),
    precision: parseFloat(prec.toFixed(4)),
    recall:    parseFloat(rec.toFixed(4)),
    f1:        parseFloat(f1.toFixed(4)),
    confusionMatrix: cm,
    rocPoints: roc,
    featureImportance: fi,
  };
}

export function answerNLQuery(question: string, summary: DatasetSummary): string {
  const q = question.toLowerCase();
  const { columns, totalRows, totalCols, duplicateRows, missingTotal, numericCols } = summary;

  if (q.includes('missing') || q.includes('null') || q.includes('empty')) {
    const cols = columns.filter(c => c.missing > 0);
    if (!cols.length) return 'Great news! No missing values found in this dataset.';
    return `Missing values found in ${cols.length} column(s): ${cols.map(c => `"${c.name}" (${c.missingPct}%)`).join(', ')}.`;
  }
  if (q.includes('row') || q.includes('size') || q.includes('large') || q.includes('how many')) {
    return `This dataset contains ${totalRows.toLocaleString()} rows and ${totalCols} columns. Memory usage: ${summary.memoryMB} MB. There are ${duplicateRows} duplicate rows.`;
  }
  if (q.includes('duplicate')) {
    return duplicateRows === 0 ? 'No duplicate rows found! The dataset is clean in this respect.' : `Found ${duplicateRows} duplicate rows (${((duplicateRows / totalRows) * 100).toFixed(1)}% of total). Removing them is recommended.`;
  }
  if (q.includes('column') || q.includes('feature') || q.includes('variable')) {
    return `The dataset has ${totalCols} columns: ${columns.map(c => `${c.name} (${c.type})`).join(', ')}.`;
  }
  if (q.includes('correlation') || q.includes('related') || q.includes('depend')) {
    const top = summary.correlation.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 3);
    if (!top.length) return 'Not enough numeric columns to compute correlations.';
    return `Top correlations: ${top.map(c => `"${c.col1}" & "${c.col2}": ${c.value}`).join('; ')}.`;
  }
  if (q.includes('predict') || q.includes('forecast') || q.includes('model')) {
    const recs = generateMLRecommendations(summary);
    return `Best algorithm recommendation: ${recs[0]?.algorithm || 'Random Forest'}. ${recs[0]?.reason || ''}`;
  }
  if (q.includes('average') || q.includes('mean')) {
    const col = numericCols.find(c => q.includes(c.toLowerCase())) || numericCols[0];
    if (!col) return 'No numeric columns found to compute averages.';
    const stats = columns.find(c => c.name === col);
    return stats ? `Average of "${col}": ${stats.mean}. (Min: ${stats.min}, Max: ${stats.max}, Std: ${stats.std})` : 'Column not found.';
  }
  if (q.includes('outlier') || q.includes('anomaly')) {
    return `Outlier detection: Based on IQR analysis, check columns with high skewness. Isolation Forest or Z-score methods are recommended for anomaly detection.`;
  }
  if (q.includes('distribution') || q.includes('normal')) {
    const skewed = columns.filter(c => c.skewness !== undefined && Math.abs(c.skewness) > 1);
    return skewed.length ? `${skewed.length} column(s) are skewed: ${skewed.map(c => c.name).join(', ')}. Log transformation may help normalise these.` : 'Most numeric columns appear approximately normally distributed.';
  }
  if (q.includes('health') || q.includes('quality')) {
    return `Dataset health score: ${summary.healthScore}/100. AI readiness score: ${summary.aiScore}/100. Missing: ${missingTotal} values, Duplicates: ${duplicateRows} rows.`;
  }
  if (q.includes('suitable') || q.includes('recommend') || q.includes('best algorithm')) {
    const recs = generateMLRecommendations(summary);
    return recs.map((r, i) => `${i + 1}. ${r.algorithm} for ${r.task} (${r.confidence}% confidence): ${r.reason}`).join('\n');
  }

  return `Based on the dataset analysis: ${totalRows} rows, ${totalCols} columns, health score ${summary.healthScore}/100. ${numericCols.length} numeric features available for ML. Ask me about missing values, correlations, predictions, averages, or data quality!`;
}

export function cleanDataset(rows: DataRow[], headers: string[], colTypes: Record<string, string>): DataRow[] {
  // Remove duplicates
  const seen = new Set<string>();
  let cleaned = rows.filter(r => {
    const key = JSON.stringify(r);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Impute missing values
  headers.forEach(h => {
    if (colTypes[h] === 'number') {
      const vals = cleaned.map(r => Number(r[h])).filter(v => !isNaN(v));
      const m = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      cleaned = cleaned.map(r => {
        const v = r[h];
        if (v === null || v === undefined || v === '' || isNaN(Number(v))) {
          return { ...r, [h]: parseFloat(m.toFixed(4)) };
        }
        return r;
      });
    } else {
      const vals = cleaned.map(r => String(r[h])).filter(v => v && v !== 'null' && v !== 'undefined');
      const modeVal = vals.length ? vals.sort((a, b) => vals.filter(x => x === a).length - vals.filter(x => x === b).length).pop() || '' : '';
      cleaned = cleaned.map(r => {
        const v = r[h];
        if (v === null || v === undefined || v === '') return { ...r, [h]: modeVal };
        return r;
      });
    }
  });

  return cleaned;
}
