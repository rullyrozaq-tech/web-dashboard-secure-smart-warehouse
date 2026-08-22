import { useState } from 'react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    systemName: 'Secure Smart Warehouse – Plant 01',
    warehouseCode: 'WH-PLT01',
    timezone: 'Asia/Jakarta',
    pollInterval: 30,
    mqttBroker: 'mqtt://192.168.10.1:1883',
    mqttTopic: '/warehouse/#',
    rfidThreshold: 0.95,
    weightTolerance: 5,
    lowStockAlert: true,
    securityBlockAuto: true,
    quarantineNotify: true,
    heartbeatTimeout: 300,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-5 max-w-2xl">
      {saved && (
        <div className="mb-4 p-3 rounded border border-green-400/30 bg-green-400/10 text-green-400 text-xs">
          ✓ Pengaturan berhasil disimpan.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* System */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <div className="text-xs font-display font-semibold text-[var(--primary)] uppercase tracking-widest">Identitas Sistem</div>
          {[
            { key: 'systemName', label: 'Nama Sistem', type: 'text' },
            { key: 'warehouseCode', label: 'Kode Gudang', type: 'text' },
            { key: 'timezone', label: 'Timezone', type: 'text' },
          ].map(f => (
            <div key={f.key} className="grid grid-cols-3 gap-3 items-center">
              <label className="text-[10px] text-[var(--muted-foreground)] font-mono-data uppercase tracking-wide">{f.label}</label>
              <input type={f.type} value={(settings as any)[f.key]} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                className="col-span-2 bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]" />
            </div>
          ))}
        </div>

        {/* IoT / MQTT */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <div className="text-xs font-display font-semibold text-[var(--primary)] uppercase tracking-widest">Koneksi IoT / MQTT</div>
          {[
            { key: 'mqttBroker', label: 'MQTT Broker URL', type: 'text' },
            { key: 'mqttTopic', label: 'Topic Wildcard', type: 'text' },
            { key: 'pollInterval', label: 'Poll Interval (detik)', type: 'number' },
            { key: 'heartbeatTimeout', label: 'Heartbeat Timeout (detik)', type: 'number' },
          ].map(f => (
            <div key={f.key} className="grid grid-cols-3 gap-3 items-center">
              <label className="text-[10px] text-[var(--muted-foreground)] font-mono-data uppercase tracking-wide">{f.label}</label>
              <input type={f.type} value={(settings as any)[f.key]} onChange={e => setSettings({ ...settings, [f.key]: f.type === 'number' ? parseInt(e.target.value) : e.target.value })}
                className="col-span-2 bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs font-mono-data text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]" />
            </div>
          ))}
        </div>

        {/* Validation */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <div className="text-xs font-display font-semibold text-[var(--primary)] uppercase tracking-widest">Validasi & Threshold</div>
          {[
            { key: 'rfidThreshold', label: 'RFID Match Threshold', type: 'number', step: 0.01, min: 0, max: 1 },
            { key: 'weightTolerance', label: 'Toleransi Berat (%)', type: 'number', step: 0.5 },
          ].map(f => (
            <div key={f.key} className="grid grid-cols-3 gap-3 items-center">
              <label className="text-[10px] text-[var(--muted-foreground)] font-mono-data uppercase tracking-wide">{f.label}</label>
              <input type={f.type} value={(settings as any)[f.key]} step={f.step} min={(f as any).min} max={(f as any).max}
                onChange={e => setSettings({ ...settings, [f.key]: parseFloat(e.target.value) })}
                className="col-span-2 bg-[var(--secondary)] border border-[var(--border)] rounded px-3 py-2 text-xs font-mono-data text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]" />
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <div className="text-xs font-display font-semibold text-[var(--primary)] uppercase tracking-widest">Notifikasi & Keamanan</div>
          {[
            { key: 'lowStockAlert', label: 'Alert stok rendah otomatis' },
            { key: 'securityBlockAuto', label: 'Block otomatis risk score ≥90' },
            { key: 'quarantineNotify', label: 'Notifikasi saat perangkat dikarantina' },
          ].map(f => (
            <div key={f.key} className="flex items-center justify-between">
              <label className="text-xs text-[var(--foreground)]">{f.label}</label>
              <button type="button" onClick={() => setSettings({ ...settings, [f.key]: !(settings as any)[f.key] })}
                className={`relative w-9 h-5 rounded-full transition-colors ${(settings as any)[f.key] ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${(settings as any)[f.key] ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          ))}
        </div>

        <button type="submit"
          className="w-full py-3 rounded bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-display font-semibold hover:bg-cyan-500 transition-colors">
          Simpan Pengaturan
        </button>
      </form>
    </div>
  );
}
