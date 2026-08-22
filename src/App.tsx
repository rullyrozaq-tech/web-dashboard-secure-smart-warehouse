import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Transaksi from './pages/Transaksi';
import StockOverview from './pages/StockOverview';
import LocationView from './pages/LocationView';
import Security from './pages/Security';
import AuditTrail from './pages/AuditTrail';
import MasterData from './pages/MasterData';
import Settings from './pages/Settings';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Navigate to a page; optional params (e.g. locationId for LocationView)
  const navigate = (target: string, params?: { locationId?: string }) => {
    setPage(target);
    if (target === 'location' && params?.locationId) {
      setLocationFilter(params.locationId);
    } else if (target !== 'location') {
      setLocationFilter(null);
    }
  };

  // When user manually switches page via sidebar, clear location filter
  const handlePageChange = (p: string) => {
    setPage(p);
    if (p !== 'location') setLocationFilter(null);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'transaksi': return <Transaksi />;
      case 'stock': return <StockOverview />;
      case 'location': return (
        <LocationView
          initialLocationId={locationFilter}
          onLocationFilterChange={setLocationFilter}
        />
      );
      case 'security': return <Security />;
      case 'audit': return <AuditTrail />;
      case 'master': return <MasterData />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={navigate} />;
    }
  };

  const isFullHeight = page === 'location';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <Sidebar active={page} onChange={handlePageChange} collapsed={sidebarCollapsed} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header page={page} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} liveTime={liveTime} />

        <main
          className={`flex-1 ${isFullHeight ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}
          style={{ background: 'var(--background)' }}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
