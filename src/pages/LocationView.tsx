import { useState, useMemo, useEffect } from 'react';
import {
  warehouseMapLocations, storageLocations, materials,
  type WarehouseMapLocation, type MapLocationStatus,
} from '../data/mock';

const statusConfig: Record<MapLocationStatus, { bg: string; border: string; label: string; dot: string; barColor: string }> = {
  KOSONG:       { bg: 'bg-[#0f1629] hover:bg-[#162032]',         border: 'border-[#1e2a45]',           label: 'Kosong',       dot: 'bg-[#334155]',    barColor: 'transparent' },
  TERISI:       { bg: 'bg-cyan-900/40 hover:bg-cyan-900/60',      border: 'border-cyan-700/50',          label: 'Terisi',       dot: 'bg-cyan-400',     barColor: 'rgba(6,182,212,0.55)' },
  HAMPIR_PENUH: { bg: 'bg-yellow-900/30 hover:bg-yellow-900/50',  border: 'border-yellow-600/50',        label: 'Hampir Penuh', dot: 'bg-yellow-400',   barColor: 'rgba(234,179,8,0.7)' },
  PENUH:        { bg: 'bg-orange-900/40 hover:bg-orange-900/60',  border: 'border-orange-600/50',        label: 'Penuh',        dot: 'bg-orange-400',   barColor: 'rgba(249,115,22,0.75)' },
  PERAWATAN:    { bg: 'bg-red-900/30 hover:bg-red-900/50',        border: 'border-red-700/40',           label: 'Perawatan',    dot: 'bg-red-400',      barColor: 'rgba(239,68,68,0.5)' },
};

// Each StorageLocation maps to a zona in the grid
const locationToZona: Record<string, string> = {
  LOC001: 'A',
  LOC002: 'B',
  LOC003: 'C',
};

const zoneMeta: Record<string, { label: string; color: string; border: string }> = {
  A: { label: 'Zona A – General Storage',    color: 'text-cyan-400',    border: 'border-cyan-400/30 bg-cyan-400/5' },
  B: { label: 'Zona B – Chemical Storage',   color: 'text-purple-400',  border: 'border-purple-400/30 bg-purple-400/5' },
  C: { label: 'Zona C – Electrical Storage', color: 'text-emerald-400', border: 'border-emerald-400/30 bg-emerald-400/5' },
};

// ─── Detail Panel ────────────────────────────────────────────────────────────
function DetailPanel({ loc, onClose }: { loc: WarehouseMapLocation; onClose: () => void }) {
  const cfg = statusConfig[loc.status];
  const pct = loc.kapasitas > 0 ? Math.round((loc.terpakai / loc.kapasitas) * 100) : 0;
  const mat = materials.find(m => m.id === loc.materialId);
  const parentLoc = storageLocations.find(l => l.id === loc.locationId);
  const zm = zoneMeta[loc.zona];

  return (
    <div className="flex flex-col h-full border-l border-[var(--border)] bg-[var(--card)]" style={{ width: 288, flexShrink: 0 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div>
          <div className="text-sm font-display font-bold text-[var(--foreground)]">{loc.kode}</div>
          <div className="text-[10px] font-mono-data text-[var(--muted-foreground)]">
            Baris {loc.baris} · Kol {loc.kolom} · Level {loc.level}
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Parent location */}
        {parentLoc && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded border text-[10px] font-mono-data ${zm.border} ${zm.color}`}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="6" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="6" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/></svg>
            <span className="font-semibold">{parentLoc.nama}</span>
            <span className="opacity-60">·</span>
            <span className="opacity-70">{zm.label.split('–')[1]?.trim()}</span>
          </div>
        )}

        {/* Occupancy */}
        <div className="rounded border border-[var(--border)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-data text-[var(--muted-foreground)] uppercase tracking-wide">Kapasitas Bin</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              <span className="text-[10px] font-mono-data font-semibold text-[var(--foreground)]">{cfg.label}</span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-[var(--secondary)] overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{
              width: `${pct}%`,
              background: cfg.barColor === 'transparent' ? 'transparent' : cfg.barColor,
            }} />
          </div>
          <div className="flex justify-between text-[10px] font-mono-data">
            <span className="text-[var(--foreground)] font-semibold">{loc.terpakai} / {loc.kapasitas} unit</span>
            <span className="text-[var(--muted-foreground)]">{pct}% terpakai</span>
          </div>
        </div>

        {/* Material */}
        {mat ? (
          <div className="rounded border border-cyan-400/20 bg-cyan-400/5 p-3 space-y-2">
            <div className="text-[10px] font-mono-data text-[var(--muted-foreground)] uppercase tracking-wide">Material</div>
            <div className="text-xs font-display font-semibold text-[var(--foreground)]">{mat.nama}</div>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono-data">
              <span className="text-[var(--muted-foreground)]">Kode:</span><span className="text-cyan-400">{mat.kode}</span>
              <span className="text-[var(--muted-foreground)]">RFID:</span><span className="text-cyan-300 truncate">{mat.rfidTag}</span>
              <span className="text-[var(--muted-foreground)]">Satuan:</span><span className="text-[var(--foreground)]">{mat.satuan}</span>
            </div>
          </div>
        ) : loc.status !== 'PERAWATAN' ? (
          <div className="rounded border border-[var(--border)] p-3 text-center">
            <div className="text-[11px] text-[var(--muted-foreground)]">Tidak ada material tersimpan</div>
          </div>
        ) : null}

        {/* Environment */}
        {loc.suhu != null && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded border border-[var(--border)] p-2.5">
              <div className="text-[9px] font-mono-data text-[var(--muted-foreground)] mb-1">SUHU</div>
              <div className="text-xl font-display font-bold text-[var(--foreground)]">{loc.suhu}°<span className="text-sm">C</span></div>
              <div className="mt-1.5 h-1 rounded-full bg-[var(--secondary)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(loc.suhu / 40) * 100}%`, background: loc.suhu > 30 ? '#f97316' : '#06b6d4' }} />
              </div>
              <div className="text-[8px] font-mono-data text-[var(--muted-foreground)] mt-0.5">normal &lt;30°C</div>
            </div>
            <div className="rounded border border-[var(--border)] p-2.5">
              <div className="text-[9px] font-mono-data text-[var(--muted-foreground)] mb-1">KELEMBABAN</div>
              <div className="text-xl font-display font-bold text-[var(--foreground)]">{loc.kelembaban ?? '–'}<span className="text-sm">%</span></div>
              <div className="mt-1.5 h-1 rounded-full bg-[var(--secondary)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${loc.kelembaban ?? 0}%`, background: (loc.kelembaban ?? 0) > 70 ? '#f97316' : '#22c55e' }} />
              </div>
              <div className="text-[8px] font-mono-data text-[var(--muted-foreground)] mt-0.5">normal 30–70%</div>
            </div>
          </div>
        )}

        {loc.status === 'PERAWATAN' && (
          <div className="p-3 rounded border border-red-400/30 bg-red-400/5 text-xs text-red-400 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 14h14L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 6v4M8 12v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Bin sedang dalam perawatan / tidak tersedia
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Grid cell ───────────────────────────────────────────────────────────────
function LocationCell({ loc, selected, onClick }: { loc: WarehouseMapLocation; selected: boolean; onClick: () => void }) {
  const cfg = statusConfig[loc.status];
  const pct = loc.kapasitas > 0 ? Math.round((loc.terpakai / loc.kapasitas) * 100) : 0;

  return (
    <button
      onClick={onClick}
      title={`${loc.kode}\n${cfg.label}${pct > 0 ? ` · ${pct}%` : ''}`}
      className={`relative rounded border transition-all duration-100 cursor-pointer ${cfg.bg} ${cfg.border} ${selected ? 'ring-1 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--background)] z-10' : ''}`}
      style={{ width: 30, height: 30, flexShrink: 0 }}
    >
      {loc.status !== 'KOSONG' && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2" style={{ width: 16 }}>
          <div className="rounded-t-[1px] w-full" style={{
            height: Math.max(2, Math.round(pct * 0.16)),
            background: cfg.barColor,
            minHeight: 2,
          }} />
        </div>
      )}
      {loc.status === 'PERAWATAN' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-red-400 text-[9px] font-bold leading-none">!</span>
        </div>
      )}
    </button>
  );
}

// ─── Stats bar ───────────────────────────────────────────────────────────────
function StatsBar({ bins }: { bins: WarehouseMapLocation[] }) {
  const s = {
    total:    bins.length,
    kosong:   bins.filter(b => b.status === 'KOSONG').length,
    terisi:   bins.filter(b => b.status === 'TERISI').length,
    hampir:   bins.filter(b => b.status === 'HAMPIR_PENUH').length,
    penuh:    bins.filter(b => b.status === 'PENUH').length,
    perawatan:bins.filter(b => b.status === 'PERAWATAN').length,
  };
  const items = [
    { label: 'Total Bin', val: s.total,     color: 'text-[var(--foreground)]' },
    { label: 'Kosong',    val: s.kosong,    color: 'text-[var(--muted-foreground)]' },
    { label: 'Terisi',    val: s.terisi,    color: 'text-cyan-400' },
    { label: 'Hampir Penuh', val: s.hampir, color: 'text-yellow-400' },
    { label: 'Penuh',     val: s.penuh,     color: 'text-orange-400' },
    { label: 'Perawatan', val: s.perawatan, color: 'text-red-400' },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map(i => (
        <div key={i.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--secondary)]">
          <span className={`text-sm font-display font-bold ${i.color}`}>{i.val}</span>
          <span className="text-[10px] text-[var(--muted-foreground)] font-mono-data">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
interface Props {
  initialLocationId: string | null;
  onLocationFilterChange: (id: string | null) => void;
}

export default function LocationView({ initialLocationId, onLocationFilterChange }: Props) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(initialLocationId);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<MapLocationStatus | 'ALL'>('ALL');
  const [filterLevel, setFilterLevel] = useState<number | 'ALL'>('ALL');

  // Sync when parent pushes a new initialLocationId (e.g. from Dashboard click)
  useEffect(() => {
    setSelectedLocationId(initialLocationId);
    setSelectedBinId(null);
    setSearchQuery('');
    setFilterStatus('ALL');
    setFilterLevel('ALL');
  }, [initialLocationId]);

  const selectedLocation = selectedLocationId
    ? storageLocations.find(l => l.id === selectedLocationId) ?? null
    : null;

  // The zona(s) to show based on selected location
  const activeZona = selectedLocationId ? locationToZona[selectedLocationId] : null;

  // Full filtered set of bins
  const filteredBins = useMemo(() => {
    return warehouseMapLocations.filter(b => {
      if (selectedLocationId && b.locationId !== selectedLocationId) return false;
      if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
      if (filterLevel !== 'ALL' && b.level !== filterLevel) return false;
      if (searchQuery && !b.kode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [selectedLocationId, filterStatus, filterLevel, searchQuery]);

  const selectedBin = selectedBinId
    ? warehouseMapLocations.find(b => b.id === selectedBinId) ?? null
    : null;

  const handleLocationChange = (id: string | null) => {
    setSelectedLocationId(id);
    setSelectedBinId(null);
    onLocationFilterChange(id);
  };

  // Zones to render — if a location is selected show only its zona, else all
  const zonesToRender = activeZona ? [activeZona] : ['A', 'B', 'C'];
  const maxBaris = 4;
  const maxKolom = 8;
  const levels: number[] = [1, 2, 3];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="px-4 pt-3 pb-3 border-b border-[var(--border)] bg-[var(--card)] space-y-3">

          {/* Breadcrumb + Location selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs font-mono-data">
              <button
                onClick={() => handleLocationChange(null)}
                className={`transition-colors ${!selectedLocation ? 'text-[var(--primary)] font-semibold' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
              >
                Storage Location
              </button>
              {selectedLocation && (
                <>
                  <svg width="8" height="8" viewBox="0 0 16 16" fill="none" className="text-[var(--muted-foreground)]">
                    <path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={`font-semibold ${zoneMeta[activeZona!]?.color}`}>{selectedLocation.nama}</span>
                  <span className="text-[var(--muted-foreground)] text-[10px]">({selectedLocation.kode})</span>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-[var(--border)]" />

            {/* Location dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono-data text-[var(--muted-foreground)] uppercase tracking-wide">Location:</span>
              <button
                onClick={() => handleLocationChange(null)}
                className={`px-2.5 py-1 rounded border text-[10px] font-mono-data font-semibold transition-colors ${!selectedLocationId ? 'border-[var(--primary)] text-[var(--primary)] bg-cyan-400/10' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40'}`}
              >
                Semua
              </button>
              {storageLocations.map(loc => {
                const zm = zoneMeta[locationToZona[loc.id]];
                const isActive = selectedLocationId === loc.id;
                return (
                  <button key={loc.id}
                    onClick={() => handleLocationChange(loc.id)}
                    className={`px-2.5 py-1 rounded border text-[10px] font-mono-data font-semibold transition-colors ${isActive
                      ? `border-current ${zm.color} bg-current/10`
                      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-current/40'
                    }`}
                    style={isActive ? {} : {}}
                  >
                    {loc.nama}
                  </button>
                );
              })}
            </div>

            {/* Clear filter shortcut */}
            {selectedLocationId && (
              <button onClick={() => handleLocationChange(null)}
                className="ml-auto flex items-center gap-1 text-[10px] font-mono-data text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Tampilkan semua location
              </button>
            )}
          </div>

          {/* Stats — scoped to current filter */}
          <StatsBar bins={filteredBins} />

          {/* Search / Level / Status filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" width="11" height="11" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kode bin..."
                className="bg-[var(--secondary)] border border-[var(--border)] rounded pl-7 pr-3 py-1.5 text-[11px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] w-36" />
            </div>

            <div className="h-4 w-px bg-[var(--border)]" />

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono-data text-[var(--muted-foreground)]">LEVEL:</span>
              {(['ALL', 1, 2, 3] as const).map(l => (
                <button key={l} onClick={() => setFilterLevel(l)}
                  className={`px-2 py-1 rounded border text-[10px] font-mono-data transition-colors ${filterLevel === l ? 'border-[var(--primary)] text-[var(--primary)] bg-cyan-400/10' : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}>
                  {l === 'ALL' ? 'Semua' : `L${l}`}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-[var(--border)]" />

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono-data text-[var(--muted-foreground)]">STATUS:</span>
              {(['ALL', 'KOSONG', 'TERISI', 'HAMPIR_PENUH', 'PENUH', 'PERAWATAN'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-2 py-1 rounded border text-[9px] font-mono-data transition-colors ${filterStatus === s ? 'border-[var(--primary)] text-[var(--primary)] bg-cyan-400/10' : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}>
                  {s === 'ALL' ? 'Semua' : s === 'HAMPIR_PENUH' ? 'Hampir' : statusConfig[s as MapLocationStatus]?.label ?? s}
                </button>
              ))}
            </div>

            <div className="ml-auto text-[10px] font-mono-data text-[var(--muted-foreground)]">
              {filteredBins.length} / {warehouseMapLocations.length} bin
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-[var(--muted-foreground)] font-mono-data uppercase tracking-widest">LEGENDA:</span>
            {(Object.entries(statusConfig) as [MapLocationStatus, typeof statusConfig[MapLocationStatus]][]).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-[2px] border ${v.border} inline-block`} style={{ background: v.barColor === 'transparent' ? '#0f1629' : v.barColor }} />
                <span className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map grid */}
        <div className="flex-1 overflow-auto p-4 space-y-5">
          {zonesToRender.map(zona => {
            const zm = zoneMeta[zona];
            const zoneBins = filteredBins.filter(b => b.zona === zona);
            if (zoneBins.length === 0 && (filterStatus !== 'ALL' || filterLevel !== 'ALL' || searchQuery)) {
              return (
                <div key={zona} className={`rounded-lg border p-4 ${zm.border}`}>
                  <div className={`text-sm font-display font-bold ${zm.color} mb-1`}>{zm.label}</div>
                  <div className="text-[11px] text-[var(--muted-foreground)]">Tidak ada bin yang sesuai filter di zona ini.</div>
                </div>
              );
            }
            if (zoneBins.length === 0) return null;

            return (
              <div key={zona} className={`rounded-lg border p-4 ${zm.border}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`text-sm font-display font-bold ${zm.color}`}>{zm.label}</div>
                  {selectedLocation && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-data">
                      <span className="text-[var(--muted-foreground)]">dalam</span>
                      <span className={`font-semibold ${zm.color}`}>{selectedLocation.nama}</span>
                      <span className="text-[var(--muted-foreground)]">({selectedLocation.kode})</span>
                    </div>
                  )}
                  <div className="ml-auto text-[10px] font-mono-data opacity-60">{zoneBins.length} bin ditampilkan</div>
                </div>

                <div className="space-y-3">
                  {Array.from({ length: maxBaris }, (_, bi) => {
                    const baris = bi + 1;
                    const barisAll = warehouseMapLocations.filter(b => b.zona === zona && b.baris === baris);
                    const barisFiltered = zoneBins.filter(b => b.baris === baris);
                    if (barisAll.length === 0) return null;

                    const displayLevels = filterLevel === 'ALL' ? levels : [filterLevel as number];

                    return (
                      <div key={baris} className="flex items-start gap-3">
                        <div className="w-6 pt-1 flex-shrink-0">
                          <span className="text-[9px] font-mono-data opacity-50">R{baris}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: maxKolom }, (_, ki) => {
                            const kolom = ki + 1;
                            return (
                              <div key={kolom} className="flex flex-col gap-0.5">
                                {displayLevels.map(level => {
                                  const bin = warehouseMapLocations.find(b =>
                                    b.zona === zona && b.baris === baris && b.kolom === kolom && b.level === level
                                  );
                                  if (!bin) return <div key={level} style={{ width: 30, height: 30 }} className="rounded border border-[var(--border)] opacity-10" />;

                                  const isInFilter = barisFiltered.some(b => b.id === bin.id);
                                  const dimmed = !isInFilter && (filterStatus !== 'ALL' || filterLevel !== 'ALL' || searchQuery !== '');
                                  const isSearchMatch = searchQuery && bin.kode.toLowerCase().includes(searchQuery.toLowerCase());

                                  return (
                                    <div key={level}
                                      className={`${dimmed ? 'opacity-20' : ''} ${isSearchMatch ? 'ring-1 ring-yellow-400 ring-offset-1 ring-offset-[var(--background)] rounded' : ''}`}>
                                      <LocationCell
                                        loc={bin}
                                        selected={selectedBinId === bin.id}
                                        onClick={() => setSelectedBinId(selectedBinId === bin.id ? null : bin.id)}
                                      />
                                    </div>
                                  );
                                })}
                                <div className="text-center">
                                  <span className="text-[7px] font-mono-data opacity-30">{kolom}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filterLevel === 'ALL' && (
                  <div className="mt-2 flex items-center gap-0.5 pl-9">
                    {levels.map(l => (
                      <div key={l} className="text-[7px] font-mono-data opacity-30" style={{ width: 30, textAlign: 'center' }}>L{l}</div>
                    ))}
                    <span className="text-[7px] font-mono-data opacity-20 ml-1">per kolom ↓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail side panel */}
      {selectedBin ? (
        <DetailPanel loc={selectedBin} onClose={() => setSelectedBinId(null)} />
      ) : (
        <div className="border-l border-[var(--border)] bg-[var(--card)] flex items-center justify-center flex-col gap-3 p-6 text-center"
          style={{ width: 288, flexShrink: 0 }}>
          <div className="w-12 h-12 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)]">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="9" y="1" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="1" y="6" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="9" y="6" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="1" y="11" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="9" y="11" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] font-display leading-relaxed">
            {selectedLocation
              ? <>Melihat bin di <span className="text-[var(--foreground)] font-semibold">{selectedLocation.nama}</span><br />Klik kotak untuk detail bin</>
              : 'Klik salah satu kotak di peta untuk melihat detail bin'}
          </p>
          {selectedLocation && (
            <div className="mt-1 text-[10px] font-mono-data text-[var(--muted-foreground)] space-y-0.5">
              <div>{filteredBins.filter(b => b.status === 'TERISI').length + filteredBins.filter(b => b.status === 'HAMPIR_PENUH').length + filteredBins.filter(b => b.status === 'PENUH').length} bin terisi</div>
              <div>{filteredBins.filter(b => b.status === 'KOSONG').length} bin kosong</div>
              {filteredBins.filter(b => b.status === 'PERAWATAN').length > 0 && (
                <div className="text-red-400">{filteredBins.filter(b => b.status === 'PERAWATAN').length} bin dalam perawatan</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
