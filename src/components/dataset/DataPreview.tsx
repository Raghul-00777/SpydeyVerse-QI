import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DataRow } from './types';

interface Props { rows: DataRow[]; headers: string[]; }

const PAGE_SIZES = [10, 25, 50, 100];

export default function DataPreview({ rows, headers }: Props) {
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortCol, setSortCol]   = useState<string | null>(null);
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc');
  const [filterCol, setFilterCol] = useState('');
  const [filterVal, setFilterVal] = useState('');

  const filtered = useMemo(() => {
    let data = rows;
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(s)));
    }
    if (filterCol && filterVal) {
      data = data.filter(r => String(r[filterCol]).toLowerCase().includes(filterVal.toLowerCase()));
    }
    if (sortCol) {
      data = [...data].sort((a, b) => {
        const av = a[sortCol], bv = b[sortCol];
        const n = Number(av), m = Number(bv);
        if (!isNaN(n) && !isNaN(m)) return sortDir === 'asc' ? n - m : m - n;
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return data;
  }, [rows, search, filterCol, filterVal, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageRows   = filtered.slice(page * pageSize, page * pageSize + pageSize);

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(0);
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ChevronsUpDown size={12} className="text-slate-600" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-red-400" />
      : <ChevronDown size={12} className="text-red-400" />;
  };

  const missing = (val: unknown) => val === null || val === undefined || val === '';

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={13} className="text-slate-500 flex-shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search all columns..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
          />
        </div>
        <select
          value={filterCol}
          onChange={e => { setFilterCol(e.target.value); setFilterVal(''); setPage(0); }}
          className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-slate-400 focus:outline-none focus:border-red-500/50"
        >
          <option value="">Filter by column</option>
          {headers.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        {filterCol && (
          <input
            value={filterVal}
            onChange={e => { setFilterVal(e.target.value); setPage(0); }}
            placeholder={`Filter ${filterCol}...`}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-slate-400 focus:outline-none focus:border-red-500/50 w-32"
          />
        )}
        <select
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
          className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-slate-400 focus:outline-none"
        >
          {PAGE_SIZES.map(s => <option key={s} value={s}>{s} rows</option>)}
        </select>
        <div className="text-[11px] text-slate-600">
          {filtered.length.toLocaleString()} / {rows.length.toLocaleString()} rows
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-xs min-w-max">
          <thead>
            <tr className="border-b border-white/5 bg-white/3">
              <th className="px-3 py-2.5 text-left text-[10px] text-slate-600 font-medium w-10">#</th>
              {headers.map(h => (
                <th
                  key={h}
                  onClick={() => toggleSort(h)}
                  className="px-3 py-2.5 text-left text-[10px] text-slate-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {h} <SortIcon col={h} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pageRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-white/3 transition-colors">
                <td className="px-3 py-2 text-slate-700 text-[10px]">{page * pageSize + ri + 1}</td>
                {headers.map(h => (
                  <td key={h} className={`px-3 py-2 whitespace-nowrap max-w-[200px] truncate ${missing(row[h]) ? 'text-rose-600 italic' : 'text-slate-300'}`}>
                    {missing(row[h]) ? 'null' : String(row[h])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {pageRows.length === 0 && (
          <div className="py-12 text-center text-slate-600 text-sm">No rows match your search.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="px-2 py-1 rounded glass border border-white/5 disabled:opacity-30 hover:border-red-500/30 transition-colors"
          >«</button>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-2 py-1 rounded glass border border-white/5 disabled:opacity-30 hover:border-red-500/30 transition-colors"
          ><ChevronLeft size={12} /></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-2.5 py-1 rounded ${page === p ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'glass border border-white/5 hover:border-red-500/20'} transition-colors`}
              >
                {p + 1}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-2 py-1 rounded glass border border-white/5 disabled:opacity-30 hover:border-red-500/30 transition-colors"
          ><ChevronRight size={12} /></button>
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className="px-2 py-1 rounded glass border border-white/5 disabled:opacity-30 hover:border-red-500/30 transition-colors"
          >»</button>
        </div>
      </div>
    </div>
  );
}
