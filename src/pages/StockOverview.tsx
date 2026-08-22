import { useState } from 'react';
import { materials, stockEntries, storageLocations } from '../data/mock';

export default function StockOverview() {
  const [search, setSearch] = useState('');
  const [filterLow, setFilterLow] = useState(false);

  const stockByMaterial = materials.map(m => {
    const entries = stockEntries.filter(s => s.materialId === m.id);
    const total = entries.reduce((sum, e) => sum + e.jumlah, 0);
    const beratTotal = entries.reduce((sum, e) => sum + e.beratTotal, 0);
    const locs = entries.map(e => storageLocations.find(l => l.id === e.locationId)?.nama || e.locationId);
    const isLow = total <= m.stokMinimum;
    return { ...m, total, beratTotal, locs, isLow };
  });

  const filtered = stockByMaterial
    .filter(m => {
      const q = search.toLowerCase();
      return !q || m.kode.toLowerCase().includes(q) || m.nama.toLowerCase().includes(q) || m.rfidTag.toLowerCase().includes(q);
    })
    .filter(m => !filterLow || m.isLow);

  const totalItems = stockByMaterial.reduce((s, m) => s + m.total, 0);
  const lowCount = stockByMaterial.filter(m => m.isLow).length;

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="text-[10px] text-[var(--muted-foreground)] font-mono-data uppercase tracking-widest">Total Material</div>
          <div className="text-xl font-display font-bold text-[var(--foreground)] mt-0.5">{materials.length}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="text-[10px] text-[var(--muted-foreground)] font-mono-data uppercase tracking-widest">Total Item Stok</div>
          <div className="text-xl font-display font-bold text-[var(--foreground)] mt-0.5">{totalItems.toLocaleString('id-ID')}</div>
        </div>
        <div className={`rounded-lg border bg-[var(--card)] p-3 ${lowCount > 0 ? 'border-yellow-400/30' : 'border-[var(--border)]'}`}>
          <div className="text-[10px] text-[var(--muted-foreground)] font-mono-data uppercase tracking-widest">Stok Rendah</div>
          <div className={`text-xl font-display font-bold mt-0.5 ${lowCount > 0 ? 'text-yellow-400' : 'text-[var(--foreground)]'}`}>{lowCount}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari kode material, nama, atau RFID..."
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-3 py-2 pl-8 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]" />
        </div>
        <button onClick={() => setFilterLow(!filterLow)}
          className={`px-3 py-2 rounded border text-xs font-display transition-colors ${filterLow ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-yellow-400/50'}`}>
          ⚠ Stok Rendah
        </button>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th><th>Kode Material</th><th>Nama Material</th><th>RFID Tag</th>
              <th>Satuan</th><th style={{ textAlign: 'right' }}>Stok Min.</th>
              <th style={{ textAlign: 'right' }}>Total Stok</th>
              <th style={{ textAlign: 'right' }}>Berat (kg)</th>
              <th>Storage Location</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id}>
                <td><span className="font-mono-data text-[var(--muted-foreground)]">{i + 1}</span></td>
                <td><span className="font-mono-data text-[var(--primary)] text-xs">{m.kode}</span></td>
                <td>
                  <div className="text-xs font-medium text-[var(--foreground)]">{m.nama}</div>
                  <div className="text-[9px] text-[var(--muted-foreground)]">{m.deskripsi}</div>
                </td>
                <td><span className="font-mono-data text-[9px] text-cyan-300">{m.rfidTag}</span></td>
                <td><span className="font-mono-data text-xs">{m.satuan}</span></td>
                <td style={{ textAlign: 'right' }}><span className="font-mono-data text-xs text-[var(--muted-foreground)]">{m.stokMinimum.toLocaleString('id-ID')}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <span className={`font-mono-data font-semibold text-sm ${m.isLow ? 'text-yellow-400' : 'text-[var(--foreground)]'}`}>
                    {m.total.toLocaleString('id-ID')}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}><span className="font-mono-data text-xs text-[var(--muted-foreground)]">{m.beratTotal.toFixed(2)}</span></td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {m.locs.map((l, li) => (
                      <span key={li} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--secondary)] text-[var(--muted-foreground)] font-mono-data border border-[var(--border)]">{l}</span>
                    ))}
                  </div>
                </td>
                <td>
                  {m.isLow
                    ? <span className="inline-flex items-center gap-1 text-[10px] text-yellow-400 font-mono-data font-semibold">⚠ RENDAH</span>
                    : <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-mono-data font-semibold">✓ NORMAL</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="text-center text-xs text-[var(--muted-foreground)] py-8">Tidak ada data yang sesuai</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
