import { useState } from 'react';
import { iotDevices as initialDevices, securityEvents, type IoTDevice, type SecurityDecision } from '../data/mock';
import StatusBadge from '../components/StatusBadge';

const riskColor = (score: number) => {
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-orange-400';
  if (score >= 20) return 'text-yellow-400';
  return 'text-green-400';
};

const riskBg = (score: number) => {
  if (score >= 70) return 'bg-red-400';
  if (score >= 40) return 'bg-orange-400';
  if (score >= 20) return 'bg-yellow-400';
  return 'bg-green-400';
};

export default function Security() {
  const [tab, setTab] = useState<'devices' | 'events'>('devices');
  const [devices, setDevices] = useState<IoTDevice[]>(initialDevices);
  const [filterDecision, setFilterDecision] = useState<SecurityDecision | 'ALL'>('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [confirmAction, setConfirmAction] = useState<{ deviceId: string; action: 'QUARANTINE' | 'ONLINE' } | null>(null);

  const handleAction = (deviceId: string, action: 'QUARANTINE' | 'ONLINE') => {
    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, status: action } : d
    ));
    setConfirmAction(null);
  };

  const filteredEvents = securityEvents
    .filter(e => filterDecision === 'ALL' || e.keputusan === filterDecision)
    .filter(e => {
      if (filterRisk === 'ALL') return true;
      if (filterRisk === 'HIGH') return e.riskScore >= 70;
      if (filterRisk === 'MEDIUM') return e.riskScore >= 20 && e.riskScore < 70;
      return e.riskScore < 20;
    });

  const stats = {
    online: devices.filter(d => d.status === 'ONLINE').length,
    offline: devices.filter(d => d.status === 'OFFLINE').length,
    quarantine: devices.filter(d => d.status === 'QUARANTINE').length,
    blocked: securityEvents.filter(e => e.keputusan === 'BLOCK').length,
  };

  return (
    <div className="p-5 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="text-[10px] font-mono-data text-[var(--muted-foreground)] uppercase tracking-widest">Perangkat Online</div>
          <div className="text-xl font-display font-bold text-green-400">{stats.online}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="text-[10px] font-mono-data text-[var(--muted-foreground)] uppercase tracking-widest">Offline</div>
          <div className="text-xl font-display font-bold text-red-400">{stats.offline}</div>
        </div>
        <div className="rounded-lg border border-orange-400/30 bg-[var(--card)] p-3">
          <div className="text-[10px] font-mono-data text-[var(--muted-foreground)] uppercase tracking-widest">Quarantine</div>
          <div className="text-xl font-display font-bold text-orange-400">{stats.quarantine}</div>
        </div>
        <div className="rounded-lg border border-red-400/30 bg-[var(--card)] p-3">
          <div className="text-[10px] font-mono-data text-[var(--muted-foreground)] uppercase tracking-widest">Event Blocked</div>
          <div className="text-xl font-display font-bold text-red-400">{stats.blocked}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {(['devices', 'events'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-display font-medium transition-colors border-b-2 ${
              tab === t ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}>
            {t === 'devices' ? 'Registri Perangkat' : 'Log Security Events'}
          </button>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 w-80 shadow-2xl">
            <div className="text-sm font-display font-semibold text-[var(--foreground)] mb-2">Konfirmasi Tindakan</div>
            <div className="text-xs text-[var(--muted-foreground)] mb-4">
              {confirmAction.action === 'QUARANTINE'
                ? 'Perangkat akan dikarantina dan diputus dari jaringan.'
                : 'Perangkat akan diaktifkan kembali ke status ONLINE.'}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction(confirmAction.deviceId, confirmAction.action)}
                className={`flex-1 py-2 rounded text-xs font-display font-semibold transition-colors ${
                  confirmAction.action === 'QUARANTINE'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}>
                {confirmAction.action === 'QUARANTINE' ? 'Karantina' : 'Aktifkan'}
              </button>
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 rounded text-xs font-display border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'devices' ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Device ID</th><th>Nama</th><th>Tipe</th><th>Zona</th>
                <th>IP Address</th><th>Firmware</th><th>Risk Score</th>
                <th>Terakhir Online</th><th>Status</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(dev => (
                <tr key={dev.id}>
                  <td><span className="font-mono-data text-[9px] text-cyan-400">{dev.deviceId}</span></td>
                  <td><span className="text-xs font-medium text-[var(--foreground)]">{dev.nama}</span></td>
                  <td>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--secondary)] font-mono-data text-[var(--muted-foreground)] border border-[var(--border)]">
                      {dev.tipe}
                    </span>
                  </td>
                  <td><span className="text-xs text-[var(--muted-foreground)]">{dev.zona}</span></td>
                  <td><span className="font-mono-data text-[9px] text-[var(--muted-foreground)]">{dev.ipAddress}</span></td>
                  <td><span className="font-mono-data text-[9px] text-[var(--muted-foreground)]">{dev.firmware}</span></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-16 rounded-full bg-[var(--secondary)] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${dev.riskScore}%`, background: riskBg(dev.riskScore) }} />
                      </div>
                      <span className={`font-mono-data text-xs font-bold ${riskColor(dev.riskScore)}`}>{dev.riskScore}</span>
                    </div>
                  </td>
                  <td><span className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{new Date(dev.lastSeen).toLocaleString('id-ID')}</span></td>
                  <td><StatusBadge type="device" value={dev.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      {dev.status !== 'QUARANTINE' && (
                        <button onClick={() => setConfirmAction({ deviceId: dev.id, action: 'QUARANTINE' })}
                          className="px-2 py-1 rounded text-[9px] font-mono-data border border-orange-400/40 text-orange-400 hover:bg-orange-400/10 transition-colors">
                          Karantina
                        </button>
                      )}
                      {dev.status === 'QUARANTINE' && (
                        <button onClick={() => setConfirmAction({ deviceId: dev.id, action: 'ONLINE' })}
                          className="px-2 py-1 rounded text-[9px] font-mono-data border border-green-400/40 text-green-400 hover:bg-green-400/10 transition-colors">
                          Aktifkan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--muted-foreground)] font-mono-data mr-1">KEPUTUSAN:</span>
              {(['ALL', 'ALLOW', 'OBSERVE', 'QUARANTINE', 'BLOCK'] as const).map(d => (
                <button key={d} onClick={() => setFilterDecision(d)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono-data font-semibold border transition-colors ${
                    filterDecision === d
                      ? d === 'ALL' ? 'border-[var(--primary)] text-[var(--primary)] bg-cyan-400/10' :
                        d === 'ALLOW' ? 'border-green-400 text-green-400 bg-green-400/10' :
                        d === 'OBSERVE' ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' :
                        d === 'QUARANTINE' ? 'border-orange-400 text-orange-400 bg-orange-400/10' :
                        'border-red-400 text-red-400 bg-red-400/10'
                      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--muted-foreground)] font-mono-data mr-1">RISIKO:</span>
              {[{ v: 'ALL', l: 'Semua' }, { v: 'HIGH', l: '≥70' }, { v: 'MEDIUM', l: '20–69' }, { v: 'LOW', l: '<20' }].map(r => (
                <button key={r.v} onClick={() => setFilterRisk(r.v)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono-data border transition-colors ${
                    filterRisk === r.v ? 'border-[var(--primary)] text-[var(--primary)] bg-cyan-400/10' : 'border-[var(--border)] text-[var(--muted-foreground)]'
                  }`}>
                  {r.l}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu</th><th>Device</th><th>Tipe Event</th><th>IP / Zona</th>
                  <th>Risk Score</th><th>Keputusan</th><th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(ev => (
                  <tr key={ev.id}>
                    <td><span className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{new Date(ev.timestamp).toLocaleString('id-ID')}</span></td>
                    <td>
                      <div className="text-xs font-medium text-[var(--foreground)]">{ev.deviceNama}</div>
                      <div className="text-[9px] font-mono-data text-cyan-400">{ev.deviceId}</div>
                    </td>
                    <td><span className="text-xs text-[var(--foreground)]">{ev.eventType}</span></td>
                    <td>
                      <div className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{ev.ipAddress}</div>
                      <div className="text-[9px] text-[var(--muted-foreground)]">{ev.zona}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-10 rounded-full bg-[var(--secondary)] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${ev.riskScore}%`, background: riskBg(ev.riskScore) }} />
                        </div>
                        <span className={`font-mono-data text-xs font-bold ${riskColor(ev.riskScore)}`}>{ev.riskScore}</span>
                      </div>
                    </td>
                    <td><StatusBadge type="decision" value={ev.keputusan} /></td>
                    <td><span className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 max-w-xs">{ev.detail}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
