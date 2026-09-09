// ---------------------------------------------------------------------------
// Medicine Access Hub — Mock Data Layer
// Simulates the PostgreSQL/PostGIS + AI-service backend for frontend-only dev.
// Coordinates are centred on a sample locality (Pune, India) for realism.
// ---------------------------------------------------------------------------

export const USER_LOCATION = { lat: 18.5204, lng: 73.8567 };

export const ROLES = {
  PATIENT: 'PATIENT',
  PHARMACY_OWNER: 'PHARMACY_OWNER',
  ADMIN: 'ADMIN'
};

export const DEMO_USERS = {
  PATIENT: { name: 'Ananya Rao', email: 'patient@demo.in', role: ROLES.PATIENT },
  PHARMACY_OWNER: { name: 'Vikram Deshmukh', email: 'pharmacy@demo.in', role: ROLES.PHARMACY_OWNER, pharmacyId: 'ph_1' },
  ADMIN: { name: 'Dr. Anjali Malviya', email: 'admin@demo.in', role: ROLES.ADMIN }
};

// Credential-based login table for demo authentication.
export const MOCK_USERS = [
  { email: 'patient@demo.in', password: 'patient123', role: ROLES.PATIENT, name: 'Ananya Rao' },
  { email: 'pharmacy@demo.in', password: 'pharmacy123', role: ROLES.PHARMACY_OWNER, name: 'Vikram Deshmukh', pharmacyId: 'ph_1' },
  { email: 'admin@demo.in', password: 'admin123', role: ROLES.ADMIN, name: 'Dr. Anjali Malviya' }
];

export function authenticate(email, password) {
  const match = MOCK_USERS.find(
    u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
  );
  return match || null;
}

// ---------------------------------------------------------------------------
// Medicine Master Table
// ---------------------------------------------------------------------------
export const MEDICINES = [
  { id: 'med_1', brand: 'Crocin 650', generic: 'Paracetamol', salt: 'Paracetamol', strength: '650mg', form: 'Tablet', manufacturer: 'GSK', rxRequired: false, mrp: 32 },
  { id: 'med_2', brand: 'Dolo 650', generic: 'Paracetamol', salt: 'Paracetamol', strength: '650mg', form: 'Tablet', manufacturer: 'Micro Labs', rxRequired: false, mrp: 30 },
  { id: 'med_3', brand: 'Calpol 500', generic: 'Paracetamol', salt: 'Paracetamol', strength: '500mg', form: 'Tablet', manufacturer: 'GSK', rxRequired: false, mrp: 22 },
  { id: 'med_4', brand: 'Telma 40', generic: 'Telmisartan', salt: 'Telmisartan', strength: '40mg', form: 'Tablet', manufacturer: 'Glenmark', rxRequired: true, mrp: 118 },
  { id: 'med_5', brand: 'Telsartan 40', generic: 'Telmisartan', salt: 'Telmisartan', strength: '40mg', form: 'Tablet', manufacturer: 'Torrent', rxRequired: true, mrp: 96 },
  { id: 'med_6', brand: 'Augmentin 625', generic: 'Amoxicillin + Clavulanate', salt: 'Amoxicillin + Clavulanate', strength: '625mg', form: 'Tablet', manufacturer: 'GSK', rxRequired: true, mrp: 210 },
  { id: 'med_7', brand: 'Clavam 625', generic: 'Amoxicillin + Clavulanate', salt: 'Amoxicillin + Clavulanate', strength: '625mg', form: 'Tablet', manufacturer: 'Alkem', rxRequired: true, mrp: 165 },
  { id: 'med_8', brand: 'Metformin 500', generic: 'Metformin', salt: 'Metformin HCl', strength: '500mg', form: 'Tablet', manufacturer: 'USV', rxRequired: true, mrp: 45 },
  { id: 'med_9', brand: 'Glycomet 500', generic: 'Metformin', salt: 'Metformin HCl', strength: '500mg', form: 'Tablet', manufacturer: 'USV', rxRequired: true, mrp: 38 },
  { id: 'med_10', brand: 'Azithral 500', generic: 'Azithromycin', salt: 'Azithromycin', strength: '500mg', form: 'Tablet', manufacturer: 'Alembic', rxRequired: true, mrp: 132 },
  { id: 'med_11', brand: 'Pantocid 40', generic: 'Pantoprazole', salt: 'Pantoprazole', strength: '40mg', form: 'Tablet', manufacturer: 'Sun Pharma', rxRequired: false, mrp: 88 },
  { id: 'med_12', brand: 'Cetirizine 10', generic: 'Cetirizine', salt: 'Cetirizine HCl', strength: '10mg', form: 'Tablet', manufacturer: 'Cipla', rxRequired: false, mrp: 18 }
];

// Substitutes: same salt + same strength + same form (safety hard filter)
export function getSubstitutes(medicineId) {
  const med = MEDICINES.find(m => m.id === medicineId);
  if (!med) return [];
  return MEDICINES.filter(
    m => m.id !== medicineId && m.salt === med.salt && m.strength === med.strength && m.form === med.form
  );
}

// ---------------------------------------------------------------------------
// Pharmacies (with spatial coordinates near USER_LOCATION)
// ---------------------------------------------------------------------------
export const PHARMACIES = [
  { id: 'ph_1', name: 'Wellness Plus Pharmacy', licenceNo: 'MH-PH-11029', address: 'FC Road, Shivajinagar', lat: 18.5236, lng: 73.8478, rating: 4.6, isVerified: true, openTime: '08:00', closeTime: '22:30', ownerId: 'owner_1', contact: '+91 98220 11234' },
  { id: 'ph_2', name: 'CarePoint Medicos', licenceNo: 'MH-PH-11077', address: 'JM Road, Deccan Gymkhana', lat: 18.5158, lng: 73.8412, rating: 4.2, isVerified: true, openTime: '07:30', closeTime: '23:00', ownerId: 'owner_2', contact: '+91 98230 55621' },
  { id: 'ph_3', name: 'Sanjeevani Medical Store', licenceNo: 'MH-PH-10932', address: 'Karve Road, Kothrud', lat: 18.5074, lng: 73.8077, rating: 3.9, isVerified: true, openTime: '09:00', closeTime: '21:00', ownerId: 'owner_3', contact: '+91 99870 43221' },
  { id: 'ph_4', name: 'Apollo Neighbourhood Pharmacy', licenceNo: 'MH-PH-11501', address: 'Camp, Pune', lat: 18.5122, lng: 73.8797, rating: 4.7, isVerified: true, openTime: '00:00', closeTime: '23:59', ownerId: 'owner_4', contact: '+91 98765 22110' },
  { id: 'ph_5', name: 'MedLife Corner Store', licenceNo: 'MH-PH-11890', address: 'Aundh Main Road', lat: 18.5590, lng: 73.8078, rating: 4.0, isVerified: false, openTime: '08:00', closeTime: '21:30', ownerId: 'owner_5', contact: '+91 90210 33445' },
  { id: 'ph_6', name: 'Shree Ganesh Pharma', licenceNo: 'MH-PH-10711', address: 'Swargate Chowk', lat: 18.5008, lng: 73.8636, rating: 3.6, isVerified: true, openTime: '08:30', closeTime: '22:00', ownerId: 'owner_6', contact: '+91 91234 77889' },
  { id: 'ph_7', name: 'Vitality Health Chemist', licenceNo: 'MH-PH-11345', address: 'Viman Nagar', lat: 18.5679, lng: 73.9143, rating: 4.4, isVerified: true, openTime: '09:00', closeTime: '22:00', ownerId: 'owner_7', contact: '+91 90112 65534' },
  { id: 'ph_8', name: 'City Central Medicals', licenceNo: 'MH-PH-11623', address: 'Bund Garden Road', lat: 18.5362, lng: 73.8823, rating: 4.1, isVerified: true, openTime: '08:00', closeTime: '22:00', ownerId: 'owner_8', contact: '+91 99225 11009' }
];

// ---------------------------------------------------------------------------
// Inventory — links pharmacies to medicines with quantity/price/expiry
// Per spec: Green >10 units, Yellow <5 units, Red = 0 / out of stock.
// (5–10 units is treated as Low/Yellow too, since it is neither the Green
// threshold nor zero — this fills the stated gap without contradicting it.)
// ---------------------------------------------------------------------------
function stockStatus(qty) {
  if (qty > 10) return 'IN_STOCK';
  if (qty > 0) return 'LOW_STOCK';
  return 'OUT_OF_STOCK';
}

export const RAW_INVENTORY = [
  ['ph_1', 'med_1', 42, 32, '2027-03-10'],
  ['ph_1', 'med_4', 6, 118, '2026-11-02'],
  ['ph_1', 'med_8', 0, 45, '2026-09-20'],
  ['ph_1', 'med_11', 25, 88, '2027-01-15'],
  ['ph_1', 'med_12', 60, 18, '2027-05-01'],

  ['ph_2', 'med_2', 15, 30, '2026-12-08'],
  ['ph_2', 'med_5', 30, 96, '2027-02-14'],
  ['ph_2', 'med_6', 4, 210, '2026-10-05'],
  ['ph_2', 'med_9', 18, 38, '2027-04-01'],

  ['ph_3', 'med_1', 0, 32, '2026-08-01'],
  ['ph_3', 'med_3', 20, 22, '2027-01-01'],
  ['ph_3', 'med_10', 12, 132, '2026-09-30'],
  ['ph_3', 'med_12', 3, 18, '2026-09-18'],

  ['ph_4', 'med_1', 80, 33, '2027-06-01'],
  ['ph_4', 'med_4', 40, 120, '2027-03-01'],
  ['ph_4', 'med_6', 22, 215, '2027-02-01'],
  ['ph_4', 'med_8', 55, 46, '2027-05-15'],
  ['ph_4', 'med_10', 30, 135, '2027-01-20'],

  ['ph_5', 'med_2', 0, 30, '2026-08-15'],
  ['ph_5', 'med_7', 9, 165, '2026-10-12'],
  ['ph_5', 'med_9', 0, 38, '2026-09-05'],

  ['ph_6', 'med_1', 5, 32, '2026-09-25'],
  ['ph_6', 'med_3', 0, 22, '2026-09-10'],
  ['ph_6', 'med_11', 14, 90, '2027-02-01'],

  ['ph_7', 'med_4', 17, 118, '2027-04-10'],
  ['ph_7', 'med_5', 0, 96, '2026-09-01'],
  ['ph_7', 'med_10', 8, 130, '2026-11-11'],
  ['ph_7', 'med_12', 44, 18, '2027-06-20'],

  ['ph_8', 'med_2', 33, 29, '2027-03-22'],
  ['ph_8', 'med_6', 11, 208, '2027-01-30'],
  ['ph_8', 'med_8', 28, 44, '2027-02-28']
];

export const INVENTORY = RAW_INVENTORY.map(([pharmacyId, medicineId, qty, price, expiry], idx) => ({
  id: `inv_${idx + 1}`,
  pharmacyId,
  medicineId,
  quantity: qty,
  price,
  expiryDate: expiry,
  status: stockStatus(qty),
  lastUpdated: '2026-09-05T10:30:00Z'
}));

// ---------------------------------------------------------------------------
// Haversine distance (km) — spatial radius filter + A* heuristic simulation
// ---------------------------------------------------------------------------
export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// Simulated "A* road distance" — approximated as Haversine * a realism factor
// (roads are never perfectly straight, so road distance >= great-circle distance)
export function simulatedRoadDistanceKm(a, b) {
  const straight = haversineKm(a, b);
  const detourFactor = 1.15 + Math.random() * 0.35;
  return +(straight * detourFactor).toFixed(2);
}

// ---------------------------------------------------------------------------
// Weighted Sum Model ranking
// weights: distance 0.35 (cost), stock 0.25 (benefit), price 0.20 (cost),
// rating 0.15 (benefit), openNow 0.05 (benefit)
// ---------------------------------------------------------------------------
export function rankPharmaciesWSM(candidates) {
  if (candidates.length === 0) return [];
  const distances = candidates.map(c => c.roadDistanceKm);
  const stocks = candidates.map(c => c.quantity);
  const prices = candidates.map(c => c.price);
  const ratings = candidates.map(c => c.rating);

  const minMax = arr => ({ min: Math.min(...arr), max: Math.max(...arr) });
  const dRange = minMax(distances);
  const sRange = minMax(stocks);
  const pRange = minMax(prices);
  const rRange = minMax(ratings);

  const norm = (val, range, isCost) => {
    if (range.max === range.min) return 1;
    return isCost
      ? (range.max - val) / (range.max - range.min)
      : (val - range.min) / (range.max - range.min);
  };

  return candidates
    .map(c => {
      const nDist = norm(c.roadDistanceKm, dRange, true);
      const nStock = norm(c.quantity, sRange, false);
      const nPrice = norm(c.price, pRange, true);
      const nRating = norm(c.rating, rRange, false);
      const nOpen = c.isOpenNow ? 1 : 0;
      const score =
        0.35 * nDist + 0.25 * nStock + 0.2 * nPrice + 0.15 * nRating + 0.05 * nOpen;
      return { ...c, wsmScore: +(score * 100).toFixed(1) };
    })
    .sort((a, b) => b.wsmScore - a.wsmScore);
}

export function isPharmacyOpenNow(pharmacy) {
  if (pharmacy.openTime === '00:00' && pharmacy.closeTime === '23:59') return true;
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const [openH] = pharmacy.openTime.split(':').map(Number);
  const [closeH] = pharmacy.closeTime.split(':').map(Number);
  return hour >= openH && hour <= closeH;
}

// ---------------------------------------------------------------------------
// Reservations (mock lifecycle: PENDING -> CONFIRMED / REJECTED / EXPIRED / COLLECTED)
// ---------------------------------------------------------------------------
export const INITIAL_RESERVATIONS = [
  { id: 'res_1', userId: 'patient_demo', userName: 'Ananya Rao', pharmacyId: 'ph_1', medicineId: 'med_1', quantity: 2, status: 'PENDING', createdAt: Date.now() - 1000 * 60 * 4, holdMinutes: 15, totalAmount: 64 },
  { id: 'res_2', userId: 'patient_demo_2', userName: 'Rahul Nair', pharmacyId: 'ph_1', medicineId: 'med_11', quantity: 1, status: 'CONFIRMED', createdAt: Date.now() - 1000 * 60 * 60, holdMinutes: 15, totalAmount: 88 }
];

// ---------------------------------------------------------------------------
// Unmet demand search logs (zero-result searches) — feeds DBSCAN simulation
// ---------------------------------------------------------------------------
export const UNMET_DEMAND_CLUSTERS = [
  { id: 'cluster_1', medicineId: 'med_8', medicineName: 'Metformin 500', centroid: { lat: 18.5300, lng: 73.8700 }, searchCount: 43, distinctUsers: 31, radiusMeters: 500, nearestPharmacyKm: 6.2, windowDays: 7 },
  { id: 'cluster_2', medicineId: 'med_5', medicineName: 'Telsartan 40', centroid: { lat: 18.5610, lng: 73.9105 }, searchCount: 27, distinctUsers: 19, radiusMeters: 500, nearestPharmacyKm: 4.8, windowDays: 7 },
  { id: 'cluster_3', medicineId: 'med_9', medicineName: 'Glycomet 500', centroid: { lat: 18.5560, lng: 73.8060 }, searchCount: 16, distinctUsers: 12, radiusMeters: 500, nearestPharmacyKm: 3.1, windowDays: 7 }
];

// 7-day trend of failed searches feeding SalesReservationChart / demand charts
export const UNMET_DEMAND_TREND = [
  { day: 'Mon', count: 12 }, { day: 'Tue', count: 18 }, { day: 'Wed', count: 9 },
  { day: 'Thu', count: 21 }, { day: 'Fri', count: 27 }, { day: 'Sat', count: 15 }, { day: 'Sun', count: 11 }
];

// ---------------------------------------------------------------------------
// OCR simulation dataset — used by the Strip/Box scan modal
// ---------------------------------------------------------------------------
export const OCR_SIMULATION_RESULTS = [
  { rawTokens: ['PARAGETAMOI', '650', 'MG', 'TAB'], candidates: ['med_1', 'med_2', 'med_3'], confidence: [0.91, 0.74, 0.52] },
  { rawTokens: ['TEIMISARTAN', '40', 'MG'], candidates: ['med_4', 'med_5'], confidence: [0.88, 0.81] },
  { rawTokens: ['AZITHRAL', '500'], candidates: ['med_10'], confidence: [0.95] }
];

// ---------------------------------------------------------------------------
// Admin: pharmacy verification queue
// ---------------------------------------------------------------------------
export const PENDING_VERIFICATIONS = [
  { id: 'ver_1', pharmacyId: 'ph_5', submittedAt: '2026-09-01', documents: ['Drug Licence Form 20', 'GST Certificate'] }
];

// Daily reservation volume for pharmacy-dashboard SalesReservationChart
export const RESERVATION_TREND = [
  { day: 'Mon', reservations: 4 }, { day: 'Tue', reservations: 7 }, { day: 'Wed', reservations: 5 },
  { day: 'Thu', reservations: 9 }, { day: 'Fri', reservations: 12 }, { day: 'Sat', reservations: 8 }, { day: 'Sun', reservations: 6 }
];

// ---------------------------------------------------------------------------
// Admin: Audit & Reports tab mock data
// ---------------------------------------------------------------------------
export const ADMIN_ACTIVITY_LOG = [
  { id: 'log_1', dateTime: '2026-09-06 09:14', admin: 'Dr. Anjali Malviya', action: 'Approved pharmacy licence', module: 'Verification', status: 'Success' },
  { id: 'log_2', dateTime: '2026-09-06 08:52', admin: 'Dr. Anjali Malviya', action: 'Edited medicine master entry — Telma 40', module: 'Medicine Master Data', status: 'Success' },
  { id: 'log_3', dateTime: '2026-09-05 19:20', admin: 'Dr. Anjali Malviya', action: 'Rejected pharmacy registration — Quick Meds', module: 'Verification', status: 'Success' },
  { id: 'log_4', dateTime: '2026-09-05 14:03', admin: 'Dr. Anjali Malviya', action: 'Exported unmet demand report', module: 'Reports', status: 'Success' },
  { id: 'log_5', dateTime: '2026-09-04 11:47', admin: 'Dr. Anjali Malviya', action: 'Attempted bulk medicine import', module: 'Medicine Master Data', status: 'Failed' }
];

// Search-demand counts per medicine (last 7 days) for the pharmacy dashboard's
// "Medicine Demand vs Current Stock" comparison table.
export const MEDICINE_SEARCH_DEMAND = {
  med_1: 8, med_2: 5, med_3: 3, med_4: 22, med_5: 27, med_6: 6,
  med_7: 4, med_8: 43, med_9: 16, med_10: 9, med_11: 5, med_12: 2
};

export const ADMIN_REPORTS = [
  { id: 'rep_1', name: 'Pharmacy Report', description: 'Registration status, ratings, and licence details for all pharmacies.', updated: '2026-09-06' },
  { id: 'rep_2', name: 'Inventory Report', description: 'Stock levels, pricing, and expiry summary across all pharmacies.', updated: '2026-09-06' },
  { id: 'rep_3', name: 'Reservation Report', description: 'Reservation volume, fulfilment rate, and status breakdown.', updated: '2026-09-05' },
  { id: 'rep_4', name: 'Unmet Demand Report', description: 'DBSCAN cluster summary of zero-result searches by locality.', updated: '2026-09-05' }
];
