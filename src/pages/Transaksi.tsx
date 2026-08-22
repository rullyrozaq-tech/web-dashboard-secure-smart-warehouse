import { useState } from 'react';
import {
  materials, storageLocations, stockEntries, purchaseOrders,
  receivingRecords as initGR, transferRecords as initTR, outboundRecords as initOUT,
  type ReceivingRecord, type TransferRecord, type OutboundRecord,
} from '../data/mock';
import StatusBadge from '../components/StatusBadge';

type MainTab = 'penerimaan' | 'transfer' | 'pengeluaran';

// ─── PENERIMAAN ──────────────────────────────────────────────────────────────
function TabPenerimaan() {
  const [view, setView] = useState<'form' | 'riwayat'>('form');
  const [selectedPO, setSelectedPO] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [rfidInput, setRfidInput] = useState('');
  const [rfidValidated, setRfidValidated] = useState<null | boolean>(null);
  const [jumlah, setJumlah] = useState('');
  const [berat, setBerat] = useState('');
  const [beratValidated, setBeratValidated] = useState<null | boolean>(null);
  const [locationId, setLocationId] = useState('');
  const [records, setRecords] = useState<ReceivingRecord[]>(initGR);
  const [submitted, setSubmitted] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const po = purchaseOrders.find(p => p.id === selectedPO);
  const mat = materials.find(m => m.id === selectedMaterial);

  const handleScanRFID = () => {
    if (!mat) return;
    setRfidValidated(rfidInput.trim().toUpperCase() === mat.rfidTag);
  };

  const handleValidateBerat = () => {
    if (!mat || !jumlah || !berat) return;
    const expected = mat.beratPerUnit * parseFloat(jumlah);
    setBeratValidated(Math.abs(parseFloat(berat) - expected) / expected <= 0.05);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || !rfidValidated || !locationId || !jumlah) return;
    const newRecord: ReceivingRecord = {
      id: `GR${Date.now()}`,
      noPO: po?.noPO || '-',
      noGR: `GR2026-${(records.length + 50).toString().padStart(4, '0')}`,
      materialId: selectedMaterial,
      rfidTag: rfidInput,
      jumlah: parseInt(jumlah),
      berat: parseFloat(berat) || 0,
      locationId,
      status: 'SELESAI',
      deviceId: 'DEV002',
      userId: 'USR-ADM',
      timestamp: new Date().toISOString(),
    };
    setRecords([newRecord, ...records]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedPO(''); setSelectedMaterial(''); setRfidInput(''); setRfidValidated(null);
      setJumlah(''); setBerat(''); setBeratValidated(null); setLocationId('');
    }, 2500);
  };

  const filtered = filterStatus === 'ALL' ? records : records.filter(r => r.status === filterStatus);

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-[var(--border)]">
        {(['form', 'riwayat'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 text-xs font-display font-medium transition-colors border-b-2 ${view === v ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
            {v === 'form' ? 'Form Penerimaan' : 'Riwayat'}
          </button>
        ))}
      </div>

      {view === 'form' ? (
        <div className="max-w-2xl">
          {submitted && (
            <div className="mb-4 p-3 rounded border border-green-400/30 bg-green-400/10 text-green-400 text-xs flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Penerimaan berhasil disimpan. Stok diperbarui.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PO */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="text-xs font-display font-semibold text-[var(--primary)] mb-3 uppercase tracking-widest">1. Referensi Purchase Order</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">Pilih PO</label>
                  <select value={selectedPO} onChange={e => { setSelectedPO(e.target.value); setSelectedMaterial(''); }}
                    className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]">
                    <option value="">-- Pilih Purchase Order --</option>
                    {purchaseOrders.map(p => <option key={p.id} value={p.id}>{p.noPO} – {p.vendor}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">Pilih Material</label>
                  <select value={selectedMaterial} onChange={e => { setSelectedMaterial(e.target.value); setRfidValidated(null); }}
                    disabled={!selectedPO}
                    className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50">
                    <option value="">-- Pilih Material --</option>
                    {po?.items.map(item => {
                      const m = materials.find(x => x.id === item.materialId);
                      return m ? <option key={m.id} value={m.id}>{m.kode} – {m.nama}</option> : null;
                    })}
                  </select>
                </div>
              </div>
              {mat && (
                <div className="mt-3 p-2 rounded bg-[var(--secondary)] border border-[var(--border)] text-[10px] font-mono-data text-[var(--muted-foreground)] grid grid-cols-3 gap-2">
                  <span>RFID: <span className="text-cyan-400">{mat.rfidTag}</span></span>
                  <span>Satuan: <span className="text-[var(--foreground)]">{mat.satuan}</span></span>
                  <span>Berat/unit: <span className="text-[var(--foreground)]">{mat.beratPerUnit} kg</span></span>
                </div>
              )}
            </div>

            {/* RFID */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="text-xs font-display font-semibold text-[var(--primary)] mb-3 uppercase tracking-widest">2. Scan RFID</div>
              <div className="flex gap-2">
                <input type="text" value={rfidInput} onChange={e => { setRfidInput(e.target.value); setRfidValidated(null); }}
                  placeholder="Masukkan atau scan RFID Tag..." disabled={!selectedMaterial}
                  className="flex-1 bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs font-mono-data text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50" />
                <button type="button" onClick={handleScanRFID} disabled={!rfidInput || !selectedMaterial}
                  className="px-4 py-2 rounded bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-display font-medium hover:bg-cyan-500 disabled:opacity-50 transition-colors">
                  Validasi
                </button>
              </div>
              {rfidValidated !== null && (
                <div className={`mt-2 text-[10px] flex items-center gap-1 ${rfidValidated ? 'text-green-400' : 'text-red-400'}`}>
                  {rfidValidated ? '✓ RFID valid – tag cocok dengan material' : '✗ RFID tidak cocok – periksa tag atau material'}
                </div>
              )}
            </div>

            {/* Berat */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="text-xs font-display font-semibold text-[var(--primary)] mb-3 uppercase tracking-widest">3. Jumlah & Validasi Berat</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">Jumlah ({mat?.satuan || 'Satuan'})</label>
                  <input type="number" value={jumlah} onChange={e => { setJumlah(e.target.value); setBeratValidated(null); }} min={1}
                    className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]" />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">Berat Aktual (kg)</label>
                  <div className="flex gap-2">
                    <input type="number" value={berat} onChange={e => { setBerat(e.target.value); setBeratValidated(null); }} step="0.01"
                      className="flex-1 bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]" />
                    <button type="button" onClick={handleValidateBerat} disabled={!berat || !jumlah || !mat}
                      className="px-3 py-2 rounded border border-[var(--primary)] text-[var(--primary)] text-xs hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] disabled:opacity-50 transition-colors">
                      Cek
                    </button>
                  </div>
                </div>
              </div>
              {beratValidated !== null && mat && jumlah && (
                <div className={`mt-2 text-[10px] flex items-center gap-1 ${beratValidated ? 'text-green-400' : 'text-yellow-400'}`}>
                  {beratValidated
                    ? `✓ Berat valid – ekspektasi ${(mat.beratPerUnit * parseFloat(jumlah)).toFixed(2)} kg (toleransi ±5%)`
                    : `⚠ Deviasi besar – ekspektasi ${(mat.beratPerUnit * parseFloat(jumlah)).toFixed(2)} kg, aktual ${berat} kg`}
                </div>
              )}
            </div>

            {/* Storage Location */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="text-xs font-display font-semibold text-[var(--primary)] mb-3 uppercase tracking-widest">4. Tujuan Storage Location</div>
              <div className="grid grid-cols-3 gap-2">
                {storageLocations.map(loc => {
                  const pct = Math.round((loc.kapasitasTerpakai / loc.kapasitasMax) * 100);
                  const isFull = loc.status === 'PENUH';
                  return (
                    <button key={loc.id} type="button" onClick={() => !isFull && setLocationId(loc.id)} disabled={isFull}
                      className={`p-3 rounded border text-left transition-all ${locationId === loc.id ? 'border-[var(--primary)] bg-cyan-400/10 glow-cyan' : isFull ? 'border-[var(--border)] opacity-50 cursor-not-allowed' : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}>
                      <div className="text-[11px] font-display font-semibold text-[var(--foreground)]">{loc.nama}</div>
                      <div className="text-[9px] font-mono-data text-[var(--muted-foreground)] mt-0.5">{loc.kode}</div>
                      <div className="mt-1.5 h-1 rounded-full bg-[var(--secondary)] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? '#ef4444' : '#06b6d4' }} />
                      </div>
                      <div className="text-[9px] font-mono-data text-[var(--muted-foreground)] mt-0.5">{pct}% terpakai</div>
                      {isFull && <div className="text-[9px] text-orange-400 font-mono-data mt-0.5">PENUH</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={!rfidValidated || !locationId || !jumlah}
              className="w-full py-3 rounded bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-display font-semibold hover:bg-cyan-500 disabled:opacity-40 transition-colors">
              Simpan Penerimaan Barang
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3">
            {['ALL', 'SELESAI', 'PENDING', 'GAGAL'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded text-[10px] font-mono-data font-medium border transition-colors ${filterStatus === s ? 'border-[var(--primary)] text-[var(--primary)] bg-cyan-400/10' : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <table className="data-table">
              <thead><tr><th>No. GR</th><th>No. PO</th><th>Material</th><th>RFID Tag</th><th>Jumlah</th><th>Berat (kg)</th><th>Storage Location</th><th>Status</th><th>Waktu</th></tr></thead>
              <tbody>
                {filtered.map(rec => {
                  const m = materials.find(x => x.id === rec.materialId);
                  const loc = storageLocations.find(l => l.id === rec.locationId);
                  return (
                    <tr key={rec.id}>
                      <td><span className="font-mono-data text-[var(--primary)]">{rec.noGR || '–'}</span></td>
                      <td><span className="font-mono-data text-xs">{rec.noPO}</span></td>
                      <td><div className="text-xs font-medium">{m?.nama}</div><div className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{m?.kode}</div></td>
                      <td><span className="font-mono-data text-[9px] text-cyan-400">{rec.rfidTag}</span></td>
                      <td><span className="font-mono-data">{rec.jumlah} {m?.satuan}</span></td>
                      <td><span className="font-mono-data">{rec.berat.toFixed(2)}</span></td>
                      <td><span className="text-xs">{loc?.nama || rec.locationId}</span></td>
                      <td><StatusBadge type="gr" value={rec.status} /></td>
                      <td><span className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{new Date(rec.timestamp).toLocaleString('id-ID')}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TRANSFER ────────────────────────────────────────────────────────────────
function TabTransfer() {
  const [view, setView] = useState<'form' | 'riwayat'>('form');
  const [materialId, setMaterialId] = useState('');
  const [locAsal, setLocAsal] = useState('');
  const [locTujuan, setLocTujuan] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [alasan, setAlasan] = useState('');
  const [records, setRecords] = useState<TransferRecord[]>(initTR);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mat = materials.find(m => m.id === materialId);
  const stokEntry = stockEntries.find(s => s.materialId === materialId && s.locationId === locAsal);
  const stokAval = stokEntry?.jumlah || 0;
  const locAsalObj = storageLocations.find(l => l.id === locAsal);
  const locTujuanObj = storageLocations.find(l => l.id === locTujuan);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!materialId || !locAsal || !locTujuan || !jumlah) { setError('Semua field wajib diisi.'); return; }
    if (locAsal === locTujuan) { setError('Storage location asal dan tujuan tidak boleh sama.'); return; }
    if (parseInt(jumlah) > stokAval) { setError(`Stok tidak cukup di ${locAsalObj?.nama}: tersedia ${stokAval.toLocaleString('id-ID')} ${mat?.satuan}`); return; }
    const newRecord: TransferRecord = {
      id: `TR${Date.now()}`,
      noTransfer: `TRF-2026-${(records.length + 15).toString().padStart(4, '0')}`,
      materialId, jumlah: parseInt(jumlah), locationAsal: locAsal, locationTujuan: locTujuan, alasan,
      userId: 'USR-ADM', deviceId: 'DEV003', timestamp: new Date().toISOString(), status: 'SELESAI',
    };
    setRecords([newRecord, ...records]);
    setSuccess(`Transfer ${jumlah} ${mat?.satuan} ${mat?.nama} berhasil dicatat.`);
    setTimeout(() => { setSuccess(''); setMaterialId(''); setLocAsal(''); setLocTujuan(''); setJumlah(''); setAlasan(''); }, 3000);
  };

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-[var(--border)]">
        {(['form', 'riwayat'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 text-xs font-display font-medium transition-colors border-b-2 ${view === v ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
            {v === 'form' ? 'Form Transfer' : 'Riwayat'}
          </button>
        ))}
      </div>

      {view === 'form' ? (
        <div className="max-w-xl">
          {error && <div className="mb-4 p-3 rounded border border-red-400/30 bg-red-400/10 text-red-400 text-xs">{error}</div>}
          {success && <div className="mb-4 p-3 rounded border border-green-400/30 bg-green-400/10 text-green-400 text-xs">✓ {success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
              <div className="text-xs font-display font-semibold text-[var(--primary)] uppercase tracking-widest">Material</div>
              <select value={materialId} onChange={e => { setMaterialId(e.target.value); setLocAsal(''); setJumlah(''); }}
                className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]">
                <option value="">-- Pilih Material --</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.kode} – {m.nama}</option>)}
              </select>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
              <div className="text-xs font-display font-semibold text-[var(--primary)] uppercase tracking-widest">Storage Location Asal</div>
              <div className="grid grid-cols-3 gap-2">
                {storageLocations.map(loc => {
                  const entry = stockEntries.find(s => s.materialId === materialId && s.locationId === loc.id);
                  const hasStock = !!entry && entry.jumlah > 0;
                  const disabled = !materialId || !hasStock;
                  return (
                    <button key={loc.id} type="button" onClick={() => !disabled && setLocAsal(loc.id)} disabled={disabled}
                      className={`p-3 rounded border text-left transition-all ${locAsal === loc.id ? 'border-[var(--primary)] bg-cyan-400/10 glow-cyan' : disabled ? 'border-[var(--border)] opacity-40 cursor-not-allowed' : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}>
                      <div className="text-[11px] font-display font-semibold text-[var(--foreground)]">{loc.nama}</div>
                      <div className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{loc.kode}</div>
                      {entry && <div className="text-[10px] font-mono-data text-cyan-400 mt-1">{entry.jumlah.toLocaleString('id-ID')} {mat?.satuan}</div>}
                      {!hasStock && materialId && <div className="text-[9px] text-[var(--muted-foreground)] mt-1">Tidak ada stok</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
              <div className="text-xs font-display font-semibold text-[var(--primary)] uppercase tracking-widest">Storage Location Tujuan</div>
              <div className="grid grid-cols-3 gap-2">
                {storageLocations.filter(l => l.id !== locAsal).map(loc => {
                  const isFull = loc.status === 'PENUH';
                  return (
                    <button key={loc.id} type="button" onClick={() => !isFull && setLocTujuan(loc.id)} disabled={isFull}
                      className={`p-3 rounded border text-left transition-all ${locTujuan === loc.id ? 'border-green-400 bg-green-400/10' : isFull ? 'border-[var(--border)] opacity-40 cursor-not-allowed' : 'border-[var(--border)] hover:border-green-400/50'}`}>
                      <div className="text-[11px] font-display font-semibold text-[var(--foreground)]">{loc.nama}</div>
                      <div className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{loc.kode}</div>
                      <div className="text-[9px] font-mono-data text-[var(--muted-foreground)] mt-1">
                        {Math.round((loc.kapasitasTerpakai / loc.kapasitasMax) * 100)}% terpakai
                      </div>
                      {isFull && <div className="text-[9px] text-orange-400 mt-1">PENUH</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
              <div className="text-xs font-display font-semibold text-[var(--primary)] uppercase tracking-widest">Detail Transfer</div>
              <div>
                <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">
                  Jumlah {mat ? `(${mat.satuan})` : ''} {locAsal && <span className="text-cyan-400">— maks. {stokAval.toLocaleString('id-ID')}</span>}
                </label>
                <input type="number" value={jumlah} onChange={e => setJumlah(e.target.value)} min={1} max={stokAval} disabled={!locAsal}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50" />
                {jumlah && parseInt(jumlah) > stokAval && <div className="text-[10px] text-red-400 mt-1">⚠ Melebihi stok tersedia ({stokAval})</div>}
              </div>
              <div>
                <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">Alasan Transfer</label>
                <input type="text" value={alasan} onChange={e => setAlasan(e.target.value)} placeholder="mis. Rebalancing kapasitas, permintaan produksi..."
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]" />
              </div>
            </div>

            {materialId && locAsal && locTujuan && jumlah && (
              <div className="p-3 rounded border border-cyan-400/30 bg-cyan-400/5 text-xs font-mono-data">
                <div className="text-cyan-400 font-semibold mb-1">Ringkasan Transfer</div>
                <div className="text-[var(--muted-foreground)]">
                  Pindahkan <span className="text-[var(--foreground)]">{parseInt(jumlah).toLocaleString('id-ID')} {mat?.satuan}</span> {mat?.nama}
                  {' '}dari <span className="text-[var(--foreground)]">{locAsalObj?.nama}</span>
                  {' '}ke <span className="text-[var(--foreground)]">{locTujuanObj?.nama}</span>
                </div>
              </div>
            )}

            <button type="submit" disabled={!materialId || !locAsal || !locTujuan || !jumlah || parseInt(jumlah) > stokAval}
              className="w-full py-3 rounded bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-display font-semibold hover:bg-cyan-500 disabled:opacity-40 transition-colors">
              Proses Transfer
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="data-table">
            <thead><tr><th>No. Transfer</th><th>Material</th><th>Jumlah</th><th>Loc. Asal</th><th>Loc. Tujuan</th><th>Alasan</th><th>User</th><th>Waktu</th><th>Status</th></tr></thead>
            <tbody>
              {records.map(rec => {
                const m = materials.find(x => x.id === rec.materialId);
                const asal = storageLocations.find(l => l.id === rec.locationAsal);
                const tujuan = storageLocations.find(l => l.id === rec.locationTujuan);
                return (
                  <tr key={rec.id}>
                    <td><span className="font-mono-data text-[var(--primary)] text-xs">{rec.noTransfer}</span></td>
                    <td><div className="text-xs font-medium">{m?.nama}</div><div className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{m?.kode}</div></td>
                    <td><span className="font-mono-data">{rec.jumlah.toLocaleString('id-ID')} {m?.satuan}</span></td>
                    <td><span className="text-xs">{asal?.nama || rec.locationAsal}</span></td>
                    <td><span className="text-xs">{tujuan?.nama || rec.locationTujuan}</span></td>
                    <td><span className="text-[11px] text-[var(--muted-foreground)]">{rec.alasan}</span></td>
                    <td><span className="font-mono-data text-[9px] text-[var(--muted-foreground)]">{rec.userId}</span></td>
                    <td><span className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{new Date(rec.timestamp).toLocaleString('id-ID')}</span></td>
                    <td><StatusBadge type="gr" value={rec.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── PENGELUARAN ─────────────────────────────────────────────────────────────
function TabPengeluaran() {
  const [view, setView] = useState<'form' | 'riwayat'>('form');
  const [materialId, setMaterialId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [alasan, setAlasan] = useState('');
  const [referensi, setReferensi] = useState('');
  const [records, setRecords] = useState<OutboundRecord[]>(initOUT);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mat = materials.find(m => m.id === materialId);
  const stokEntry = stockEntries.find(s => s.materialId === materialId && s.locationId === locationId);
  const stokAval = stokEntry?.jumlah || 0;
  const locObj = storageLocations.find(l => l.id === locationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!materialId || !locationId || !jumlah) { setError('Material, storage location, dan jumlah wajib diisi.'); return; }
    if (parseInt(jumlah) > stokAval) { setError(`Stok tidak cukup di ${locObj?.nama}: tersedia ${stokAval.toLocaleString('id-ID')} ${mat?.satuan}`); return; }
    const newRecord: OutboundRecord = {
      id: `OUT${Date.now()}`,
      noOutbound: `OUT-2026-${(records.length + 7).toString().padStart(4, '0')}`,
      materialId, jumlah: parseInt(jumlah), locationAsal: locationId, alasan, referensi,
      userId: 'USR-ADM', deviceId: 'DEV003', timestamp: new Date().toISOString(), status: 'SELESAI',
    };
    setRecords([newRecord, ...records]);
    setSuccess(`Pengeluaran ${jumlah} ${mat?.satuan} ${mat?.nama} berhasil dicatat.`);
    setTimeout(() => { setSuccess(''); setMaterialId(''); setLocationId(''); setJumlah(''); setAlasan(''); setReferensi(''); }, 3000);
  };

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-[var(--border)]">
        {(['form', 'riwayat'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 text-xs font-display font-medium transition-colors border-b-2 ${view === v ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
            {v === 'form' ? 'Form Pengeluaran' : 'Riwayat'}
          </button>
        ))}
      </div>

      {view === 'form' ? (
        <div className="max-w-xl">
          {error && <div className="mb-4 p-3 rounded border border-red-400/30 bg-red-400/10 text-red-400 text-xs">{error}</div>}
          {success && <div className="mb-4 p-3 rounded border border-green-400/30 bg-green-400/10 text-green-400 text-xs">✓ {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Material */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
              <div className="text-xs font-display font-semibold text-red-400 uppercase tracking-widest">Material yang Dikeluarkan</div>
              <select value={materialId} onChange={e => { setMaterialId(e.target.value); setLocationId(''); setJumlah(''); }}
                className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]">
                <option value="">-- Pilih Material --</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.kode} – {m.nama}</option>)}
              </select>
              {mat && (
                <div className="p-2 rounded bg-[var(--secondary)] border border-[var(--border)] text-[10px] font-mono-data text-[var(--muted-foreground)] flex gap-4">
                  <span>RFID: <span className="text-cyan-400">{mat.rfidTag}</span></span>
                  <span>Satuan: <span className="text-[var(--foreground)]">{mat.satuan}</span></span>
                </div>
              )}
            </div>

            {/* Storage Location */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
              <div className="text-xs font-display font-semibold text-red-400 uppercase tracking-widest">Storage Location Asal</div>
              <div className="grid grid-cols-3 gap-2">
                {storageLocations.map(loc => {
                  const entry = stockEntries.find(s => s.materialId === materialId && s.locationId === loc.id);
                  const hasStock = !!entry && entry.jumlah > 0;
                  const disabled = !materialId || !hasStock;
                  return (
                    <button key={loc.id} type="button" onClick={() => !disabled && setLocationId(loc.id)} disabled={disabled}
                      className={`p-3 rounded border text-left transition-all ${locationId === loc.id ? 'border-red-400 bg-red-400/10' : disabled ? 'border-[var(--border)] opacity-40 cursor-not-allowed' : 'border-[var(--border)] hover:border-red-400/40'}`}>
                      <div className="text-[11px] font-display font-semibold text-[var(--foreground)]">{loc.nama}</div>
                      <div className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{loc.kode}</div>
                      {entry && <div className="text-[10px] font-mono-data text-cyan-400 mt-1">{entry.jumlah.toLocaleString('id-ID')} {mat?.satuan}</div>}
                      {!hasStock && materialId && <div className="text-[9px] text-[var(--muted-foreground)] mt-1">Tidak ada stok</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
              <div className="text-xs font-display font-semibold text-red-400 uppercase tracking-widest">Detail Pengeluaran</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">
                    Jumlah {mat ? `(${mat.satuan})` : ''} {locationId && <span className="text-cyan-400">— maks. {stokAval.toLocaleString('id-ID')}</span>}
                  </label>
                  <input type="number" value={jumlah} onChange={e => setJumlah(e.target.value)} min={1} max={stokAval} disabled={!locationId}
                    className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50" />
                  {jumlah && parseInt(jumlah) > stokAval && <div className="text-[10px] text-red-400 mt-1">⚠ Melebihi stok tersedia</div>}
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">Referensi (WO / MO / SO)</label>
                  <input type="text" value={referensi} onChange={e => setReferensi(e.target.value)} placeholder="mis. WO-2026-301"
                    className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">Alasan Pengeluaran</label>
                <input type="text" value={alasan} onChange={e => setAlasan(e.target.value)} placeholder="mis. Pemakaian produksi, pengiriman ke pelanggan..."
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]" />
              </div>
            </div>

            {materialId && locationId && jumlah && (
              <div className="p-3 rounded border border-red-400/30 bg-red-400/5 text-xs font-mono-data">
                <div className="text-red-400 font-semibold mb-1">Ringkasan Pengeluaran</div>
                <div className="text-[var(--muted-foreground)]">
                  Keluarkan <span className="text-[var(--foreground)]">{parseInt(jumlah).toLocaleString('id-ID')} {mat?.satuan}</span> {mat?.nama}
                  {' '}dari <span className="text-[var(--foreground)]">{locObj?.nama}</span>
                  {referensi && <> · Ref: <span className="text-[var(--foreground)]">{referensi}</span></>}
                </div>
              </div>
            )}

            <button type="submit" disabled={!materialId || !locationId || !jumlah || parseInt(jumlah) > stokAval}
              className="w-full py-3 rounded bg-red-500 text-white text-sm font-display font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors">
              Proses Pengeluaran Barang
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="data-table">
            <thead><tr><th>No. Outbound</th><th>Material</th><th>Jumlah</th><th>Storage Location</th><th>Referensi</th><th>Alasan</th><th>User</th><th>Waktu</th><th>Status</th></tr></thead>
            <tbody>
              {records.map(rec => {
                const m = materials.find(x => x.id === rec.materialId);
                const loc = storageLocations.find(l => l.id === rec.locationAsal);
                return (
                  <tr key={rec.id}>
                    <td><span className="font-mono-data text-red-400 text-xs">{rec.noOutbound}</span></td>
                    <td><div className="text-xs font-medium">{m?.nama}</div><div className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{m?.kode}</div></td>
                    <td><span className="font-mono-data text-red-400">–{rec.jumlah.toLocaleString('id-ID')} {m?.satuan}</span></td>
                    <td><span className="text-xs">{loc?.nama || rec.locationAsal}</span></td>
                    <td><span className="font-mono-data text-[9px] text-[var(--primary)]">{rec.referensi || '–'}</span></td>
                    <td><span className="text-[11px] text-[var(--muted-foreground)]">{rec.alasan}</span></td>
                    <td><span className="font-mono-data text-[9px] text-[var(--muted-foreground)]">{rec.userId}</span></td>
                    <td><span className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{new Date(rec.timestamp).toLocaleString('id-ID')}</span></td>
                    <td><StatusBadge type="gr" value={rec.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const tabConfig: { id: MainTab; label: string; badge: string; color: string }[] = [
  { id: 'penerimaan', label: 'Penerimaan (Inbound)', badge: 'IN', color: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' },
  { id: 'transfer', label: 'Transfer', badge: 'TRF', color: 'text-blue-400 border-blue-400/40 bg-blue-400/10' },
  { id: 'pengeluaran', label: 'Pengeluaran (Outbound)', badge: 'OUT', color: 'text-red-400 border-red-400/40 bg-red-400/10' },
];

export default function Transaksi() {
  const [tab, setTab] = useState<MainTab>('penerimaan');

  return (
    <div className="p-5">
      {/* Main tab selector */}
      <div className="flex gap-2 mb-6">
        {tabConfig.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-display font-medium transition-all ${
              tab === t.id
                ? `${t.color} glow-cyan`
                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/30 bg-[var(--card)]'
            }`}>
            <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded border ${tab === t.id ? t.color : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}>
              {t.badge}
            </span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'penerimaan' && <TabPenerimaan />}
      {tab === 'transfer' && <TabTransfer />}
      {tab === 'pengeluaran' && <TabPengeluaran />}
    </div>
  );
}
