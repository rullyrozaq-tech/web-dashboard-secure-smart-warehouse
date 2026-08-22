import { useState, useMemo } from 'react';
import { auditEntries, materials, storageLocations, iotDevices, type TransactionType } from '../data/mock';

// ─── Constants ───────────────────────────────────────────────────────────────

const txTypeColor: Record<TransactionType, string> = {
  PENERIMAAN: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  TRANSFER:   'text-blue-400 bg-blue-400/10 border-blue-400/30',
  KELUAR:     'text-red-400 bg-red-400/10 border-red-400/30',
  ADJUST:     'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

const txBadge: Record<TransactionType, string> = {
  PENERIMAAN: 'IN',
  TRANSFER:   'TRF',
  KELUAR:     'OUT',
  ADJUST:     'ADJ',
};

type QuickMode = 'all' | 'today' | 'day' | 'week' | 'month' | 'year' | 'custom';

const quickModes: { key: QuickMode; label: string }[] = [
  { key: 'all',    label: 'Semua Data' },
  { key: 'today',  label: 'Hari Ini' },
  { key: 'day',    label: 'Per Hari' },
  { key: 'week',   label: 'Per Minggu' },
  { key: 'month',  label: 'Per Bulan' },
  { key: 'year',   label: 'Per Tahun' },
  { key: 'custom', label: 'Rentang Kustom' },
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isoWeekToRange(yearWeek: string): [Date, Date] | null {
  const m = yearWeek.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return null;
  const year = parseInt(m[1]), week = parseInt(m[2]);
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay() || 7;
  const mon = new Date(jan4);
  mon.setDate(jan4.getDate() - (dow - 1) + (week - 1) * 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return [mon, sun];
}

function resolveRange(mode: QuickMode, val: string, customEnd: string): [Date, Date] | null {
  if (mode === 'all') return null;

  if (mode === 'today') {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const e = new Date(); e.setHours(23, 59, 59, 999);
    return [d, e];
  }

  if (mode === 'day' && val) {
    const s = new Date(val); s.setHours(0, 0, 0, 0);
    const e = new Date(val); e.setHours(23, 59, 59, 999);
    return [s, e];
  }

  if (mode === 'week' && val) {
    const r = isoWeekToRange(val);
    if (!r) return null;
    r[0].setHours(0, 0, 0, 0);
    r[1].setHours(23, 59, 59, 999);
    return r;
  }

  if (mode === 'month' && val) {
    const [y, mo] = val.split('-').map(Number);
    const s = new Date(y, mo - 1, 1, 0, 0, 0, 0);
    const e = new Date(y, mo, 0, 23, 59, 59, 999);
    return [s, e];
  }

  if (mode === 'year' && val) {
    const y = parseInt(val);
    if (!isNaN(y)) return [new Date(y, 0, 1, 0, 0, 0, 0), new Date(y, 11, 31, 23, 59, 59, 999)];
  }

  if (mode === 'custom' && val && customEnd) {
    const s = new Date(val); s.setHours(0, 0, 0, 0);
    const e = new Date(customEnd); e.setHours(23, 59, 59, 999);
    if (s <= e) return [s, e];
  }

  return null;
}

const IDfmt = (d: Date) =>
  d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const IDfmtShort = (d: Date) =>
  d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  'bg-[var(--secondary)] border border-[var(--border)] rounded px-2.5 py-1.5 text-[11px] ' +
  'text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-mono-data ' +
  'hover:border-[var(--primary)]/50 transition-colors';

// ─── Sub-picker component ─────────────────────────────────────────────────────

function SubPicker({
  mode, value, customEnd,
  onChange, onChangeEnd,
}: {
  mode: QuickMode;
  value: string;
  customEnd: string;
  onChange: (v: string) => void;
  onChangeEnd: (v: string) => void;
}) {
  const years = [2024, 2025, 2026, 2027];

  if (mode === 'day') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--muted-foreground)] font-mono-data">Pilih tanggal:</span>
        <input type="date" value={value} onChange={e => onChange(e.target.value)}
          className={inputCls} style={{ colorScheme: 'dark' }} />
      </div>
    );
  }

  if (mode === 'week') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--muted-foreground)] font-mono-data">Pilih minggu:</span>
        <input type="week" value={value} onChange={e => onChange(e.target.value)}
          className={inputCls} style={{ colorScheme: 'dark' }} />
        {value && (() => {
          const r = isoWeekToRange(value);
          return r ? (
            <span className="text-[10px] text-cyan-400/70 font-mono-data">
              ({IDfmtShort(r[0])} – {IDfmtShort(r[1])})
            </span>
          ) : null;
        })()}
      </div>
    );
  }

  if (mode === 'month') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--muted-foreground)] font-mono-data">Pilih bulan:</span>
        <input type="month" value={value} onChange={e => onChange(e.target.value)}
          className={inputCls} style={{ colorScheme: 'dark' }} />
      </div>
    );
  }

  if (mode === 'year') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--muted-foreground)] font-mono-data">Pilih tahun:</span>
        <select value={value} onChange={e => onChange(e.target.value)}
          className={inputCls + ' cursor-pointer'}>
          <option value="">-- Pilih --</option>
          {years.map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>
    );
  }

  if (mode === 'custom') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--muted-foreground)] font-mono-data">Dari:</span>
        <input type="date" value={value} onChange={e => onChange(e.target.value)}
          className={inputCls} style={{ colorScheme: 'dark' }} />
        <span className="text-[10px] text-[var(--muted-foreground)] font-mono-data">s/d:</span>
        <input type="date" value={customEnd} min={value || undefined}
          onChange={e => onChangeEnd(e.target.value)}
          className={inputCls} style={{ colorScheme: 'dark' }} />
      </div>
    );
  }

  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AuditTrail() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');

  // Date filter state
  const [quickMode, setQuickMode] = useState<QuickMode>('all');
  const [pickerValue, setPickerValue] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Computed date range
  const dateRange = useMemo(
    () => resolveRange(quickMode, pickerValue, customEnd),
    [quickMode, pickerValue, customEnd]
  );

  const handleModeChange = (mode: QuickMode) => {
    setQuickMode(mode);
    setPickerValue(mode === 'today' ? todayStr() : mode === 'day' ? todayStr() : '');
    setCustomEnd('');
  };

  const clearDateFilter = () => {
    setQuickMode('all');
    setPickerValue('');
    setCustomEnd('');
  };

  // Combined filter
  const filtered = useMemo(() => {
    return auditEntries.filter(e => {
      if (filterType !== 'ALL' && e.tipeTransaksi !== filterType) return false;

      if (dateRange) {
        const ts = new Date(e.timestamp);
        if (ts < dateRange[0] || ts > dateRange[1]) return false;
      }

      if (search) {
        const q = search.toLowerCase();
        const mat = materials.find(m => m.id === e.materialId);
        const loc = storageLocations.find(l => l.id === e.locationId);
        return (
          e.referensi.toLowerCase().includes(q) ||
          e.userId.toLowerCase().includes(q) ||
          e.deviceId.toLowerCase().includes(q) ||
          mat?.kode.toLowerCase().includes(q) ||
          mat?.nama.toLowerCase().includes(q) ||
          loc?.nama.toLowerCase().includes(q) ||
          e.keterangan.toLowerCase().includes(q) ||
          false
        );
      }

      return true;
    });
  }, [filterType, dateRange, search]);

  const isDateFiltered = quickMode !== 'all' && dateRange !== null;

  const summaryLabel = (() => {
    if (!dateRange) return null;
    const [s, e] = dateRange;
    const sameDay = s.toDateString() === e.toDateString();
    return sameDay ? IDfmt(s) : `${IDfmt(s)} – ${IDfmt(e)}`;
  })();

  const quickModeLabel = quickModes.find(m => m.key === quickMode)?.label ?? '';

  return (
    <div className="p-5 space-y-4">

      {/* ── Stats (reflect current filter) ── */}
      <div className="grid grid-cols-4 gap-3">
        {(['ALL', 'PENERIMAAN', 'TRANSFER', 'KELUAR'] as const).map(t => {
          const count = t === 'ALL'
            ? filtered.length
            : filtered.filter(e => e.tipeTransaksi === t).length;
          const label = t === 'ALL' ? 'Hasil Filter' : t === 'PENERIMAAN' ? 'Penerimaan (IN)' : t === 'KELUAR' ? 'Pengeluaran (OUT)' : 'Transfer';
          const colors: Record<string, string> = {
            ALL: 'text-[var(--foreground)]', PENERIMAAN: 'text-cyan-400', TRANSFER: 'text-blue-400', KELUAR: 'text-red-400',
          };
          return (
            <div key={t} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <div className="text-[10px] font-mono-data text-[var(--muted-foreground)] uppercase tracking-widest">{label}</div>
              <div className={`text-xl font-display font-bold ${colors[t]}`}>{count}</div>
              {t === 'ALL' && (
                <div className="text-[9px] font-mono-data text-[var(--muted-foreground)] mt-0.5">
                  dari {auditEntries.length} total
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Date filter panel ── */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[var(--primary)] shrink-0">
            <rect x="1" y="2" width="14" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M1 6h14" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-[10px] font-mono-data text-[var(--muted-foreground)] uppercase tracking-wide">Filter Periode</span>
        </div>

        {/* Quick mode tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {quickModes.map(m => (
            <button key={m.key} onClick={() => handleModeChange(m.key)}
              className={`px-2.5 py-1 rounded border text-[10px] font-mono-data font-medium transition-colors ${
                quickMode === m.key
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-cyan-400/10'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40 hover:text-[var(--foreground)]'
              }`}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Sub-picker */}
        {quickMode !== 'all' && quickMode !== 'today' && (
          <div className="pt-1">
            <SubPicker
              mode={quickMode}
              value={pickerValue}
              customEnd={customEnd}
              onChange={setPickerValue}
              onChangeEnd={setCustomEnd}
            />
          </div>
        )}
      </div>

      {/* ── Active filter badge + summary ── */}
      {(isDateFiltered || filterType !== 'ALL') && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date badge */}
          {isDateFiltered && summaryLabel && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan-400/40 bg-cyan-400/8 text-[10px] font-mono-data text-cyan-400">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2" width="14" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M1 6h14" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
              <span>{quickModeLabel}: {summaryLabel}</span>
              <button onClick={clearDateFilter}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* Type badge */}
          {filterType !== 'ALL' && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono-data ${txTypeColor[filterType]}`}>
              <span>Tipe: {txBadge[filterType]}</span>
              <button onClick={() => setFilterType('ALL')}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* Summary count */}
          <span className="text-[10px] font-mono-data text-[var(--muted-foreground)] ml-1">
            Menampilkan{' '}
            <span className="text-[var(--foreground)] font-semibold">{filtered.length}</span>
            {' '}transaksi
            {isDateFiltered && summaryLabel && (
              <> dari <span className="text-cyan-400">{summaryLabel}</span></>
            )}
          </span>

          {/* Clear all */}
          <button
            onClick={() => { clearDateFilter(); setFilterType('ALL'); setSearch(''); }}
            className="ml-auto text-[10px] font-mono-data text-[var(--muted-foreground)] hover:text-red-400 transition-colors flex items-center gap-1">
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Reset semua filter
          </button>
        </div>
      )}

      {/* ── Search + type filter ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari referensi, material, lokasi, user, atau device..."
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-3 py-2 pl-8 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono-data text-[var(--muted-foreground)]">TIPE:</span>
          {(['ALL', 'PENERIMAAN', 'TRANSFER', 'KELUAR', 'ADJUST'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded border text-[10px] font-mono-data font-medium transition-colors ${
                filterType === t
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-cyan-400/10'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50'
              }`}>
              {t === 'ALL' ? 'Semua' : txBadge[t as TransactionType] || t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Waktu</th><th>Tipe</th><th>Referensi SAP</th>
              <th>Material</th><th>Storage Location</th>
              <th style={{ textAlign: 'right' }}>Δ Jumlah</th>
              <th style={{ textAlign: 'right' }}>Δ Berat (kg)</th>
              <th>User</th><th>Device</th><th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(entry => {
              const mat = materials.find(m => m.id === entry.materialId);
              const loc = storageLocations.find(l => l.id === entry.locationId);
              const dev = iotDevices.find(d => d.id === entry.deviceId);
              const txCls = txTypeColor[entry.tipeTransaksi] || '';
              const badge = txBadge[entry.tipeTransaksi] || entry.tipeTransaksi;
              return (
                <tr key={entry.id}>
                  <td>
                    <div className="text-[9px] font-mono-data text-[var(--muted-foreground)] whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-[8px] font-mono-data text-[var(--muted-foreground)]/60">
                      {new Date(entry.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-mono-data font-bold tracking-wider ${txCls}`}>
                      {badge}
                    </span>
                  </td>
                  <td><span className="font-mono-data text-[var(--primary)] text-xs">{entry.referensi}</span></td>
                  <td>
                    <div className="text-xs font-medium text-[var(--foreground)]">{mat?.nama}</div>
                    <div className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{mat?.kode}</div>
                  </td>
                  <td>
                    <div className="text-xs text-[var(--foreground)]">{loc?.nama || entry.locationId}</div>
                    <div className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{loc?.kode}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`font-mono-data font-bold text-sm ${entry.deltaJumlah > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {entry.deltaJumlah > 0 ? '+' : ''}{entry.deltaJumlah.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`font-mono-data text-xs ${entry.deltaBerat > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {entry.deltaBerat > 0 ? '+' : ''}{entry.deltaBerat.toFixed(2)}
                    </span>
                  </td>
                  <td><span className="font-mono-data text-[9px] text-[var(--muted-foreground)]">{entry.userId}</span></td>
                  <td><div className="text-[9px] font-mono-data text-cyan-400">{dev?.deviceId || entry.deviceId}</div></td>
                  <td><span className="text-[10px] text-[var(--muted-foreground)]">{entry.keterangan}</span></td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={10}>
                  <div className="flex flex-col items-center justify-center py-14 gap-3">
                    <div className="w-14 h-14 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M8 2v2M16 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M8 14h4M8 17h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.4"/>
                        <path d="M17 17l-3-3m0 3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="text-sm font-display font-semibold text-[var(--foreground)]">
                      Tidak ada transaksi pada periode ini
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center max-w-xs leading-relaxed">
                      {isDateFiltered && summaryLabel
                        ? `Tidak ditemukan log audit untuk periode ${summaryLabel}.`
                        : 'Tidak ada data yang sesuai dengan filter yang dipilih.'}
                      {' '}Coba ubah rentang tanggal atau reset filter.
                    </div>
                    <button
                      onClick={() => { clearDateFilter(); setFilterType('ALL'); setSearch(''); }}
                      className="mt-1 px-4 py-1.5 rounded border border-[var(--border)] text-[11px] font-mono-data text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                      Reset semua filter
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
