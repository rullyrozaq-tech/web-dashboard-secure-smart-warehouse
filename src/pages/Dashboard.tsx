import { useEffect, useState, type ReactElement } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  materials, storageLocations, stockEntries, iotDevices,
  securityEvents, activityChartData, stockTrendData, weeklyActivityData
} from '../data/mock';
import StatusBadge from '../components/StatusBadge';

function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: string | number; sub?: string; accent?: string; icon: ReactElement;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 flex gap-3 items-start">
      <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: accent ? `${accent}20` : 'var(--secondary)', color: accent || 'var(--primary)' }}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest font-mono-data">{label}</div>
        <div className="text-xl font-display font-bold text-[var(--foreground)] leading-tight count-up">{value}</div>
        {sub && <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: '#0f1629', border: '1px solid #1e2a45', borderRadius: 6, fontSize: 11 },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#64748b', fontFamily: 'JetBrains Mono' },
};

interface Props {
  onNavigate: (page: string, params?: { locationId?: string }) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const [totalStok, setTotalStok] = useState(stockEntries.reduce((s, e) => s + e.jumlah, 0));

  useEffect(() => {
    const id = setInterval(() => {
      setTotalStok(prev => prev + Math.floor(Math.random() * 3 - 1));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const totalMaterial = materials.length;
  const onlineDevices = iotDevices.filter(d => d.status === 'ONLINE').length;
  const alertCount = securityEvents.filter(e => e.keputusan !== 'ALLOW').length;

  const stockByMaterial = materials.map(m => {
    const entries = stockEntries.filter(s => s.materialId === m.id);
    const total = entries.reduce((s, e) => s + e.jumlah, 0);
    return { ...m, totalStok: total };
  });
  const lowStock = stockByMaterial.filter(m => m.totalStok <= m.stokMinimum);

  return (
    <div className="p-5 space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Item Stok" value={totalStok.toLocaleString('id-ID')} sub={`${totalMaterial} material aktif`} accent="#06b6d4"
          icon={<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M1 6h14M5 6v7M10 6v7" stroke="currentColor" strokeWidth="1"/></svg>} />
        <StatCard label="Storage Location" value={`${storageLocations.length} aktif`} sub="1 location mendekati penuh" accent="#22c55e"
          icon={<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="6" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="6" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/></svg>} />
        <StatCard label="Perangkat Online" value={`${onlineDevices} / ${iotDevices.length}`} sub="1 quarantine, 1 offline" accent="#22c55e"
          icon={<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>} />
        <StatCard label="Alert Keamanan" value={alertCount} sub="1 block, 1 quarantine" accent="#ef4444"
          icon={<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4v4c0 3.5 2.5 5.5 6 6.5 3.5-1 6-3 6-6.5V4L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 5v3M8 10v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-display font-semibold text-[var(--foreground)]">Aktivitas Hari Ini</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-mono-data">Transaksi IN / TRANSFER / OUT per Jam</div>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />IN</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />TRF</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />OUT</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={activityChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/><stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" />
              <XAxis dataKey="jam" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="penerimaan" stroke="#06b6d4" strokeWidth={1.5} fill="url(#gradCyan)" name="Penerimaan (IN)" />
              <Area type="monotone" dataKey="transfer" stroke="#60a5fa" strokeWidth={1.5} fill="url(#gradBlue)" name="Transfer" />
              <Area type="monotone" dataKey="keluar" stroke="#f87171" strokeWidth={1.5} fill="url(#gradRed)" name="Pengeluaran (OUT)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="mb-4">
            <div className="text-sm font-display font-semibold text-[var(--foreground)]">Tren Stok 7 Hari</div>
            <div className="text-[10px] text-[var(--muted-foreground)] font-mono-data">Total item terdaftar</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={stockTrendData} margin={{ top: 0, right: 4, bottom: 0, left: -28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#64748b' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} name="Total Stok" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Storage Location Status — clickable */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-display font-semibold text-[var(--foreground)]">Status Storage Location</div>
            <span className="text-[9px] font-mono-data text-[var(--muted-foreground)] flex items-center gap-1">
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              klik untuk detail
            </span>
          </div>
          <div className="space-y-2">
            {storageLocations.map(loc => {
              const pct = Math.round((loc.kapasitasTerpakai / loc.kapasitasMax) * 100);
              const barColor = pct >= 90 ? '#ef4444' : pct >= 75 ? '#f97316' : '#06b6d4';
              return (
                <button
                  key={loc.id}
                  onClick={() => onNavigate('location', { locationId: loc.id })}
                  className="w-full text-left p-2.5 rounded border border-[var(--border)] hover:border-[var(--primary)]/60 hover:bg-cyan-400/5 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-display font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{loc.nama}</span>
                      <StatusBadge type="location" value={loc.status} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono-data text-[var(--muted-foreground)]">{pct}%</span>
                      <svg className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--secondary)] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-[var(--muted-foreground)] font-mono-data">{loc.kode} · {loc.tipe}</span>
                    <span className="text-[9px] text-[var(--muted-foreground)] font-mono-data">{loc.kapasitasTerpakai}/{loc.kapasitasMax} m³</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Events */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="text-sm font-display font-semibold text-[var(--foreground)] mb-3">Event Keamanan Terbaru</div>
          <div className="space-y-2">
            {securityEvents.slice(0, 5).map(ev => (
              <div key={ev.id} className="flex items-start gap-2 p-2 rounded bg-[var(--secondary)] border border-[var(--border)]">
                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${ev.keputusan === 'ALLOW' ? 'bg-green-400' : ev.keputusan === 'OBSERVE' ? 'bg-yellow-400' : ev.keputusan === 'QUARANTINE' ? 'bg-orange-400' : 'bg-red-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-medium text-[var(--foreground)] truncate">{ev.eventType}</span>
                    <StatusBadge type="decision" value={ev.keputusan} />
                  </div>
                  <div className="text-[9px] text-[var(--muted-foreground)] font-mono-data truncate">{ev.deviceNama}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Status */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="text-sm font-display font-semibold text-[var(--foreground)] mb-3">Status Perangkat IoT</div>
          <div className="space-y-1.5">
            {iotDevices.map(dev => (
              <div key={dev.id} className="flex items-center gap-2 p-2 rounded hover:bg-[var(--secondary)] transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dev.status === 'ONLINE' ? 'bg-green-400 pulse-dot' : dev.status === 'QUARANTINE' ? 'bg-orange-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-[var(--foreground)] truncate">{dev.nama}</div>
                  <div className="text-[9px] font-mono-data text-[var(--muted-foreground)]">{dev.deviceId}</div>
                </div>
                <StatusBadge type="device" value={dev.status} />
              </div>
            ))}
          </div>

          {lowStock.length > 0 && (
            <div className="mt-3 p-2 rounded border border-yellow-400/30 bg-yellow-400/5">
              <div className="text-[10px] text-yellow-400 font-medium flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 14h14L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 6v4M8 12v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {lowStock.length} material stok rendah
              </div>
              <div className="text-[9px] text-[var(--muted-foreground)] mt-0.5 truncate">{lowStock.map(m => m.kode).join(', ')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-display font-semibold text-[var(--foreground)]">Aktivitas Mingguan</div>
            <div className="text-[10px] text-[var(--muted-foreground)] font-mono-data">IN / Transfer / OUT – 7 Hari Terakhir</div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />IN</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />TRF</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />OUT</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyActivityData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barSize={10} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" vertical={false} />
            <XAxis dataKey="hari" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="penerimaan" fill="#06b6d4" radius={[2,2,0,0]} name="Penerimaan (IN)" />
            <Bar dataKey="transfer" fill="#60a5fa" radius={[2,2,0,0]} name="Transfer" />
            <Bar dataKey="keluar" fill="#f87171" radius={[2,2,0,0]} name="Pengeluaran (OUT)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
