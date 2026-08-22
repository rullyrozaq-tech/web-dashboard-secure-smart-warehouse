export type MaterialUnit = 'PCS' | 'KG' | 'BOX' | 'ROLL' | 'BTL';
export type LocationStatus = 'NORMAL' | 'PENUH' | 'PERAWATAN';
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'QUARANTINE';
export type SecurityDecision = 'ALLOW' | 'OBSERVE' | 'QUARANTINE' | 'BLOCK';
export type TransactionType = 'PENERIMAAN' | 'TRANSFER' | 'KELUAR' | 'ADJUST';

export interface Material {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  satuan: MaterialUnit;
  stokMinimum: number;
  beratPerUnit: number;
  rfidTag: string;
}

export interface StorageLocation {
  id: string;
  kode: string;
  nama: string;
  tipe: string;
  kapasitasMax: number;
  kapasitasTerpakai: number;
  status: LocationStatus;
  suhu: number;
  kelembaban: number;
  lokasi: string;
}

export interface StockEntry {
  materialId: string;
  locationId: string;
  jumlah: number;
  beratTotal: number;
  lastUpdate: string;
}

export interface IoTDevice {
  id: string;
  deviceId: string;
  nama: string;
  tipe: 'RFID_READER' | 'LOAD_CELL' | 'GATEWAY' | 'SENSOR_ENV';
  zona: string;
  ipAddress: string;
  token: string;
  status: DeviceStatus;
  lastSeen: string;
  firmware: string;
  riskScore: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceNama: string;
  eventType: string;
  riskScore: number;
  keputusan: SecurityDecision;
  detail: string;
  ipAddress: string;
  zona: string;
}

export interface PurchaseOrder {
  id: string;
  noPO: string;
  vendor: string;
  tanggal: string;
  items: { materialId: string; jumlahPO: number; hargaSatuan: number }[];
}

export interface ReceivingRecord {
  id: string;
  noPO: string;
  noGR: string;
  materialId: string;
  rfidTag: string;
  jumlah: number;
  berat: number;
  locationId: string;
  status: 'SELESAI' | 'PENDING' | 'GAGAL';
  deviceId: string;
  userId: string;
  timestamp: string;
}

export interface TransferRecord {
  id: string;
  noTransfer: string;
  materialId: string;
  jumlah: number;
  locationAsal: string;
  locationTujuan: string;
  alasan: string;
  userId: string;
  deviceId: string;
  timestamp: string;
  status: 'SELESAI' | 'PENDING' | 'GAGAL';
}

export interface OutboundRecord {
  id: string;
  noOutbound: string;
  materialId: string;
  jumlah: number;
  locationAsal: string;
  alasan: string;
  referensi: string;
  userId: string;
  deviceId: string;
  timestamp: string;
  status: 'SELESAI' | 'PENDING' | 'GAGAL';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  tipeTransaksi: TransactionType;
  referensi: string;
  materialId: string;
  locationId: string;
  deltaJumlah: number;
  deltaBerat: number;
  userId: string;
  deviceId: string;
  keterangan: string;
}

// ─── WAREHOUSE MAP LOCATION GRID ────────────────────────────────────────────
export type MapLocationStatus = 'KOSONG' | 'TERISI' | 'HAMPIR_PENUH' | 'PENUH' | 'PERAWATAN';

export interface WarehouseMapLocation {
  id: string;
  kode: string;
  zona: string;
  locationId: string;       // parent StorageLocation id: LOC001 | LOC002 | LOC003
  baris: number;
  kolom: number;
  level: number;
  kapasitas: number;
  terpakai: number;
  status: MapLocationStatus;
  materialId?: string;
  suhu?: number;
  kelembaban?: number;
}

function genMapStatus(terpakai: number, kapasitas: number): MapLocationStatus {
  if (terpakai === 0) return 'KOSONG';
  const pct = terpakai / kapasitas;
  if (pct >= 1) return 'PENUH';
  if (pct >= 0.75) return 'HAMPIR_PENUH';
  return 'TERISI';
}

// zona → StorageLocation id mapping
const zoneToLocationId: Record<string, string> = { A: 'LOC001', B: 'LOC002', C: 'LOC003' };

const zones = ['A', 'B', 'C'];
const materialIds = ['M001', 'M002', 'M003', 'M004', 'M005', 'M006', 'M007', 'M008', 'M009', 'M010', undefined];

function seedRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

export const warehouseMapLocations: WarehouseMapLocation[] = (() => {
  const rng = seedRng(42);
  const locs: WarehouseMapLocation[] = [];
  let idx = 0;
  for (const zona of zones) {
    for (let baris = 1; baris <= 4; baris++) {
      for (let kolom = 1; kolom <= 8; kolom++) {
        for (let level = 1; level <= 3; level++) {
          const kap = 10 + Math.floor(rng() * 20);
          let terpakai = 0;
          let materialId: string | undefined = undefined;
          let status: MapLocationStatus = 'KOSONG';
          const r = rng();

          if (zona === 'B' && baris <= 2) {
            // Chemical zone – mostly occupied
            if (r < 0.15) { status = 'PERAWATAN'; }
            else {
              terpakai = Math.floor(kap * (0.4 + rng() * 0.6));
              materialId = materialIds[Math.floor(rng() * 4) + 2] as string;
              status = genMapStatus(terpakai, kap);
            }
          } else if (zona === 'C') {
            // Electrical – sparse
            if (r < 0.6) { terpakai = 0; status = 'KOSONG'; }
            else if (r < 0.65) { status = 'PERAWATAN'; }
            else {
              terpakai = Math.floor(kap * rng() * 0.7);
              materialId = materialIds[Math.floor(rng() * 4) + 3] as string;
              status = genMapStatus(terpakai, kap);
            }
          } else {
            // Zone A – general, mixed
            if (r < 0.08) { status = 'PERAWATAN'; }
            else if (r < 0.2) { terpakai = 0; status = 'KOSONG'; }
            else {
              terpakai = Math.floor(kap * (0.1 + rng() * 0.9));
              materialId = materialIds[Math.floor(rng() * 10)] as string | undefined;
              status = genMapStatus(terpakai, kap);
            }
          }

          locs.push({
            id: `LOC-${zona}${baris.toString().padStart(2, '0')}${kolom.toString().padStart(2, '0')}-L${level}`,
            kode: `${zona}.${baris.toString().padStart(2, '0')}.${kolom.toString().padStart(2, '0')}.L${level}`,
            zona,
            locationId: zoneToLocationId[zona],
            baris,
            kolom,
            level,
            kapasitas: kap,
            terpakai,
            status,
            materialId: terpakai > 0 ? materialId : undefined,
            suhu: 20 + Math.floor(rng() * 12),
            kelembaban: 40 + Math.floor(rng() * 35),
          });
          idx++;
        }
      }
    }
  }
  return locs;
})();

// ─── MASTER DATA ────────────────────────────────────────────────────────────

export const materials: Material[] = [
  { id: 'M001', kode: 'MAT-0001', nama: 'Baut Hex M10x50', deskripsi: 'Baut hexagonal SS304 M10x50mm', satuan: 'PCS', stokMinimum: 500, beratPerUnit: 0.045, rfidTag: 'RFID-A4F2-0001' },
  { id: 'M002', kode: 'MAT-0002', nama: 'Mur Hex M10', deskripsi: 'Mur hexagonal SS304 M10', satuan: 'PCS', stokMinimum: 500, beratPerUnit: 0.02, rfidTag: 'RFID-A4F2-0002' },
  { id: 'M003', kode: 'MAT-0003', nama: 'Oli Mesin 10W-40', deskripsi: 'Pelumas mesin industri 10W-40 4L', satuan: 'BTL', stokMinimum: 20, beratPerUnit: 3.8, rfidTag: 'RFID-B7C1-0003' },
  { id: 'M004', kode: 'MAT-0004', nama: 'Filter Udara HVAC', deskripsi: 'Filter udara panel G4 untuk sistem HVAC', satuan: 'PCS', stokMinimum: 10, beratPerUnit: 0.35, rfidTag: 'RFID-B7C1-0004' },
  { id: 'M005', kode: 'MAT-0005', nama: 'Kabel NYY 3x2.5mm', deskripsi: 'Kabel daya NYY 3 core 2.5mm² 100m', satuan: 'ROLL', stokMinimum: 5, beratPerUnit: 18.5, rfidTag: 'RFID-C3D9-0005' },
  { id: 'M006', kode: 'MAT-0006', nama: 'Bearing SKF 6205', deskripsi: 'Deep groove ball bearing SKF 6205-2RS', satuan: 'PCS', stokMinimum: 20, beratPerUnit: 0.09, rfidTag: 'RFID-C3D9-0006' },
  { id: 'M007', kode: 'MAT-0007', nama: 'Cat Epoxy Primer', deskripsi: 'Cat primer epoxy 2K abu-abu 1kg', satuan: 'KG', stokMinimum: 15, beratPerUnit: 1.0, rfidTag: 'RFID-D1E8-0007' },
  { id: 'M008', kode: 'MAT-0008', nama: 'Seal O-Ring NBR 50', deskripsi: 'O-Ring NBR ID50mm x 3mm', satuan: 'PCS', stokMinimum: 100, beratPerUnit: 0.005, rfidTag: 'RFID-D1E8-0008' },
  { id: 'M009', kode: 'MAT-0009', nama: 'Gasket Spiral Wound', deskripsi: 'Gasket spiral wound SS316/graphite DN50', satuan: 'PCS', stokMinimum: 15, beratPerUnit: 0.12, rfidTag: 'RFID-E5F0-0009' },
  { id: 'M010', kode: 'MAT-0010', nama: 'Resin Epoxy 2K 5kg', deskripsi: 'Resin epoxy 2 komponen untuk coating lantai', satuan: 'KG', stokMinimum: 25, beratPerUnit: 1.0, rfidTag: 'RFID-E5F0-0010' },
];

export const storageLocations: StorageLocation[] = [
  { id: 'LOC001', kode: 'WH-A-001', nama: 'Loc Alpha', tipe: 'General Storage', kapasitasMax: 50, kapasitasTerpakai: 31.2, status: 'NORMAL', suhu: 24.3, kelembaban: 58, lokasi: 'Zona A – Barat' },
  { id: 'LOC002', kode: 'WH-B-001', nama: 'Loc Beta', tipe: 'Chemical Storage', kapasitasMax: 30, kapasitasTerpakai: 27.8, status: 'PENUH', suhu: 22.1, kelembaban: 45, lokasi: 'Zona B – Tengah' },
  { id: 'LOC003', kode: 'WH-C-001', nama: 'Loc Gamma', tipe: 'Electrical Storage', kapasitasMax: 40, kapasitasTerpakai: 8.4, status: 'NORMAL', suhu: 26.7, kelembaban: 52, lokasi: 'Zona C – Timur' },
];

export const stockEntries: StockEntry[] = [
  { materialId: 'M001', locationId: 'LOC001', jumlah: 1200, beratTotal: 54, lastUpdate: '2026-08-21T08:14:22Z' },
  { materialId: 'M002', locationId: 'LOC001', jumlah: 980, beratTotal: 19.6, lastUpdate: '2026-08-21T08:14:22Z' },
  { materialId: 'M003', locationId: 'LOC002', jumlah: 18, beratTotal: 68.4, lastUpdate: '2026-08-20T15:30:00Z' },
  { materialId: 'M004', locationId: 'LOC003', jumlah: 32, beratTotal: 11.2, lastUpdate: '2026-08-21T07:00:00Z' },
  { materialId: 'M005', locationId: 'LOC001', jumlah: 8, beratTotal: 148, lastUpdate: '2026-08-19T10:00:00Z' },
  { materialId: 'M006', locationId: 'LOC001', jumlah: 45, beratTotal: 4.05, lastUpdate: '2026-08-21T09:22:00Z' },
  { materialId: 'M007', locationId: 'LOC002', jumlah: 12, beratTotal: 12, lastUpdate: '2026-08-20T11:45:00Z' },
  { materialId: 'M008', locationId: 'LOC003', jumlah: 340, beratTotal: 1.7, lastUpdate: '2026-08-21T06:30:00Z' },
  { materialId: 'M009', locationId: 'LOC001', jumlah: 28, beratTotal: 3.36, lastUpdate: '2026-08-18T14:00:00Z' },
  { materialId: 'M010', locationId: 'LOC002', jumlah: 20, beratTotal: 20, lastUpdate: '2026-08-21T10:00:00Z' },
];

export const iotDevices: IoTDevice[] = [
  { id: 'DEV001', deviceId: 'GW-MAIN-001', nama: 'Gateway Utama', tipe: 'GATEWAY', zona: 'Server Room', ipAddress: '192.168.10.1', token: 'eyJ0...A1x2', status: 'ONLINE', lastSeen: '2026-08-21T10:01:00Z', firmware: 'v2.4.1', riskScore: 5 },
  { id: 'DEV002', deviceId: 'RFID-RDR-001', nama: 'RFID Reader – Receiving', tipe: 'RFID_READER', zona: 'Zona Receiving', ipAddress: '192.168.10.11', token: 'eyJ0...B3f4', status: 'ONLINE', lastSeen: '2026-08-21T10:01:30Z', firmware: 'v1.9.3', riskScore: 12 },
  { id: 'DEV003', deviceId: 'RFID-RDR-002', nama: 'RFID Reader – Loc Alpha', tipe: 'RFID_READER', zona: 'Zona A', ipAddress: '192.168.10.12', token: 'eyJ0...C5g6', status: 'ONLINE', lastSeen: '2026-08-21T09:58:00Z', firmware: 'v1.9.3', riskScore: 8 },
  { id: 'DEV004', deviceId: 'RFID-RDR-003', nama: 'RFID Reader – Loc Beta', tipe: 'RFID_READER', zona: 'Zona B', ipAddress: '192.168.10.13', token: 'eyJ0...D7h8', status: 'OFFLINE', lastSeen: '2026-08-21T07:12:00Z', firmware: 'v1.8.0', riskScore: 35 },
  { id: 'DEV005', deviceId: 'LC-RECV-001', nama: 'Load Cell – Receiving', tipe: 'LOAD_CELL', zona: 'Zona Receiving', ipAddress: '192.168.10.21', token: 'eyJ0...E9i0', status: 'ONLINE', lastSeen: '2026-08-21T10:00:45Z', firmware: 'v3.1.0', riskScore: 10 },
  { id: 'DEV006', deviceId: 'ENV-SNS-001', nama: 'Sensor Lingkungan – Loc Alpha', tipe: 'SENSOR_ENV', zona: 'Zona A', ipAddress: '192.168.10.31', token: 'eyJ0...F1j2', status: 'ONLINE', lastSeen: '2026-08-21T10:01:00Z', firmware: 'v1.2.5', riskScore: 6 },
  { id: 'DEV007', deviceId: 'ENV-SNS-002', nama: 'Sensor Lingkungan – Loc Beta', tipe: 'SENSOR_ENV', zona: 'Zona B', ipAddress: '192.168.10.32', token: 'eyJ0...G3k4', status: 'QUARANTINE', lastSeen: '2026-08-21T05:44:00Z', firmware: 'v1.2.4', riskScore: 78 },
  { id: 'DEV008', deviceId: 'ENV-SNS-003', nama: 'Sensor Lingkungan – Loc Gamma', tipe: 'SENSOR_ENV', zona: 'Zona C', ipAddress: '192.168.10.33', token: 'eyJ0...H5l6', status: 'ONLINE', lastSeen: '2026-08-21T10:00:30Z', firmware: 'v1.2.5', riskScore: 9 },
];

export const securityEvents: SecurityEvent[] = [
  { id: 'SE001', timestamp: '2026-08-21T09:58:22Z', deviceId: 'DEV007', deviceNama: 'Sensor Lingkungan – Loc Beta', eventType: 'Anomali Payload', riskScore: 78, keputusan: 'QUARANTINE', detail: 'Payload di luar format skema MQTT yang diharapkan, kemungkinan injeksi data', ipAddress: '192.168.10.32', zona: 'Zona B' },
  { id: 'SE002', timestamp: '2026-08-21T09:45:11Z', deviceId: 'DEV004', deviceNama: 'RFID Reader – Loc Beta', eventType: 'Koneksi Gagal Berulang', riskScore: 35, keputusan: 'OBSERVE', detail: 'Percobaan koneksi ulang >10x dalam 5 menit, kemungkinan gangguan jaringan', ipAddress: '192.168.10.13', zona: 'Zona B' },
  { id: 'SE003', timestamp: '2026-08-21T09:31:05Z', deviceId: 'DEV002', deviceNama: 'RFID Reader – Receiving', eventType: 'Scan RFID Normal', riskScore: 12, keputusan: 'ALLOW', detail: 'Scan item RFID-B7C1-0003 berhasil, berat tervalidasi 3.82kg', ipAddress: '192.168.10.11', zona: 'Zona Receiving' },
  { id: 'SE004', timestamp: '2026-08-21T08:55:33Z', deviceId: 'DEV001', deviceNama: 'Gateway Utama', eventType: 'Token Refresh', riskScore: 5, keputusan: 'ALLOW', detail: 'Refresh token berhasil, sesi diperpanjang 8 jam', ipAddress: '192.168.10.1', zona: 'Server Room' },
  { id: 'SE005', timestamp: '2026-08-21T08:12:44Z', deviceId: 'DEV003', deviceNama: 'RFID Reader – Loc Alpha', eventType: 'Scan RFID Normal', riskScore: 8, keputusan: 'ALLOW', detail: 'Scan batch 12 item berhasil selama proses receiving GR2026-0048', ipAddress: '192.168.10.12', zona: 'Zona A' },
  { id: 'SE006', timestamp: '2026-08-21T07:44:00Z', deviceId: 'UNKNOWN-009', deviceNama: 'Perangkat Tidak Dikenal', eventType: 'Akses Tidak Sah', riskScore: 95, keputusan: 'BLOCK', detail: 'Upaya koneksi dari MAC address tidak terdaftar ke topik MQTT /warehouse/#', ipAddress: '192.168.10.99', zona: 'Unknown' },
  { id: 'SE007', timestamp: '2026-08-21T07:30:18Z', deviceId: 'DEV005', deviceNama: 'Load Cell – Receiving', eventType: 'Kalibrasi Diperlukan', riskScore: 22, keputusan: 'OBSERVE', detail: 'Deviasi berat ±0.8% dari referensi, dalam batas toleransi namun perlu pemantauan', ipAddress: '192.168.10.21', zona: 'Zona Receiving' },
  { id: 'SE008', timestamp: '2026-08-20T16:20:00Z', deviceId: 'DEV006', deviceNama: 'Sensor Lingkungan – Loc Alpha', eventType: 'Heartbeat Normal', riskScore: 6, keputusan: 'ALLOW', detail: 'Heartbeat rutin, suhu 24.3°C kelembaban 58% dalam rentang normal', ipAddress: '192.168.10.31', zona: 'Zona A' },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO001', noPO: 'PO-2026-0041', vendor: 'PT Fastener Nusantara', tanggal: '2026-08-15',
    items: [
      { materialId: 'M001', jumlahPO: 500, hargaSatuan: 2500 },
      { materialId: 'M002', jumlahPO: 500, hargaSatuan: 1500 },
    ]
  },
  { id: 'PO002', noPO: 'PO-2026-0042', vendor: 'CV Pelumas Jaya', tanggal: '2026-08-18', items: [{ materialId: 'M003', jumlahPO: 24, hargaSatuan: 85000 }] },
  { id: 'PO003', noPO: 'PO-2026-0043', vendor: 'PT Kabel Listrik Indonesia', tanggal: '2026-08-20', items: [{ materialId: 'M005', jumlahPO: 5, hargaSatuan: 1250000 }] },
];

export const receivingRecords: ReceivingRecord[] = [
  { id: 'GR001', noPO: 'PO-2026-0038', noGR: 'GR2026-0045', materialId: 'M006', rfidTag: 'RFID-C3D9-0006', jumlah: 20, berat: 1.8, locationId: 'LOC001', status: 'SELESAI', deviceId: 'DEV002', userId: 'USR-ADM', timestamp: '2026-08-20T10:30:00Z' },
  { id: 'GR002', noPO: 'PO-2026-0039', noGR: 'GR2026-0046', materialId: 'M009', rfidTag: 'RFID-E5F0-0009', jumlah: 10, berat: 1.2, locationId: 'LOC001', status: 'SELESAI', deviceId: 'DEV002', userId: 'USR-OPR', timestamp: '2026-08-20T14:15:00Z' },
  { id: 'GR003', noPO: 'PO-2026-0040', noGR: 'GR2026-0047', materialId: 'M007', rfidTag: 'RFID-D1E8-0007', jumlah: 5, berat: 5.0, locationId: 'LOC002', status: 'SELESAI', deviceId: 'DEV002', userId: 'USR-OPR', timestamp: '2026-08-20T15:30:00Z' },
  { id: 'GR004', noPO: 'PO-2026-0041', noGR: 'GR2026-0048', materialId: 'M001', rfidTag: 'RFID-A4F2-0001', jumlah: 500, berat: 22.5, locationId: 'LOC001', status: 'SELESAI', deviceId: 'DEV002', userId: 'USR-ADM', timestamp: '2026-08-21T08:12:00Z' },
  { id: 'GR005', noPO: 'PO-2026-0042', noGR: 'GR2026-0049', materialId: 'M003', rfidTag: 'RFID-B7C1-0003', jumlah: 6, berat: 22.92, locationId: 'LOC002', status: 'SELESAI', deviceId: 'DEV002', userId: 'USR-OPR', timestamp: '2026-08-21T09:31:00Z' },
  { id: 'GR006', noPO: 'PO-2026-0043', noGR: '', materialId: 'M005', rfidTag: 'RFID-C3D9-0005', jumlah: 3, berat: 55.5, locationId: 'LOC001', status: 'PENDING', deviceId: 'DEV002', userId: 'USR-OPR', timestamp: '2026-08-21T10:05:00Z' },
];

export const transferRecords: TransferRecord[] = [
  { id: 'TR001', noTransfer: 'TRF-2026-0012', materialId: 'M008', jumlah: 100, locationAsal: 'LOC003', locationTujuan: 'LOC001', alasan: 'Rebalancing kapasitas', userId: 'USR-ADM', deviceId: 'DEV003', timestamp: '2026-08-19T09:00:00Z', status: 'SELESAI' },
  { id: 'TR002', noTransfer: 'TRF-2026-0013', materialId: 'M010', jumlah: 5, locationAsal: 'LOC002', locationTujuan: 'LOC001', alasan: 'Permintaan produksi', userId: 'USR-OPR', deviceId: 'DEV003', timestamp: '2026-08-20T13:30:00Z', status: 'SELESAI' },
  { id: 'TR003', noTransfer: 'TRF-2026-0014', materialId: 'M004', jumlah: 5, locationAsal: 'LOC001', locationTujuan: 'LOC003', alasan: 'Pindah ke zona elektrikal', userId: 'USR-ADM', deviceId: 'DEV003', timestamp: '2026-08-21T07:00:00Z', status: 'SELESAI' },
];

export const outboundRecords: OutboundRecord[] = [
  { id: 'OUT001', noOutbound: 'OUT-2026-0005', materialId: 'M003', jumlah: 4, locationAsal: 'LOC002', alasan: 'Pemakaian produksi', referensi: 'WO-2026-201', userId: 'USR-OPR', deviceId: 'DEV003', timestamp: '2026-08-20T09:00:00Z', status: 'SELESAI' },
  { id: 'OUT002', noOutbound: 'OUT-2026-0006', materialId: 'M006', jumlah: 10, locationAsal: 'LOC001', alasan: 'Pengiriman ke maintenance', referensi: 'WO-2026-202', userId: 'USR-OPR', deviceId: 'DEV003', timestamp: '2026-08-21T07:30:00Z', status: 'SELESAI' },
];

export const auditEntries: AuditEntry[] = [
  { id: 'AUD001', timestamp: '2026-08-21T10:05:00Z', tipeTransaksi: 'PENERIMAAN', referensi: 'GR2026-0049', materialId: 'M003', locationId: 'LOC002', deltaJumlah: +6, deltaBerat: +22.92, userId: 'USR-OPR', deviceId: 'DEV002', keterangan: 'Penerimaan via PO-2026-0042' },
  { id: 'AUD002', timestamp: '2026-08-21T08:12:00Z', tipeTransaksi: 'PENERIMAAN', referensi: 'GR2026-0048', materialId: 'M001', locationId: 'LOC001', deltaJumlah: +500, deltaBerat: +22.5, userId: 'USR-ADM', deviceId: 'DEV002', keterangan: 'Penerimaan via PO-2026-0041' },
  { id: 'AUD003', timestamp: '2026-08-21T07:30:00Z', tipeTransaksi: 'KELUAR', referensi: 'OUT-2026-0006', materialId: 'M006', locationId: 'LOC001', deltaJumlah: -10, deltaBerat: -0.9, userId: 'USR-OPR', deviceId: 'DEV003', keterangan: 'Pengeluaran ke maintenance WO-2026-202' },
  { id: 'AUD004', timestamp: '2026-08-21T07:00:00Z', tipeTransaksi: 'TRANSFER', referensi: 'TRF-2026-0014', materialId: 'M004', locationId: 'LOC003', deltaJumlah: +5, deltaBerat: +1.75, userId: 'USR-ADM', deviceId: 'DEV003', keterangan: 'Transfer dari LOC001 ke LOC003' },
  { id: 'AUD005', timestamp: '2026-08-20T15:30:00Z', tipeTransaksi: 'PENERIMAAN', referensi: 'GR2026-0047', materialId: 'M007', locationId: 'LOC002', deltaJumlah: +5, deltaBerat: +5.0, userId: 'USR-OPR', deviceId: 'DEV002', keterangan: 'Penerimaan via PO-2026-0040' },
  { id: 'AUD006', timestamp: '2026-08-20T14:15:00Z', tipeTransaksi: 'PENERIMAAN', referensi: 'GR2026-0046', materialId: 'M009', locationId: 'LOC001', deltaJumlah: +10, deltaBerat: +1.2, userId: 'USR-OPR', deviceId: 'DEV002', keterangan: 'Penerimaan via PO-2026-0039' },
  { id: 'AUD007', timestamp: '2026-08-20T13:30:00Z', tipeTransaksi: 'TRANSFER', referensi: 'TRF-2026-0013', materialId: 'M010', locationId: 'LOC001', deltaJumlah: +5, deltaBerat: +5.0, userId: 'USR-OPR', deviceId: 'DEV003', keterangan: 'Transfer dari LOC002 ke LOC001' },
  { id: 'AUD008', timestamp: '2026-08-20T09:00:00Z', tipeTransaksi: 'KELUAR', referensi: 'OUT-2026-0005', materialId: 'M003', locationId: 'LOC002', deltaJumlah: -4, deltaBerat: -15.2, userId: 'USR-OPR', deviceId: 'DEV003', keterangan: 'Pengeluaran pemakaian produksi WO-2026-201' },
  { id: 'AUD009', timestamp: '2026-08-20T10:30:00Z', tipeTransaksi: 'PENERIMAAN', referensi: 'GR2026-0045', materialId: 'M006', locationId: 'LOC001', deltaJumlah: +20, deltaBerat: +1.8, userId: 'USR-ADM', deviceId: 'DEV002', keterangan: 'Penerimaan via PO-2026-0038' },
  { id: 'AUD010', timestamp: '2026-08-19T09:00:00Z', tipeTransaksi: 'TRANSFER', referensi: 'TRF-2026-0012', materialId: 'M008', locationId: 'LOC001', deltaJumlah: +100, deltaBerat: +0.5, userId: 'USR-ADM', deviceId: 'DEV003', keterangan: 'Transfer dari LOC003 ke LOC001' },
];

export const activityChartData = [
  { jam: '00:00', penerimaan: 0, transfer: 0, keluar: 0 },
  { jam: '02:00', penerimaan: 0, transfer: 0, keluar: 0 },
  { jam: '04:00', penerimaan: 0, transfer: 0, keluar: 0 },
  { jam: '06:00', penerimaan: 0, transfer: 1, keluar: 0 },
  { jam: '07:00', penerimaan: 1, transfer: 1, keluar: 1 },
  { jam: '08:00', penerimaan: 2, transfer: 0, keluar: 1 },
  { jam: '09:00', penerimaan: 1, transfer: 0, keluar: 0 },
  { jam: '10:00', penerimaan: 2, transfer: 0, keluar: 0 },
  { jam: '11:00', penerimaan: 0, transfer: 0, keluar: 0 },
];

export const weeklyActivityData = [
  { hari: 'Sen', penerimaan: 5, transfer: 2, keluar: 3 },
  { hari: 'Sel', penerimaan: 3, transfer: 4, keluar: 2 },
  { hari: 'Rab', penerimaan: 7, transfer: 1, keluar: 5 },
  { hari: 'Kam', penerimaan: 4, transfer: 3, keluar: 4 },
  { hari: 'Jum', penerimaan: 6, transfer: 5, keluar: 6 },
  { hari: 'Sab', penerimaan: 2, transfer: 1, keluar: 1 },
  { hari: 'Min', penerimaan: 0, transfer: 0, keluar: 0 },
];

export const stockTrendData = [
  { tanggal: '14 Agu', total: 2580 },
  { tanggal: '15 Agu', total: 2620 },
  { tanggal: '16 Agu', total: 2580 },
  { tanggal: '17 Agu', total: 2600 },
  { tanggal: '18 Agu', total: 2550 },
  { tanggal: '19 Agu', total: 2720 },
  { tanggal: '20 Agu', total: 2750 },
  { tanggal: '21 Agu', total: 2683 },
];
