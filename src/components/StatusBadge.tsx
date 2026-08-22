import type { SecurityDecision, DeviceStatus, LocationStatus } from '../data/mock';

const decisionColors: Record<SecurityDecision, string> = {
  ALLOW: 'text-green-400 bg-green-400/10 border-green-400/30',
  OBSERVE: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  QUARANTINE: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  BLOCK: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const deviceStatusColors: Record<DeviceStatus, string> = {
  ONLINE: 'text-green-400 bg-green-400/10 border-green-400/30',
  OFFLINE: 'text-red-400 bg-red-400/10 border-red-400/30',
  QUARANTINE: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
};

const locationStatusColors: Record<LocationStatus, string> = {
  NORMAL: 'text-green-400 bg-green-400/10 border-green-400/30',
  PENUH: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  PERAWATAN: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

interface Props {
  type: 'decision' | 'device' | 'location' | 'gr';
  value: string;
}

export default function StatusBadge({ type, value }: Props) {
  let cls = '';
  if (type === 'decision') cls = decisionColors[value as SecurityDecision] || '';
  else if (type === 'device') cls = deviceStatusColors[value as DeviceStatus] || '';
  else if (type === 'location') cls = locationStatusColors[value as LocationStatus] || '';
  else if (type === 'gr') {
    if (value === 'SELESAI') cls = 'text-green-400 bg-green-400/10 border-green-400/30';
    else if (value === 'PENDING') cls = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    else cls = 'text-red-400 bg-red-400/10 border-red-400/30';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono-data font-semibold tracking-wider ${cls}`}>
      {value}
    </span>
  );
}
