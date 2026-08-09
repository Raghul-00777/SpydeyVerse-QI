import { useRef, useState, DragEvent } from 'react';
import { Upload, File, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ParsedDataset, DataRow } from './types';

interface Props { onDataset: (d: ParsedDataset) => void; }

const ACCEPTED = ['.csv', '.xlsx', '.xls', '.json'];
const MAX_MB = 50;

function parseCSV(text: string, name: string, size: number): ParsedDataset {
  const result = Papa.parse<DataRow>(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
  return { name, format: 'csv', sizeBytes: size, rows: result.data, headers: result.meta.fields || [] };
}

function parseJSON(text: string, name: string, size: number): ParsedDataset {
  const parsed = JSON.parse(text);
  const arr: DataRow[] = Array.isArray(parsed) ? parsed : (parsed.data || parsed.records || [parsed]);
  const headers = arr.length ? Object.keys(arr[0]) : [];
  return { name, format: 'json', sizeBytes: size, rows: arr, headers };
}

function parseExcel(buffer: ArrayBuffer, name: string, size: number): ParsedDataset {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<DataRow>(ws, { defval: '' });
  const headers = rows.length ? Object.keys(rows[0]) : [];
  return { name, format: 'xlsx', sizeBytes: size, rows, headers };
}

async function processFile(file: File): Promise<ParsedDataset> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const size = file.size;
  if (ext === 'csv') {
    const text = await file.text();
    return parseCSV(text, file.name, size);
  }
  if (ext === 'json') {
    const text = await file.text();
    return parseJSON(text, file.name, size);
  }
  if (ext === 'xlsx' || ext === 'xls') {
    const buf = await file.arrayBuffer();
    return parseExcel(buf, file.name, size);
  }
  throw new Error(`Unsupported format: .${ext}`);
}

export default function UploadZone({ onDataset }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  async function handle(file: File) {
    if (file.size > MAX_MB * 1048576) {
      setError(`File too large. Max size is ${MAX_MB} MB.`);
      setStatus('error');
      return;
    }
    if (!ACCEPTED.some(e => file.name.toLowerCase().endsWith(e))) {
      setError(`Unsupported format. Accepted: ${ACCEPTED.join(', ')}`);
      setStatus('error');
      return;
    }
    setFileName(file.name);
    setStatus('parsing');
    setProgress(0);
    setError('');

    // Simulate progress
    const tick = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 120);
    try {
      const dataset = await processFile(file);
      clearInterval(tick);
      setProgress(100);
      setStatus('done');
      setTimeout(() => onDataset(dataset), 300);
    } catch (e: unknown) {
      clearInterval(tick);
      setError(e instanceof Error ? e.message : 'Failed to parse file.');
      setStatus('error');
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handle(file);
  };

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handle(file);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-300 ${
          dragging
            ? 'border-red-500 bg-red-600/10 scale-[1.01]'
            : 'border-white/15 hover:border-red-500/50 hover:bg-red-600/5'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED.join(',')}
          onChange={onFileChange}
        />

        {status === 'idle' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <Upload size={28} className="text-red-400" />
            </div>
            <div className="text-base font-semibold text-white mb-2">Drop your dataset here</div>
            <div className="text-sm text-slate-500 mb-5">or click to browse</div>
            <div className="flex flex-wrap justify-center gap-2">
              {['CSV', 'Excel .xlsx', 'JSON', 'SQL', 'Parquet'].map(f => (
                <span key={f} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-slate-400">{f}</span>
              ))}
            </div>
            <div className="text-[11px] text-slate-600 mt-4">Max {MAX_MB} MB · Encrypted in transit</div>
          </>
        )}

        {status === 'parsing' && (
          <div className="flex flex-col items-center gap-4">
            <Loader size={28} className="text-red-400 animate-spin" />
            <div className="text-sm font-medium text-white">{fileName}</div>
            <div className="w-48 bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-slate-500">{progress < 50 ? 'Reading file...' : progress < 90 ? 'Parsing data...' : 'Finalising...'}</div>
          </div>
        )}

        {status === 'done' && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={32} className="text-emerald-400" />
            <div className="text-sm font-semibold text-emerald-400">Dataset loaded successfully</div>
            <div className="text-xs text-slate-500">{fileName}</div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle size={32} className="text-rose-400" />
            <div className="text-sm font-semibold text-rose-400">{error}</div>
            <button
              onClick={e => { e.stopPropagation(); setStatus('idle'); }}
              className="text-xs text-slate-400 hover:text-white transition-colors underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Supported formats */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { fmt: 'CSV', icon: '📊', desc: 'Comma-separated values — most common format' },
          { fmt: 'Excel', icon: '📋', desc: '.xlsx and .xls workbooks supported' },
          { fmt: 'JSON', icon: '{ }', desc: 'Array of objects or nested structures' },
        ].map(({ fmt, icon, desc }) => (
          <div key={fmt} className="glass rounded-xl p-4 border border-white/5 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-xs font-semibold text-white mb-0.5">{fmt}</div>
            <div className="text-[10px] text-slate-600 leading-snug">{desc}</div>
          </div>
        ))}
      </div>

      {/* Recent uploads hint */}
      <div className="mt-6 glass rounded-xl p-4 border border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <File size={13} className="text-red-400" />
          <span className="text-xs font-semibold text-white">Tips for best results</span>
        </div>
        <ul className="space-y-1.5">
          {[
            'Include a header row with meaningful column names',
            'Ensure consistent data types within each column',
            'UTF-8 encoding is recommended for CSV files',
            'For Excel files, use the first sheet for your data',
          ].map(tip => (
            <li key={tip} className="flex items-start gap-2 text-[11px] text-slate-500">
              <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
