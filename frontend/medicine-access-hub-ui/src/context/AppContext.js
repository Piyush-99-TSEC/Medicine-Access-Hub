import { createContext, useContext, useState, useCallback } from 'react';
import {
  INVENTORY,
  INITIAL_RESERVATIONS,
  PENDING_VERIFICATIONS,
  PHARMACIES,
  authenticate
} from '../mock/mockData';

const AppContext = createContext(null);
const SESSION_KEY = 'mah_session';

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSession);
  const [inventory, setInventory] = useState(INVENTORY);
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [verifications, setVerifications] = useState(PENDING_VERIFICATIONS);
  const [pharmacies, setPharmacies] = useState(PHARMACIES);
  const [toast, setToast] = useState(null);

  const isAuthenticated = !!currentUser;
  const role = currentUser?.role || null;

  const showToast = useCallback((message, variant = 'success') => {
    setToast({ message, variant, id: Date.now() });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Returns the authenticated user object on success, or null on bad credentials.
  const login = useCallback((email, password) => {
    const user = authenticate(email, password);
    if (!user) return null;
    setCurrentUser(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  // Used by Register.js to sign a brand-new demo account straight in
  // (no credential lookup needed since the account was just created).
  const loginAsUser = useCallback((user) => {
    setCurrentUser(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }, []);

  const createReservation = useCallback((reservation) => {
    setReservations(prev => [
      { ...reservation, id: `res_${Date.now()}`, status: 'PENDING', createdAt: Date.now(), holdMinutes: 15 },
      ...prev
    ]);
    setInventory(prev =>
      prev.map(inv =>
        inv.pharmacyId === reservation.pharmacyId && inv.medicineId === reservation.medicineId
          ? { ...inv, quantity: Math.max(0, inv.quantity - reservation.quantity) }
          : inv
      )
    );
    showToast('Medicine reserved. Hold expires in 15 minutes.', 'success');
  }, [showToast]);

  const updateReservationStatus = useCallback((id, status) => {
    setReservations(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
    showToast(
      status === 'CONFIRMED' ? 'Reservation confirmed.' : status === 'REJECTED' ? 'Reservation rejected.' : `Reservation ${status.toLowerCase()}.`,
      status === 'REJECTED' ? 'danger' : 'success'
    );
  }, [showToast]);

  const updateInventoryItem = useCallback((id, changes) => {
    setInventory(prev => prev.map(inv => (inv.id === id ? { ...inv, ...changes, lastUpdated: new Date().toISOString() } : inv)));
    showToast('Inventory updated.', 'success');
  }, [showToast]);

  const deleteInventoryItem = useCallback((id) => {
    setInventory(prev => prev.filter(inv => inv.id !== id));
    showToast('Inventory item removed.', 'danger');
  }, [showToast]);

  const addInventoryItem = useCallback((item) => {
    setInventory(prev => [{ ...item, id: `inv_${Date.now()}`, lastUpdated: new Date().toISOString() }, ...prev]);
    showToast('New stock added.', 'success');
  }, [showToast]);

  const verifyPharmacy = useCallback((verificationId, approve) => {
    const record = verifications.find(v => v.id === verificationId);
    setVerifications(prev => prev.filter(v => v.id !== verificationId));
    if (record) {
      setPharmacies(prev => prev.map(p => (p.id === record.pharmacyId ? { ...p, isVerified: approve } : p)));
    }
    showToast(approve ? 'Pharmacy approved.' : 'Pharmacy registration rejected.', approve ? 'success' : 'danger');
  }, [verifications, showToast]);

  const value = {
    role,
    isAuthenticated,
    login,
    logout,
    loginAsUser,
    currentUser,
    inventory,
    reservations,
    verifications,
    pharmacies,
    toast,
    showToast,
    createReservation,
    updateReservationStatus,
    updateInventoryItem,
    deleteInventoryItem,
    addInventoryItem,
    verifyPharmacy
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
