import type { ReactElement } from 'react';

type Page = string;

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', desc: 'Ringkasan Gudang' },
  { id: 'transaksi', label: 'Transaksi', desc: 'IN / TRANSFER / OUT' },
  { id: 'stock', label: 'Stok Material', desc: 'MMBE – Stock Overview' },
  { id: 'location', label: 'Storage Location', desc: 'LX02 – Location View' },
  { id: 'security', label: 'Keamanan', desc: 'Zero Trust Security' },
  { id: 'audit', label: 'Audit Trail', desc: 'Log Perubahan Stok' },
  { id: 'master', label: 'Master Data', desc: 'Material & Perangkat' },
  { id: 'settings', label: 'Pengaturan', desc: 'Konfigurasi Sistem' },
];

const iconSvgs: Record<string, ReactElement> = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  transaksi: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13 2l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10l-2 2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  stock: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1 6h14M5 6v7M10 6v7" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  location: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="1" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="6" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="6" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="11" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="11" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  security: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L2 4v4c0 3.5 2.5 5.5 6 6.5 3.5-1 6-3 6-6.5V4L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  audit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  master: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="4" rx="6" ry="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 4v4c0 1.1 2.7 2 6 2s6-.9 6-2V4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 8v4c0 1.1 2.7 2 6 2s6-.9 6-2V8" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

interface Props {
  active: Page;
  onChange: (page: Page) => void;
  collapsed: boolean;
}

export default function Sidebar({ active, onChange, collapsed }: Props) {
  return (
    <aside
      className="flex flex-col h-full border-r border-[var(--border)] transition-all duration-300"
      style={{ width: collapsed ? 56 : 220, background: 'var(--card)', minWidth: collapsed ? 56 : 220 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-[var(--border)]" style={{ minHeight: 56 }}>
        <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 6l6-4 6 4v6l-6 4-6-4V6z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M8 2v12M2 6l6 4 6-4" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div className="text-xs font-display font-bold text-[var(--primary)] leading-none tracking-wide">SSW</div>
            <div className="text-[9px] text-[var(--muted-foreground)] leading-none mt-0.5 tracking-widest uppercase">Secure Smart WH</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 group ${
                isActive
                  ? 'sidebar-item-active text-[var(--primary)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]'
              }`}
              style={{ paddingLeft: isActive && !collapsed ? 10 : 12 }}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-[var(--primary)]' : ''}`}>
                {iconSvgs[item.id]}
              </span>
              {!collapsed && (
                <span className="text-xs font-medium font-display truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[var(--primary-foreground)]"
            style={{ background: 'var(--primary)' }}>
            AD
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-[var(--foreground)] truncate">Admin Gudang</div>
              <div className="text-[9px] text-[var(--muted-foreground)] truncate font-mono-data">USR-ADM</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
