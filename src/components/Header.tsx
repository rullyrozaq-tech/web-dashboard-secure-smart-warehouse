import { useState } from 'react';
import { securityEvents } from '../data/mock';

const pageLabels: Record<string, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Ringkasan Sistem Gudang' },
  transaksi: { title: 'Transaksi', sub: 'Penerimaan · Transfer · Pengeluaran' },
  stock: { title: 'Stok Material', sub: 'MMBE – Stock Overview' },
  location: { title: 'Storage Location', sub: 'LX02 – Peta & Tampilan Storage Location' },
  security: { title: 'Keamanan & Zero Trust', sub: 'Device Registry & Security Events' },
  audit: { title: 'Audit Trail', sub: 'Riwayat Perubahan Stok' },
  master: { title: 'Master Data', sub: 'Material, Storage Location & Device' },
  settings: { title: 'Pengaturan', sub: 'Konfigurasi Sistem' },
};

interface Props {
  page: string;
  onToggleSidebar: () => void;
  liveTime: Date;
}

export default function Header({ page, onToggleSidebar, liveTime }: Props) {
  const [showNotif, setShowNotif] = useState(false);
  const { title, sub } = pageLabels[page] || { title: page, sub: '' };
  const highRisk = securityEvents.filter(e => e.riskScore >= 70);
  const warns = securityEvents.filter(e => e.keputusan === 'OBSERVE' || e.keputusan === 'QUARANTINE');

  return (
    <header className="flex items-center gap-4 px-5 border-b border-[var(--border)] bg-[var(--card)]"
      style={{ height: 56, flexShrink: 0 }}>
      <button onClick={onToggleSidebar} className="p-1.5 rounded hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-display font-semibold text-[var(--foreground)] leading-none">{title}</h1>
        <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 font-mono-data tracking-wide">{sub}</p>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--muted)]">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
        <span className="text-[10px] font-mono-data text-[var(--muted-foreground)]">
          {liveTime.toLocaleTimeString('id-ID', { hour12: false })}
        </span>
      </div>

      <div className="relative">
        <button onClick={() => setShowNotif(!showNotif)}
          className="relative p-1.5 rounded hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1a5 5 0 00-5 5v3l-1.5 2H14.5L13 9V6a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M6 13a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          {highRisk.length > 0 && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
              {highRisk.length}
            </span>
          )}
        </button>

        {showNotif && (
          <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-2xl z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-display font-semibold text-[var(--foreground)]">Peringatan Aktif</span>
              <span className="text-[10px] font-mono-data text-[var(--muted-foreground)]">{warns.length + highRisk.length} event</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {securityEvents.filter(e => e.keputusan !== 'ALLOW').slice(0, 5).map(ev => (
                <div key={ev.id} className="px-3 py-2.5 border-b border-[var(--border)] hover:bg-[var(--secondary)] transition-colors">
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      ev.keputusan === 'BLOCK' ? 'bg-red-400' :
                      ev.keputusan === 'QUARANTINE' ? 'bg-orange-400' : 'bg-yellow-400'
                    }`} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-[var(--foreground)] truncate">{ev.eventType}</div>
                      <div className="text-[10px] text-[var(--muted-foreground)] truncate">{ev.deviceNama}</div>
                      <div className="text-[9px] text-[var(--muted-foreground)] font-mono-data mt-0.5">
                        {new Date(ev.timestamp).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-3 py-2">
              <button onClick={() => setShowNotif(false)} className="w-full text-[10px] text-[var(--primary)] hover:underline">
                Lihat Semua di Modul Keamanan
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[var(--primary-foreground)]"
        style={{ background: 'var(--primary)' }}>
        AD
      </div>
    </header>
  );
}
