import { useState } from 'react';
import { materials as initMaterials, storageLocations as initLocs, iotDevices as initDevices, type Material, type StorageLocation, type IoTDevice } from '../data/mock';
import StatusBadge from '../components/StatusBadge';

type MasterTab = 'material' | 'location' | 'device';

export default function MasterData() {
  const [tab, setTab] = useState<MasterTab>('material');
  const [materials, setMaterials] = useState<Material[]>(initMaterials);
  const [locs] = useState<StorageLocation[]>(initLocs);
  const [devices] = useState<IoTDevice[]>(initDevices);
  const [matForm, setMatForm] = useState<Partial<Material> & { mode: 'add' | 'edit' | null }>({ mode: null });

  const handleSaveMaterial = () => {
    if (!matForm.kode || !matForm.nama) return;
    if (matForm.mode === 'add') {
      const newMat: Material = {
        id: `M${Date.now()}`,
        kode: matForm.kode!, nama: matForm.nama!, deskripsi: matForm.deskripsi || '',
        satuan: matForm.satuan || 'PCS', stokMinimum: matForm.stokMinimum || 0,
        beratPerUnit: matForm.beratPerUnit || 0, rfidTag: matForm.rfidTag || '',
      };
      setMaterials([...materials, newMat]);
    } else if (matForm.mode === 'edit' && matForm.id) {
      setMaterials(materials.map(m => m.id === matForm.id ? { ...m, ...matForm } as Material : m));
    }
    setMatForm({ mode: null });
  };

  const deleteMaterial = (id: string) => {
    if (confirm('Hapus material ini?')) setMaterials(materials.filter(m => m.id !== id));
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex gap-1 border-b border-[var(--border)]">
        {([
          { id: 'material', label: 'Material' },
          { id: 'location', label: 'Storage Location' },
          { id: 'device', label: 'Device Registry' },
        ] as { id: MasterTab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-display font-medium transition-colors border-b-2 ${tab === t.id ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'material' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setMatForm({ mode: 'add', satuan: 'PCS' })}
              className="px-4 py-2 rounded bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-display font-semibold hover:bg-cyan-500 transition-colors">
              + Tambah Material
            </button>
          </div>

          {matForm.mode && (
            <div className="rounded-lg border border-[var(--primary)]/40 bg-[var(--card)] p-4">
              <div className="text-xs font-display font-semibold text-[var(--primary)] mb-3 uppercase tracking-widest">
                {matForm.mode === 'add' ? 'Tambah Material Baru' : 'Edit Material'}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'kode', label: 'Kode Material', type: 'text', placeholder: 'MAT-0011' },
                  { key: 'nama', label: 'Nama Material', type: 'text', placeholder: 'Nama barang' },
                  { key: 'rfidTag', label: 'RFID Tag', type: 'text', placeholder: 'RFID-XXXX-XXXX' },
                  { key: 'deskripsi', label: 'Deskripsi', type: 'text', placeholder: 'Deskripsi singkat' },
                  { key: 'stokMinimum', label: 'Stok Minimum', type: 'number', placeholder: '0' },
                  { key: 'beratPerUnit', label: 'Berat Per Unit (kg)', type: 'number', placeholder: '0.00' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={(matForm as any)[f.key] || ''}
                      onChange={e => setMatForm({ ...matForm, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                      className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-mono-data uppercase tracking-wide">Satuan</label>
                  <select value={matForm.satuan || 'PCS'} onChange={e => setMatForm({ ...matForm, satuan: e.target.value as any })}
                    className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]">
                    {['PCS', 'KG', 'BOX', 'ROLL', 'BTL'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSaveMaterial} className="px-4 py-2 rounded bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-display font-semibold hover:bg-cyan-500 transition-colors">Simpan</button>
                <button onClick={() => setMatForm({ mode: null })} className="px-4 py-2 rounded border border-[var(--border)] text-[var(--muted-foreground)] text-xs hover:text-[var(--foreground)] transition-colors">Batal</button>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Kode</th><th>Nama</th><th>RFID Tag</th><th>Satuan</th><th>Stok Min.</th><th>Berat/Unit</th><th>Aksi</th></tr></thead>
              <tbody>
                {materials.map(m => (
                  <tr key={m.id}>
                    <td><span className="font-mono-data text-[var(--primary)]">{m.kode}</span></td>
                    <td><div className="text-xs font-medium text-[var(--foreground)]">{m.nama}</div><div className="text-[9px] text-[var(--muted-foreground)]">{m.deskripsi}</div></td>
                    <td><span className="font-mono-data text-[9px] text-cyan-400">{m.rfidTag}</span></td>
                    <td><span className="font-mono-data text-xs">{m.satuan}</span></td>
                    <td><span className="font-mono-data text-xs">{m.stokMinimum}</span></td>
                    <td><span className="font-mono-data text-xs">{m.beratPerUnit} kg</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setMatForm({ ...m, mode: 'edit' })}
                          className="px-2 py-1 rounded text-[9px] font-mono-data border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors">
                          Edit
                        </button>
                        <button onClick={() => deleteMaterial(m.id)}
                          className="px-2 py-1 rounded text-[9px] font-mono-data border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'location' && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Kode</th><th>Nama</th><th>Tipe</th><th>Kapasitas Maks</th><th>Terpakai</th><th>Suhu</th><th>Kelembaban</th><th>Lokasi</th><th>Status</th></tr></thead>
            <tbody>
              {locs.map(l => (
                <tr key={l.id}>
                  <td><span className="font-mono-data text-[var(--primary)]">{l.kode}</span></td>
                  <td><span className="text-xs font-medium text-[var(--foreground)]">{l.nama}</span></td>
                  <td><span className="text-xs text-[var(--muted-foreground)]">{l.tipe}</span></td>
                  <td><span className="font-mono-data text-xs">{l.kapasitasMax} m³</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-[var(--secondary)] overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${(l.kapasitasTerpakai / l.kapasitasMax) * 100}%` }} />
                      </div>
                      <span className="font-mono-data text-xs">{l.kapasitasTerpakai}</span>
                    </div>
                  </td>
                  <td><span className="font-mono-data text-xs">{l.suhu}°C</span></td>
                  <td><span className="font-mono-data text-xs">{l.kelembaban}%</span></td>
                  <td><span className="text-xs text-[var(--muted-foreground)]">{l.lokasi}</span></td>
                  <td><StatusBadge type="location" value={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'device' && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Device ID</th><th>Nama</th><th>Tipe</th><th>IP Address</th><th>Zona</th><th>Firmware</th><th>Status</th></tr></thead>
            <tbody>
              {devices.map(d => (
                <tr key={d.id}>
                  <td><span className="font-mono-data text-[9px] text-cyan-400">{d.deviceId}</span></td>
                  <td><span className="text-xs font-medium text-[var(--foreground)]">{d.nama}</span></td>
                  <td><span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--secondary)] font-mono-data text-[var(--muted-foreground)] border border-[var(--border)]">{d.tipe}</span></td>
                  <td><span className="font-mono-data text-[9px] text-[var(--muted-foreground)]">{d.ipAddress}</span></td>
                  <td><span className="text-xs text-[var(--muted-foreground)]">{d.zona}</span></td>
                  <td><span className="font-mono-data text-[9px] text-[var(--muted-foreground)]">{d.firmware}</span></td>
                  <td><StatusBadge type="device" value={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
