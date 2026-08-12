import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ViewMode, 
  CalendarMode, 
  Client, 
  Service, 
  Package, 
  Staff, 
  Appointment, 
  InventoryItem, 
  GiftCard, 
  Expense, 
  WaitlistItem, 
  Transformation, 
  LoyaltyRedemption, 
  Settings,
  AppointmentStatus
} from '../types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_SERVICES, 
  INITIAL_PACKAGES, 
  INITIAL_STAFF, 
  INITIAL_APPOINTMENTS, 
  INITIAL_INVENTORY, 
  INITIAL_GIFTCARDS, 
  INITIAL_EXPENSES, 
  INITIAL_WAITLIST, 
  INITIAL_TRANSFORMATIONS, 
  INITIAL_SETTINGS,
  getFixedToday,
  formatISO
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  calendarMode: CalendarMode;
  setCalendarMode: (m: CalendarMode) => void;
  calendarDate: Date;
  setCalendarDate: (d: Date) => void;
  selectedStaffId: string;
  setSelectedStaffId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  clients: Client[];
  services: Service[];
  packages: Package[];
  staff: Staff[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  giftCards: GiftCard[];
  expenses: Expense[];
  waitlist: WaitlistItem[];
  transformations: Transformation[];
  redemptions: LoyaltyRedemption[];
  settings: Settings;
  
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Modals state helper
  activeModal: string | null;
  modalData: any;
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
  confirmDelete: (options: {
    title?: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }) => void;

  // CRUD Actions
  addAppointment: (appt: Omit<Appointment, 'id'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, retail?: number) => void;
  updateAppointment: (id: string, appt: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'points' | 'photos'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addService: (svc: Omit<Service, 'id'>) => Service;
  updateService: (id: string, svc: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addPackage: (pkg: Omit<Package, 'id'>) => Package;
  deletePackage: (id: string) => void;

  addStaff: (st: Omit<Staff, 'id'>) => Staff;
  updateStaff: (id: string, st: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => InventoryItem;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  addGiftCard: (gc: Omit<GiftCard, 'id' | 'issued'>) => GiftCard;
  addExpense: (exp: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;

  addWaitlist: (wl: Omit<WaitlistItem, 'id' | 'created'>) => WaitlistItem;
  deleteWaitlist: (id: string) => void;

  addTransformation: (tr: Omit<Transformation, 'id'>) => Transformation;
  deleteTransformation: (id: string) => void;

  redeemPoints: (clientId: string, rewardTitle: string, pointsNeeded: number) => string | null;

  updateSettings: (newSettings: Partial<Settings>) => void;
  resetToDemoData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const STORAGE_KEY = 'pawbook_pro_store_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week');
  const [calendarDate, setCalendarDate] = useState<Date>(getFixedToday());
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [packages, setPackages] = useState<Package[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [giftCards, setGiftCards] = useState<GiftCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_giftcards');
    return saved ? JSON.parse(saved) : INITIAL_GIFTCARDS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [waitlist, setWaitlist] = useState<WaitlistItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_waitlist');
    return saved ? JSON.parse(saved) : INITIAL_WAITLIST;
  });

  const [transformations, setTransformations] = useState<Transformation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_transformations');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFORMATIONS;
  });

  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_redemptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_giftcards', JSON.stringify(giftCards));
  }, [giftCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_waitlist', JSON.stringify(waitlist));
  }, [waitlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_transformations', JSON.stringify(transformations));
  }, [transformations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_redemptions', JSON.stringify(redemptions));
  }, [redemptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings));
  }, [settings]);

  // Toast Helpers
  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 't_' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modal Helpers
  const openModal = (modalName: string, data?: any) => {
    setActiveModal(modalName);
    setModalData(data || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const confirmDelete = ({
    title = 'Confirm Deletion',
    message,
    confirmLabel = 'Delete',
    onConfirm,
  }: {
    title?: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }) => {
    openModal('confirmModal', {
      title,
      message,
      confirmLabel,
      onConfirm,
    });
  };

  // CRUD Functions
  const addAppointment = (apptData: Omit<Appointment, 'id'>) => {
    const id = 'ap_' + Date.now();
    const newAppt: Appointment = { id, ...apptData };
    setAppointments((prev) => [newAppt, ...prev]);

    // Automatically add loyalty points if completed
    if (newAppt.status === 'completed') {
      const earned = Math.floor((newAppt.price + (newAppt.retail || 0)) * settings.ppd);
      if (earned > 0) {
        setClients((prev) =>
          prev.map((c) => (c.id === newAppt.clientId ? { ...c, points: (c.points || 0) + earned } : c))
        );
      }
    }

    const client = clients.find((c) => c.id === newAppt.clientId);
    const petName = client ? client.name : 'Pet';
    showToast(`Appointment booked for ${petName}!`, 'success');
    return newAppt;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus, retail?: number) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, status, retail: retail !== undefined ? retail : a.retail };
          // Award loyalty points on completion if transitioning to completed
          if (status === 'completed' && a.status !== 'completed') {
            const earned = Math.floor((updated.price + (updated.retail || 0)) * settings.ppd);
            if (earned > 0) {
              setClients((cList) =>
                cList.map((c) => (c.id === a.clientId ? { ...c, points: (c.points || 0) + earned } : c))
              );
            }
          }
          return updated;
        }
        return a;
      })
    );
    showToast(`Appointment status updated to ${status}`, 'info');
  };

  const updateAppointment = (id: string, apptData: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...apptData } : a)));
    showToast('Appointment updated', 'success');
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    showToast('Appointment cancelled/removed', 'info');
  };

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'points' | 'photos'>) => {
    const id = 'cl_' + Date.now();
    const newClient: Client = {
      id,
      ...clientData,
      points: 50, // Welcome bonus points
      photos: [],
      createdAt: formatISO(getFixedToday()),
    };
    setClients((prev) => [newClient, ...prev]);
    showToast(`Client ${newClient.name} (${newClient.owner}) added!`, 'success');
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...clientData } : c)));
    showToast('Client details updated', 'success');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setAppointments((prev) => prev.filter((a) => a.clientId !== id));
    showToast('Client deleted', 'info');
  };

  const addService = (svcData: Omit<Service, 'id'>) => {
    const id = 'sv_' + Date.now();
    const newSvc: Service = { id, ...svcData };
    setServices((prev) => [...prev, newSvc]);
    showToast(`Service "${newSvc.name}" added`, 'success');
    return newSvc;
  };

  const updateService = (id: string, svcData: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...svcData } : s)));
    showToast('Service updated', 'success');
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Service removed', 'info');
  };

  const addPackage = (pkgData: Omit<Package, 'id'>) => {
    const id = 'pk_' + Date.now();
    const newPkg: Package = { id, ...pkgData };
    setPackages((prev) => [...prev, newPkg]);
    showToast(`Package "${newPkg.name}" created`, 'success');
    return newPkg;
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    showToast('Package deleted', 'info');
  };

  const addStaff = (stData: Omit<Staff, 'id'>) => {
    const id = 'st_' + Date.now();
    const newSt: Staff = { id, ...stData };
    setStaff((prev) => [...prev, newSt]);
    showToast(`Staff member ${newSt.name} added`, 'success');
    return newSt;
  };

  const updateStaff = (id: string, stData: Partial<Staff>) => {
    setStaff((prev) => prev.map((st) => (st.id === id ? { ...st, ...stData } : st)));
    showToast('Staff schedule updated', 'success');
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((st) => st.id !== id));
    showToast('Staff member removed', 'info');
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const id = 'in_' + Date.now();
    const newItem: InventoryItem = { id, ...itemData };
    setInventory((prev) => [...prev, newItem]);
    showToast(`Product "${newItem.name}" added`, 'success');
    return newItem;
  };

  const updateInventoryItem = (id: string, itemData: Partial<InventoryItem>) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, ...itemData } : item)));
    showToast('Inventory updated', 'success');
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
    showToast('Product removed', 'info');
  };

  const addGiftCard = (gcData: Omit<GiftCard, 'id' | 'issued'>) => {
    const id = 'gc_' + Date.now();
    const newGc: GiftCard = {
      id,
      ...gcData,
      issued: formatISO(getFixedToday()),
    };
    setGiftCards((prev) => [newGc, ...prev]);
    showToast(`Gift card ${newGc.code} generated!`, 'success');
    return newGc;
  };

  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const id = 'ex_' + Date.now();
    const newExp: Expense = { id, ...expData };
    setExpenses((prev) => [newExp, ...prev]);
    showToast(`Expense recorded ($${newExp.amount.toFixed(2)})`, 'success');
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense removed', 'info');
  };

  const addWaitlist = (wlData: Omit<WaitlistItem, 'id' | 'created'>) => {
    const id = 'wl_' + Date.now();
    const newWl: WaitlistItem = {
      id,
      ...wlData,
      created: formatISO(getFixedToday()),
    };
    setWaitlist((prev) => [newWl, ...prev]);
    showToast('Added to waitlist', 'success');
    return newWl;
  };

  const deleteWaitlist = (id: string) => {
    setWaitlist((prev) => prev.filter((w) => w.id !== id));
    showToast('Removed from waitlist', 'info');
  };

  const addTransformation = (trData: Omit<Transformation, 'id'>) => {
    const id = 'tr_' + Date.now();
    const newTr: Transformation = { id, ...trData };
    setTransformations((prev) => [newTr, ...prev]);
    showToast('New Transformation photo added to gallery!', 'success');
    return newTr;
  };

  const deleteTransformation = (id: string) => {
    setTransformations((prev) => prev.filter((t) => t.id !== id));
    showToast('Gallery entry deleted', 'info');
  };

  const redeemPoints = (clientId: string, rewardTitle: string, pointsNeeded: number) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      showToast('Client not found', 'error');
      return null;
    }
    if ((client.points || 0) < pointsNeeded) {
      showToast(`Insufficient points! Client has ${client.points} pts, needs ${pointsNeeded} pts.`, 'warning');
      return null;
    }

    // Deduct points
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, points: c.points - pointsNeeded } : c))
    );

    const voucherCode = 'REWARD-' + Math.floor(100000 + Math.random() * 900000);
    const newRedemption: LoyaltyRedemption = {
      id: 'red_' + Date.now(),
      clientId,
      rewardTitle,
      points: pointsNeeded,
      code: voucherCode,
      date: formatISO(getFixedToday()),
    };

    setRedemptions((prev) => [newRedemption, ...prev]);
    showToast(`Redeemed "${rewardTitle}"! Voucher code: ${voucherCode}`, 'success');
    return voucherCode;
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Shop settings saved', 'success');
  };

  const resetToDemoData = () => {
    setClients(INITIAL_CLIENTS);
    setServices(INITIAL_SERVICES);
    setPackages(INITIAL_PACKAGES);
    setStaff(INITIAL_STAFF);
    setAppointments(INITIAL_APPOINTMENTS);
    setInventory(INITIAL_INVENTORY);
    setGiftCards(INITIAL_GIFTCARDS);
    setExpenses(INITIAL_EXPENSES);
    setWaitlist(INITIAL_WAITLIST);
    setTransformations(INITIAL_TRANSFORMATIONS);
    setRedemptions([]);
    setSettings(INITIAL_SETTINGS);
    
    // Clear storage keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    });

    showToast('Reset to original PawBook Pro demo dataset!', 'info');
  };

  const exportDataJSON = () => {
    const fullData = {
      clients,
      services,
      packages,
      staff,
      appointments,
      inventory,
      giftCards,
      expenses,
      waitlist,
      transformations,
      redemptions,
      settings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(fullData, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.clients && parsed.services && parsed.appointments) {
        setClients(parsed.clients);
        setServices(parsed.services);
        if (parsed.packages) setPackages(parsed.packages);
        if (parsed.staff) setStaff(parsed.staff);
        setAppointments(parsed.appointments);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.giftCards) setGiftCards(parsed.giftCards);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.waitlist) setWaitlist(parsed.waitlist);
        if (parsed.transformations) setTransformations(parsed.transformations);
        if (parsed.redemptions) setRedemptions(parsed.redemptions);
        if (parsed.settings) setSettings(parsed.settings);
        showToast('Successfully imported database!', 'success');
        return true;
      }
      showToast('Invalid data file format', 'error');
      return false;
    } catch (e) {
      showToast('Failed to parse JSON file', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        calendarMode,
        setCalendarMode,
        calendarDate,
        setCalendarDate,
        selectedStaffId,
        setSelectedStaffId,
        searchQuery,
        setSearchQuery,
        clients,
        services,
        packages,
        staff,
        appointments,
        inventory,
        giftCards,
        expenses,
        waitlist,
        transformations,
        redemptions,
        settings,
        toasts,
        showToast,
        removeToast,
        activeModal,
        modalData,
        openModal,
        closeModal,
        confirmDelete,
        addAppointment,
        updateAppointmentStatus,
        updateAppointment,
        deleteAppointment,
        addClient,
        updateClient,
        deleteClient,
        addService,
        updateService,
        deleteService,
        addPackage,
        deletePackage,
        addStaff,
        updateStaff,
        deleteStaff,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addGiftCard,
        addExpense,
        deleteExpense,
        addWaitlist,
        deleteWaitlist,
        addTransformation,
        deleteTransformation,
        redeemPoints,
        updateSettings,
        resetToDemoData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
