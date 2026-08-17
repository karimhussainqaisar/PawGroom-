import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, Calendar, Phone, Mail, Award, AlertTriangle, Send, Trash2, Printer, FileText, Receipt, Scissors, ShieldAlert, Copy, Gift, Sparkles, Share2, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { openWhatsAppInvoice, generateWhatsAppInvoiceText } from '../../utils/whatsapp';

export const ModalContainer: React.FC = () => {
  const { 
    activeModal, 
    modalData, 
    closeModal, 
    clients, 
    services, 
    staff, 
    inventory, 
    addAppointment, 
    updateAppointment, 
    addClient, 
    updateClient, 
    addService, 
    updateService, 
    addPackage, 
    addStaff, 
    updateStaff, 
    addInventoryItem, 
    updateInventoryItem, 
    addGiftCard, 
    addExpense, 
    addWaitlist, 
    addTransformation, 
    redeemPoints, 
    updateAppointmentStatus,
    addVaccineRecord,
    showToast 
  } = useApp();

  if (!activeModal) return null;

  const isWideModal = activeModal === 'printScheduleModal' || activeModal === 'invoiceModal' || activeModal === 'clientHistory';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 flex items-start sm:items-center justify-center min-h-screen modal-overlay print:bg-white print:p-0 print:static print:block">
      <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-h-[88dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 relative border border-[#D8D3C4] my-auto animate-in fade-in zoom-in-95 duration-150 modal-box print:max-h-none print:shadow-none print:border-none print:max-w-none print:w-full print:m-0 print:p-0 ${
        isWideModal ? 'max-w-3xl' : 'max-w-lg'
      }`}>
        {/* Close button - Pinned at top right with clear background & high z-index */}
        <button
          onClick={closeModal}
          className="no-print absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 text-[#5C716C] hover:text-[#240C0B] rounded-xl bg-white/90 border border-[#E8E1D1] shadow-2xs hover:bg-[#F1EEE6] transition-colors cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content Body */}
        <div className="overflow-y-auto pr-1 sm:pr-2 flex-1 space-y-4 text-[#240C0B]">
          {/* Modal 1: Appointment Booking / Edit Form */}
          {activeModal === 'appointmentForm' && (
            <AppointmentFormModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 2: Appointment Detail & Quick Checkout */}
          {activeModal === 'appointmentDetail' && (
            <AppointmentDetailModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 3: Client & Pet Record Form */}
          {activeModal === 'clientForm' && (
            <ClientFormModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 4: Client Grooming History */}
          {activeModal === 'clientHistory' && (
            <ClientHistoryModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 5: Service Form */}
          {activeModal === 'serviceForm' && (
            <ServiceFormModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 6: Package Form */}
          {activeModal === 'packageForm' && (
            <PackageFormModal onClose={closeModal} />
          )}

          {/* Modal 7: Staff Form */}
          {activeModal === 'staffForm' && (
            <StaffFormModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 8: Inventory Product Form */}
          {activeModal === 'inventoryForm' && (
            <InventoryFormModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 9: Gift Card Form */}
          {activeModal === 'giftCardForm' && (
            <GiftCardFormModal onClose={closeModal} />
          )}

          {/* Modal 10: Expense Form */}
          {activeModal === 'expenseForm' && (
            <ExpenseFormModal onClose={closeModal} />
          )}

          {/* Modal 11: Waitlist Form */}
          {activeModal === 'waitlistForm' && (
            <WaitlistFormModal onClose={closeModal} />
          )}

          {/* Modal 12: Transformation Gallery Form */}
          {activeModal === 'transformationForm' && (
            <TransformationFormModal onClose={closeModal} />
          )}

          {/* Modal 13: Redeem Points Modal */}
          {activeModal === 'redeemModal' && (
            <RedeemModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 14: Send Reminder Modal */}
          {activeModal === 'reminderModal' && (
            <ReminderModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 15: Generic Confirmation Modal */}
          {activeModal === 'confirmModal' && (
            <ConfirmModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 16: Print Daily Schedule Modal */}
          {activeModal === 'printScheduleModal' && (
            <PrintScheduleModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 17: Official Invoice / Receipt Modal */}
          {activeModal === 'invoiceModal' && (
            <InvoiceModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 18: Vaccination Schedule Form Modal */}
          {activeModal === 'vaccineScheduleForm' && (
            <VaccineScheduleFormModal data={modalData} onClose={closeModal} />
          )}
        </div>
      </div>
    </div>
  );
};

/* --- Sub-Components for Modals --- */

// 1. Appointment Form Modal
const AppointmentFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { clients, services, packages, staff, settings, addAppointment, updateAppointment, formatPrice } = useApp();

  const getTodayISO = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const appt = data?.appointment;
  const initialPkgId = data?.packageId || appt?.packageId;
  const initialPkg = initialPkgId ? packages.find(p => p.id === initialPkgId) : null;

  const [bookingType, setBookingType] = useState<'service' | 'package'>(initialPkg ? 'package' : 'service');
  const [clientId, setClientId] = useState(data?.clientId || appt?.clientId || clients[0]?.id || '');
  const [serviceId, setServiceId] = useState(data?.serviceId || appt?.serviceId || services[0]?.id || '');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPkg ? initialPkg.id : packages[0]?.id || '');
  const [staffId, setStaffId] = useState(data?.staffId || appt?.staffId || staff[0]?.id || '');
  const [date, setDate] = useState(data?.date || appt?.date || getTodayISO());
  const [start, setStart] = useState(data?.start || appt?.start || '10:00');
  const [retail, setRetail] = useState(appt?.retail || 0);
  const [notes, setNotes] = useState(data?.notes || appt?.notes || '');

  const selectedSvc = services.find((s) => s.id === serviceId);
  const selectedPkg = packages.find((p) => p.id === selectedPackageId);

  const openHour = settings?.open ?? 8;
  const closeHour = settings?.close ?? 18;
  const slotMins = settings?.slot ?? 30;

  const timeSlots = React.useMemo(() => {
    const slots: string[] = [];
    for (let h = openHour; h < closeHour; h++) {
      const hStr = h < 10 ? `0${h}` : `${h}`;
      slots.push(`${hStr}:00`);
      if (slotMins === 30) {
        slots.push(`${hStr}:30`);
      }
    }
    return slots.length ? slots : ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  }, [openHour, closeHour, slotMins]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (bookingType === 'package' && selectedPkg) {
      // Find main service or fallback
      const primarySvcId = selectedPkg.serviceIds[0] || services[0]?.id || 'sv1';
      
      if (appt) {
        updateAppointment(appt.id, {
          clientId,
          serviceId: primarySvcId,
          packageId: selectedPkg.id,
          packageName: selectedPkg.name,
          staffId,
          date,
          start,
          duration: selectedPkg.duration,
          price: selectedPkg.price,
          retail,
          notes: notes ? notes : `Spa Package: ${selectedPkg.name}`,
        });
      } else {
        addAppointment({
          clientId,
          serviceId: primarySvcId,
          packageId: selectedPkg.id,
          packageName: selectedPkg.name,
          staffId,
          date,
          start,
          duration: selectedPkg.duration,
          price: selectedPkg.price,
          status: 'booked',
          retail,
          notes: notes ? notes : `Spa Package: ${selectedPkg.name}`,
        });
      }
      onClose();
      return;
    }

    if (!selectedSvc) return;

    if (appt) {
      updateAppointment(appt.id, {
        clientId,
        serviceId,
        packageId: undefined,
        packageName: undefined,
        staffId,
        date,
        start,
        duration: selectedSvc.duration,
        price: selectedSvc.price,
        retail,
        notes,
      });
    } else {
      addAppointment({
        clientId,
        serviceId,
        staffId,
        date,
        start,
        duration: selectedSvc.duration,
        price: selectedSvc.price,
        status: 'booked',
        retail,
        notes,
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Book Grooming Appointment</h3>

      {/* Booking Type Toggle: Single Service vs Spa Package */}
      <div className="flex items-center bg-[#EAE7DC] p-1 rounded-xl gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setBookingType('service')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
            bookingType === 'service' ? 'bg-[#173E39] text-white shadow-2xs' : 'text-[#5C716C]'
          }`}
        >
          Single Service
        </button>
        <button
          type="button"
          onClick={() => setBookingType('package')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
            bookingType === 'package' ? 'bg-[#173E39] text-white shadow-2xs' : 'text-[#5C716C]'
          }`}
        >
          ✨ Spa Package Bundle ({packages.length})
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-[#173E39]">Select Dog / Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full mt-1 p-2 border rounded-xl bg-white outline-none"
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.breed}) — Owner: {c.owner}
              </option>
            ))}
          </select>
        </div>

        {bookingType === 'service' ? (
          <div>
            <label className="font-bold text-[#173E39]">Grooming Service</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full mt-1 p-2 border rounded-xl bg-white outline-none"
              required
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatPrice(s.price)} • {s.duration}m)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="font-bold text-[#173E39]">Select Spa Package</label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="w-full mt-1 p-2 border rounded-xl bg-white font-bold text-[#173E39] outline-none"
              required
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — {formatPrice(pkg.price)} ({pkg.duration} mins)
                </option>
              ))}
            </select>
            {selectedPkg && (
              <p className="mt-1 text-[11px] text-[#5C716C]">
                Includes: {selectedPkg.serviceIds.map(sid => services.find(s => s.id === sid)?.name).filter(Boolean).join(' + ')}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="font-bold text-[#173E39]">Assigned Stylist</label>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full mt-1 p-2 border rounded-xl bg-white outline-none"
            required
          >
            {staff.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.role})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-[#173E39]">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 p-2 border rounded-xl bg-white outline-none"
              required
            />
          </div>
          <div>
            <label className="font-bold text-[#173E39]">Time Slot</label>
            <select
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full mt-1 p-2 border rounded-xl bg-white outline-none"
            >
              {timeSlots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="font-bold text-[#173E39]">Groomer Cut / Style Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., #4 body, scissored teddy head..."
            className="w-full mt-1 p-2 border rounded-xl h-16 bg-white outline-none"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl cursor-pointer">
          Cancel
        </button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold cursor-pointer shadow-md">
          Confirm Booking
        </button>
      </div>
    </form>
  );
};

// 2. Appointment Detail & Checkout Modal
const AppointmentDetailModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { 
    clients, 
    services, 
    packages,
    staff, 
    inventory, 
    redemptions,
    settings,
    createPromoCode,
    applyVoucherCode,
    markVoucherAsUsed,
    updateAppointmentStatus, 
    updateAppointment,
    deleteAppointment, 
    confirmDelete, 
    showToast, 
    openModal,
    formatPrice 
  } = useApp();
  
  const appt = data?.appointment;
  if (!appt) return null;

  const client = clients.find((c) => c.id === appt.clientId);
  const service = services.find((s) => s.id === appt.serviceId);
  const groomer = staff.find((st) => st.id === appt.staffId);

  // Look up spa package if selected
  const pkg = appt.packageId 
    ? packages.find((p) => p.id === appt.packageId)
    : (appt.packageName ? packages.find(p => p.name.toLowerCase() === appt.packageName?.toLowerCase()) : null);

  const [retailAddon, setRetailAddon] = useState(appt.retail || 0);

  // Filter promo codes strictly for THIS specific client or dog
  const clientPromoCodes = useMemo(() => {
    if (!appt.clientId) return [];
    return redemptions.filter((r) => r.clientId === appt.clientId && r.status !== 'used');
  }, [redemptions, appt.clientId]);

  // Find initial applied promo code for this dog/client
  const defaultPromo = useMemo(() => {
    if (appt.discountCode) {
      return clientPromoCodes.find((r) => r.code === appt.discountCode) || null;
    }
    return clientPromoCodes.find((r) => r.status === 'applied' || r.isAutoApplied) || null;
  }, [clientPromoCodes, appt.discountCode]);

  const [selectedPromoCode, setSelectedPromoCode] = useState<string>(defaultPromo ? defaultPromo.code : '');
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [newPromoTitle, setNewPromoTitle] = useState('15% Off VIP Session');
  const [newPromoType, setNewPromoType] = useState<'percent' | 'fixed'>('percent');
  const [newPromoVal, setNewPromoVal] = useState<number>(15);

  const servicePrice = pkg ? pkg.price : (service?.price || appt.price || 0);
  const grossSubtotal = servicePrice + retailAddon;

  // Selected promo calculation
  const activeVoucher = clientPromoCodes.find((r) => r.code === selectedPromoCode);
  let discountAmount = 0;
  let discountTitle = '';

  if (activeVoucher) {
    discountTitle = activeVoucher.rewardTitle;
    if (activeVoucher.discountType === 'percent') {
      discountAmount = Math.round(grossSubtotal * (activeVoucher.discountValue / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(grossSubtotal, activeVoucher.discountValue);
    }
  }

  const taxableSubtotal = Math.max(0, grossSubtotal - discountAmount);
  const taxRate = settings.taxRate !== undefined ? settings.taxRate : 8.5;
  const taxAmount = Math.round(taxableSubtotal * (taxRate / 100) * 100) / 100;
  const finalTotal = taxableSubtotal + taxAmount;

  const handleQuickCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    const created = createPromoCode(
      client.id,
      newPromoTitle,
      newPromoType,
      newPromoVal,
      0,
      true // set to applied in checkout
    );
    if (created) {
      setSelectedPromoCode(created.code);
      setShowCreatePromo(false);
    }
  };

  const handleComplete = () => {
    // Save invoice and discount details to appointment
    updateAppointment(appt.id, {
      retail: retailAddon,
      discountAmount,
      discountCode: activeVoucher ? activeVoucher.code : undefined,
      discountTitle: activeVoucher ? activeVoucher.rewardTitle : undefined,
      taxRate,
      taxAmount,
      totalAmount: finalTotal,
      packageId: pkg?.id || appt.packageId,
      packageName: pkg?.name || appt.packageName,
    });

    if (activeVoucher) {
      markVoucherAsUsed(activeVoucher.code, appt.id);
    }

    updateAppointmentStatus(appt.id, 'completed', retailAddon);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    showToast(
      `Appointment completed! Total: ${formatPrice(finalTotal)} (Tax: ${taxRate}%${discountAmount > 0 ? `, Promo: -${formatPrice(discountAmount)}` : ''})`,
      'success'
    );
    onClose();
  };

  const handleShareWhatsApp = () => {
    if (!client) return;
    const invoiceNum = `INV-${appt.date.replace(/-/g, '')}-${appt.id.replace(/\D/g, '') || '101'}`;
    const ok = openWhatsAppInvoice({
      invoiceNum,
      client,
      appointment: { ...appt, retail: retailAddon },
      clinicSettings: settings,
      serviceName: service?.name,
      packageName: pkg?.name || appt.packageName,
      groomerName: groomer?.name,
      servicePrice,
      retailAddon,
      discountAmount,
      discountCode: activeVoucher ? activeVoucher.code : undefined,
      discountTitle: activeVoucher ? activeVoucher.rewardTitle : undefined,
      taxRate,
      tax: taxAmount,
      total: finalTotal,
      pointsEarned: Math.floor(finalTotal),
      isPaid: appt.status === 'completed'
    });
    if (ok) {
      showToast(`Redirecting to WhatsApp for ${client.owner}...`, 'success');
    }
  };

  const handleDelete = () => {
    confirmDelete({
      title: 'Cancel Appointment',
      message: `Are you sure you want to cancel and delete the appointment for ${client?.name || 'this pet'} on ${appt.date} at ${appt.start}?`,
      confirmLabel: 'Cancel & Delete',
      onConfirm: () => {
        deleteAppointment(appt.id);
        onClose();
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="font-display font-bold text-xl text-[#173E39]">
            Grooming Session & Checkout
          </h3>
          <p className="text-[11px] text-[#5C716C]">
            Review service, client-specific promo codes, and US tax calculation
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-[#E1ECF0] text-[#3A6B7C]">
          {appt.status}
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#FAF8F5] p-3 rounded-2xl border border-[#D8D3C4]">
          <div>
            <span className="font-bold text-[#173E39]">Pet: </span>
            <span className="text-[#2E8A81] font-bold text-sm">{client?.name} ({client?.breed})</span>
          </div>
          <div>
            <span className="font-bold text-[#173E39]">Owner: </span>
            <span>{client?.owner} • {client?.phone}</span>
          </div>
          <div>
            <span className="font-bold text-[#173E39]">Service / Package: </span>
            {pkg ? (
              <span className="font-bold text-[#FF6B00]">✨ {pkg.name} ({formatPrice(pkg.price)})</span>
            ) : (
              <span className="font-semibold text-[#173E39]">{service?.name} ({formatPrice(service?.price || appt.price)})</span>
            )}
          </div>
          <div>
            <span className="font-bold text-[#173E39]">Stylist: </span>
            <span>{groomer?.name || 'Assigned Stylist'}</span>
          </div>
          <div>
            <span className="font-bold text-[#173E39]">Date & Time: </span>
            <span>{appt.date} @ {appt.start}</span>
          </div>
          <div>
            <span className="font-bold text-[#173E39]">Client Points: </span>
            <span className="font-bold text-[#FF6B00]">{client?.points || 0} pts</span>
          </div>
        </div>

        {pkg && (
          <div className="p-2.5 rounded-xl bg-[#FFF8E7] border border-[#FFE7B3] text-[11px] text-[#331D00]">
            <span className="font-bold block text-[#FF6B00]">✨ Luxury Spa Package Bundle:</span>
            <span>Includes: {pkg.serviceIds.map(sid => services.find(s => s.id === sid)?.name).filter(Boolean).join(' + ')}</span>
          </div>
        )}

        {client?.sensitivities && (
          <div className="bg-[#FEF2F2] p-2 rounded-xl text-[#991B1B] font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Sensitivity Alert: {client.sensitivities}</span>
          </div>
        )}

        {/* Add-on Retail Sales */}
        <div className="pt-2 border-t">
          <label className="font-bold text-[#173E39] block mb-1">Add-on Retail Products ($)</label>
          <select
            value={retailAddon}
            onChange={(e) => setRetailAddon(parseFloat(e.target.value))}
            className="w-full p-2 border border-[#D8D3C4] rounded-xl bg-white outline-none focus:border-[#2E8A81]"
          >
            <option value={0}>None ($0.00)</option>
            {inventory.map((i) => (
              <option key={i.id} value={i.price}>
                {i.name} (+${i.price.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {/* Dog/Client Specific Promo Codes & Discounts */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#2E8A81]/40 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-[#173E39]">
              <Gift className="w-4 h-4 text-[#FF6B00]" />
              <span>Promo Code for {client?.name || 'Client'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCreatePromo(!showCreatePromo)}
              className="text-[11px] font-extrabold text-[#2E8A81] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#FF6B00]" />
              {showCreatePromo ? 'Close Form' : `+ Create Promo for ${client?.name || 'Pet'}`}
            </button>
          </div>

          {showCreatePromo && (
            <form onSubmit={handleQuickCreatePromo} className="p-3 bg-[#FAF8F5] border border-[#E7C0B5] rounded-xl space-y-2">
              <div className="font-bold text-xs text-[#240C0B]">
                Issue Promo Code for {client?.name} (Auto-Applied to Checkout)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-[#7A6865]">Discount Type</label>
                  <select
                    value={newPromoType}
                    onChange={(e) => setNewPromoType(e.target.value as 'percent' | 'fixed')}
                    className="w-full mt-0.5 p-1.5 border border-[#D8D3C4] rounded-lg bg-white font-bold"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-[#7A6865]">Value ({newPromoType === 'percent' ? '%' : '$'})</label>
                  <input
                    type="number"
                    min="1"
                    max={newPromoType === 'percent' ? 100 : 500}
                    value={newPromoVal}
                    onChange={(e) => setNewPromoVal(parseFloat(e.target.value) || 0)}
                    className="w-full mt-0.5 p-1.5 border border-[#D8D3C4] rounded-lg bg-white font-bold text-center"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-[#7A6865]">Promo Description</label>
                  <input
                    type="text"
                    value={newPromoTitle}
                    onChange={(e) => setNewPromoTitle(e.target.value)}
                    className="w-full mt-0.5 p-1.5 border border-[#D8D3C4] rounded-lg bg-white text-xs"
                    placeholder="e.g. VIP Promo"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#2E8A81] font-bold">
                  ✓ Automatically set to APPLIED in this checkout
                </span>
                <button type="submit" className="btn-primary text-xs px-3 py-1 rounded-lg font-bold">
                  Create & Apply
                </button>
              </div>
            </form>
          )}

          {/* List/Select Promo Codes Specific to this Client */}
          {clientPromoCodes.length === 0 ? (
            <div className="text-[11px] text-[#7A6865] bg-[#FAF8F5] p-2.5 rounded-xl border border-dashed border-[#D8D3C4]">
              No active promo codes issued for {client?.name}. Click "+ Create Promo" above to generate a client-specific code.
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#7A6865]">
                Available Promo Codes for {client?.name} (Only specific to this pet/client):
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                <div
                  onClick={() => setSelectedPromoCode('')}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    !selectedPromoCode 
                      ? 'bg-[#FAF8F5] border-[#240C0B] font-bold text-[#240C0B]' 
                      : 'bg-white border-[#D8D3C4] text-[#7A6865] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>No promo code applied</span>
                  {!selectedPromoCode && <Check className="w-3.5 h-3.5 text-[#240C0B]" />}
                </div>

                {clientPromoCodes.map((promo) => {
                  const isSelected = selectedPromoCode === promo.code;
                  return (
                    <div
                      key={promo.id}
                      onClick={() => setSelectedPromoCode(promo.code)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#ECFDF5] border-[#10B981] ring-1 ring-[#10B981] text-[#065F46] font-bold shadow-xs'
                          : 'bg-white border-[#D8D3C4] text-[#173E39] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs bg-white px-2 py-0.5 rounded-md border border-[#D8D3C4]">
                          {promo.code}
                        </span>
                        <div>
                          <div className="font-bold text-xs">{promo.rewardTitle}</div>
                          <div className="text-[10px] text-[#5C716C]">
                            {promo.discountType === 'percent' ? `${promo.discountValue}% Off Invoice` : `$${promo.discountValue} Off`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {promo.status === 'applied' && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#FF6B00] text-white rounded-full">
                            Applied
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-[#10B981]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Real-Time Checkout Invoice Calculation Breakdown */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D8D3C4] space-y-1.5 text-xs">
          <div className="font-display font-bold text-xs text-[#173E39] border-b border-[#D8D3C4]/60 pb-1 flex justify-between">
            <span>Invoice Breakdown</span>
            <span className="text-[10px] text-[#7A6865] font-normal">US Tax Setting: {taxRate}%</span>
          </div>

          <div className="flex justify-between text-[#5C716C]">
            <span>{pkg ? `Spa Package (${pkg.name}):` : `Grooming Service (${service?.name || 'Service'}):`}</span>
            <span className="font-bold text-[#173E39]">{formatPrice(servicePrice)}</span>
          </div>

          {retailAddon > 0 && (
            <div className="flex justify-between text-[#5C716C]">
              <span>Retail Add-ons:</span>
              <span className="font-bold text-[#173E39]">+{formatPrice(retailAddon)}</span>
            </div>
          )}

          <div className="flex justify-between text-[#5C716C] pt-0.5 border-t border-[#D8D3C4]/40">
            <span>Gross Subtotal:</span>
            <span className="font-bold text-[#173E39]">{formatPrice(grossSubtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-[#059669] font-bold">
              <span className="flex items-center gap-1">
                <Gift className="w-3 h-3" />
                Promo Discount ({activeVoucher?.code || 'Promo'} - {activeVoucher?.discountType === 'percent' ? `${activeVoucher.discountValue}%` : `$${activeVoucher?.discountValue}`}):
              </span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-[#5C716C]">
            <span>Taxable Subtotal:</span>
            <span className="font-bold text-[#173E39]">{formatPrice(taxableSubtotal)}</span>
          </div>

          <div className="flex justify-between text-[#5C716C]">
            <span>US Sales Tax ({taxRate}%):</span>
            <span className="font-bold text-[#FF6B00]">+{formatPrice(taxAmount)}</span>
          </div>

          <div className="flex justify-between items-center text-sm font-display font-extrabold text-[#240C0B] pt-1.5 border-t-2 border-[#240C0B]">
            <span>Total Payable:</span>
            <span className="text-base text-[#FF6B00]">{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-[#5C716C] hover:text-[#C9503A] rounded-xl hover:bg-[#FEF2F2] transition-colors flex items-center gap-1 text-xs font-bold"
            title="Delete Appointment"
          >
            <Trash2 className="w-4 h-4" /> Cancel/Delete
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Share on WhatsApp Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Share receipt directly to client on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              openModal('invoiceModal', { 
                appointment: {
                  ...appt,
                  retail: retailAddon,
                  discountAmount,
                  discountCode: activeVoucher ? activeVoucher.code : undefined,
                  discountTitle: activeVoucher ? activeVoucher.rewardTitle : undefined,
                  taxRate,
                  taxAmount,
                  totalAmount: finalTotal,
                  packageId: pkg?.id || appt.packageId,
                  packageName: pkg?.name || appt.packageName,
                }, 
                retailAddon,
                discountAmount,
                discountCode: activeVoucher ? activeVoucher.code : undefined,
                discountTitle: activeVoucher ? activeVoucher.rewardTitle : undefined,
                packageId: pkg?.id || appt.packageId,
                packageName: pkg?.name || appt.packageName,
              });
            }}
            className="btn-ghost text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 hover:bg-[#EAE7DC] text-[#173E39] cursor-pointer"
            title="Print Client Invoice / Receipt"
          >
            <Printer className="w-4 h-4 text-[#2E8A81]" />
            <span>Print Invoice</span>
          </button>

          {appt.status !== 'completed' && (
            <button
              onClick={handleComplete}
              className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" /> Complete & Checkout ({formatPrice(finalTotal)})
            </button>
          )}
          <button onClick={onClose} className="btn-ghost text-xs px-3 py-2 rounded-xl cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Client & Pet Form Modal
const ClientFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { addClient, updateClient } = useApp();
  const existing = data?.client;

  const [name, setName] = useState(existing?.name || '');
  const [owner, setOwner] = useState(existing?.owner || '');
  const [phone, setPhone] = useState(existing?.phone || '555-0188');
  const [email, setEmail] = useState(existing?.email || 'client@mail.com');
  const [breed, setBreed] = useState(existing?.breed || 'Golden Retriever');
  const [size, setSize] = useState(existing?.size || 'medium');
  const [coat, setCoat] = useState(existing?.coat || 'Dense coat');
  const [freqWeeks, setFreqWeeks] = useState(existing?.freqWeeks || 6);
  const [rabiesExpiry, setRabiesExpiry] = useState(existing?.rabiesExpiry || '2027-01-15');
  const [lastCut, setLastCut] = useState(existing?.lastCut || '');
  const [sensitivities, setSensitivities] = useState(
    Array.isArray(existing?.sensitivities) 
      ? existing.sensitivities.join(', ') 
      : existing?.sensitivities || ''
  );
  const [allergies, setAllergies] = useState(existing?.allergies || '');
  const [careNotes, setCareNotes] = useState(existing?.careNotes || '');
  const [medicalNotes, setMedicalNotes] = useState(existing?.medicalNotes || '');
  const [behaviorNotesStr, setBehaviorNotesStr] = useState(
    Array.isArray(existing?.behaviorNotes)
      ? existing.behaviorNotes.join(', ')
      : existing?.behaviorNotes || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBehaviorNotes = behaviorNotesStr
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const clientPayload = {
      name,
      owner,
      phone,
      email,
      breed,
      size,
      coat,
      freqWeeks,
      rabiesExpiry,
      lastCut,
      sensitivities,
      allergies,
      careNotes,
      medicalNotes,
      behaviorNotes: parsedBehaviorNotes,
    };

    if (existing) {
      updateClient(existing.id, clientPayload);
    } else {
      addClient({
        ...clientPayload,
        staffId: 'st1',
        fav: 'sv1',
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">
        {existing ? 'Edit Pet Record' : 'Add New Client & Pet'}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Dog Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Owner Name</label>
          <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Phone</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Dog Breed</label>
          <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value as any)} className="w-full mt-1 p-2 border rounded-xl">
            <option value="toy">Toy (&lt;10 lbs)</option>
            <option value="small">Small (10-25 lbs)</option>
            <option value="medium">Medium (25-50 lbs)</option>
            <option value="large">Large (50-80 lbs)</option>
            <option value="giant">Giant (80+ lbs)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Cycle Frequency (Weeks)</label>
          <input type="number" value={freqWeeks} onChange={(e) => setFreqWeeks(parseInt(e.target.value))} className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Rabies Expiry Date</label>
          <input type="date" value={rabiesExpiry} onChange={(e) => setRabiesExpiry(e.target.value)} className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>

      <div>
        <label className="font-bold text-[#173E39]">Coat & Blade Cut Notes</label>
        <input type="text" value={lastCut} onChange={(e) => setLastCut(e.target.value)} placeholder="e.g. #4 body, teddy head" className="w-full mt-1 p-2 border rounded-xl" />
      </div>

      {/* Special Care & Sensitivities */}
      <div className="bg-[#FFF3EB] border border-[#FFD0B3] p-3 rounded-2xl space-y-2.5">
        <div className="font-bold text-[#541900] flex items-center gap-1.5">
          <span>🛡️ Pet Care, Sensitivities & Medical</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="font-bold text-[#541900] text-[11px]">Sensitivities (e.g. paws, ears)</label>
            <input 
              type="text" 
              value={sensitivities} 
              onChange={(e) => setSensitivities(e.target.value)} 
              placeholder="e.g. Sensitive paws, tail" 
              className="w-full mt-0.5 p-2 bg-white border border-[#FFD0B3] rounded-xl outline-none" 
            />
          </div>
          <div>
            <label className="font-bold text-[#541900] text-[11px]">Allergies (shampoos, scents)</label>
            <input 
              type="text" 
              value={allergies} 
              onChange={(e) => setAllergies(e.target.value)} 
              placeholder="e.g. Lavender shampoo allergy" 
              className="w-full mt-0.5 p-2 bg-white border border-[#FFD0B3] rounded-xl outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="font-bold text-[#541900] text-[11px]">Care Instructions</label>
            <input 
              type="text" 
              value={careNotes} 
              onChange={(e) => setCareNotes(e.target.value)} 
              placeholder="e.g. Low heat dryer only" 
              className="w-full mt-0.5 p-2 bg-white border border-[#FFD0B3] rounded-xl outline-none" 
            />
          </div>
          <div>
            <label className="font-bold text-[#541900] text-[11px]">Medical Notes</label>
            <input 
              type="text" 
              value={medicalNotes} 
              onChange={(e) => setMedicalNotes(e.target.value)} 
              placeholder="e.g. Hip dysplasia, gentle handling" 
              className="w-full mt-0.5 p-2 bg-white border border-[#FFD0B3] rounded-xl outline-none" 
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[#541900] text-[11px]">Behavioral Warnings (comma separated)</label>
          <input 
            type="text" 
            value={behaviorNotesStr} 
            onChange={(e) => setBehaviorNotesStr(e.target.value)} 
            placeholder="e.g. Table anxious, hates ear cleaning" 
            className="w-full mt-0.5 p-2 bg-white border border-[#FFD0B3] rounded-xl outline-none" 
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Save Pet Record</button>
      </div>
    </form>
  );
};

// 4. Client Grooming History Modal
const ClientHistoryModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { appointments, services, staff, settings, openModal } = useApp();
  const client = data?.client;
  if (!client) return null;

  const history = appointments.filter((a) => a.clientId === client.id && a.status === 'completed');
  const vaxList = client.vaccinationSchedule || [];

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-[#E8E1D1] pb-2">
        <div>
          <h3 className="font-display font-bold text-xl text-[#240C0B]">
            Medical & Grooming Record — {client.name}
          </h3>
          <p className="text-[11px] text-[#A08E8B]">
            Owner: <strong className="text-[#240C0B]">{client.owner}</strong> • Shop: {settings.salonName || 'PawBook Studio'} ({settings.name || 'Owner'})
          </p>
        </div>
        <button
          onClick={() => openModal('vaccineScheduleForm', { clientId: client.id })}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>+ Schedule Vaccine</span>
        </button>
      </div>

      {/* Vaccination Schedule Section */}
      <div className="bg-[#FFF8E7] border border-[#FFE7B3] p-3 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#240C0B] flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-[#FF6B00]" />
            <span>Vaccination Schedule & Immunizations</span>
          </span>
          <span className="text-[10px] text-[#A08E8B]">
            Rabies Expiry: <strong className="text-[#240C0B]">{client.rabiesExpiry}</strong>
          </span>
        </div>

        {vaxList.length === 0 ? (
          <p className="text-[#A08E8B] text-[11px] italic">No specific vaccine records attached yet.</p>
        ) : (
          <div className="space-y-1.5 pt-1">
            {vaxList.map((v: any) => (
              <div key={v.id} className="bg-white/80 p-2 rounded-xl border border-[#FFE7B3] flex justify-between items-center text-[11px]">
                <div>
                  <div className="font-bold text-[#240C0B]">{v.vaccineName}</div>
                  <div className="text-[#A08E8B]">Administered: {v.dateAdministered || 'N/A'} • Vet: {v.veterinarian || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#FF6B00]">Due: {v.nextDueDate}</div>
                  {v.batchNo && <div className="text-[10px] text-[#A08E8B]">Lot #{v.batchNo}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grooming Sessions */}
      <div>
        <h4 className="font-bold text-[#240C0B] mb-2 text-sm">Grooming History ({history.length})</h4>
        {history.length === 0 ? (
          <p className="text-[#5C716C]">No prior completed grooming sessions recorded for this pet.</p>
        ) : (
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-[#D8D3C4]">
            {history.map((a) => {
              const svc = services.find((s) => s.id === a.serviceId);
              const st = staff.find((s) => s.id === a.staffId);
              return (
                <div key={a.id} className="pt-2.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#240C0B]">
                      <span>{a.date} @ {a.start}</span>
                      <span className="text-[#FF6B00]">${a.price + (a.retail || 0)}</span>
                    </div>
                    <div className="text-[#5C716C] mt-0.5">{svc?.name} • Stylist: {st?.name}</div>
                    {a.notes && <div className="text-[#5C716C] italic mt-0.5">"{a.notes}"</div>}
                  </div>

                  <button
                    onClick={() => openModal('invoiceModal', { appointment: a })}
                    className="btn-ghost text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold text-[#240C0B] shrink-0 hover:bg-[#EAE7DC]"
                    title="Print Invoice"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#FF6B00]" /> Invoice
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Close</button>
      </div>
    </div>
  );
};

// 5. Service Form Modal
const ServiceFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { addService, updateService, staff } = useApp();
  const existing = data?.service;

  const [name, setName] = useState(existing?.name || '');
  const [category, setCategory] = useState(existing?.category || 'fullgroom');
  const [duration, setDuration] = useState(existing?.duration || 60);
  const [price, setPrice] = useState(existing?.price || 50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      updateService(existing.id, { name, category, duration, price });
    } else {
      addService({ name, category, duration, price, buffer: 15, staffIds: staff.map((s) => s.id) });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">{existing ? 'Edit Service' : 'Add New Service'}</h3>
      <div>
        <label className="font-bold text-[#173E39]">Service Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Price ($)</label>
          <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Duration (mins)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Save Service</button>
      </div>
    </form>
  );
};

// 6. Package Form Modal
const PackageFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addPackage, services } = useApp();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPackage({ name, serviceIds: [services[0]?.id || 'sv1'], price, duration: 120 });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Create Spa Package</h3>
      <div>
        <label className="font-bold text-[#173E39]">Package Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. The Deluxe Spa Bundle" className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Package Price ($)</label>
        <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Save Package</button>
      </div>
    </form>
  );
};

// 7. Staff Form Modal
const StaffFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { addStaff, updateStaff, services } = useApp();
  const existing = data?.staff;

  const [name, setName] = useState(existing?.name || '');
  const [role, setRole] = useState(existing?.role || 'Senior Stylist');
  const [commission, setCommission] = useState(existing?.commission ?? 45);
  const [salary, setSalary] = useState(existing?.salary ?? 0);
  const [color, setColor] = useState(existing?.color || '#2E8A81');
  const [selectedServices, setSelectedServices] = useState<string[]>(
    existing?.services || services.map((s) => s.id)
  );

  const defaultAvail: Record<number, [number, number] | null> = {
    1: [8, 17],
    2: [8, 17],
    3: [8, 17],
    4: [8, 18],
    5: [8, 17],
    6: [9, 15],
    0: null,
  };

  const [avail, setAvail] = useState<Record<number, [number, number] | null>>(
    existing?.avail ? { ...existing.avail } : defaultAvail
  );

  const colorSwatches = [
    '#2E8A81', // Teal
    '#E8734A', // Coral
    '#8B6D9C', // Purple
    '#5E90A8', // Slate Blue
    '#D97706', // Amber
    '#059669', // Emerald
    '#D946EF', // Fuchsia
  ];

  const daysList = [
    { idx: 1, label: 'Mon' },
    { idx: 2, label: 'Tue' },
    { idx: 3, label: 'Wed' },
    { idx: 4, label: 'Thu' },
    { idx: 5, label: 'Fri' },
    { idx: 6, label: 'Sat' },
    { idx: 0, label: 'Sun' },
  ];

  const handleDayToggle = (idx: number) => {
    setAvail((prev) => {
      const copy = { ...prev };
      if (copy[idx]) {
        copy[idx] = null;
      } else {
        copy[idx] = [8, 17];
      }
      return copy;
    });
  };

  const handleHourChange = (idx: number, startOrEnd: 'start' | 'end', val: number) => {
    setAvail((prev) => {
      const copy = { ...prev };
      const current = copy[idx] || [8, 17];
      if (startOrEnd === 'start') {
        copy[idx] = [val, current[1]];
      } else {
        copy[idx] = [current[0], val];
      }
      return copy;
    });
  };

  const handleServiceToggle = (svcId: string) => {
    setSelectedServices((prev) =>
      prev.includes(svcId) ? prev.filter((id) => id !== svcId) : [...prev, svcId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      updateStaff(existing.id, {
        name,
        role,
        commission,
        salary,
        color,
        services: selectedServices,
        avail,
      });
    } else {
      addStaff({
        name,
        role,
        commission,
        salary,
        color,
        services: selectedServices,
        avail,
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[85vh] overflow-y-auto pr-1">
      <h3 className="font-display font-bold text-xl text-[#173E39] border-b pb-2">
        {existing ? 'Edit Groomer Profile' : 'Add Groomer Stylist'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Groomer Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
            placeholder="e.g. Alex Morgan"
          />
        </div>

        <div>
          <label className="font-bold text-[#173E39]">Role / Title</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
            placeholder="e.g. Lead Groomer & Bather"
          />
        </div>

        <div>
          <label className="font-bold text-[#173E39]">Commission Rate (%)</label>
          <input
            type="number"
            value={commission}
            onChange={(e) => setCommission(parseInt(e.target.value) || 0)}
            required
            min={0}
            max={100}
            className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-[#173E39]">Base Monthly Salary ($)</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
            min={0}
            className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
          />
        </div>
      </div>

      {/* Theme Avatar Color */}
      <div>
        <label className="font-bold text-[#173E39] block mb-1">Groomer Theme Color</label>
        <div className="flex items-center gap-2">
          {colorSwatches.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-xl transition-all border-2 ${
                color === c ? 'border-[#173E39] scale-110 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Qualified Services Selection */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-bold text-[#173E39]">Qualified Services ({selectedServices.length}/{services.length})</label>
          <button
            type="button"
            onClick={() => {
              if (selectedServices.length === services.length) {
                setSelectedServices([]);
              } else {
                setSelectedServices(services.map((s) => s.id));
              }
            }}
            className="text-[11px] font-bold text-[#2E8A81] hover:underline"
          >
            {selectedServices.length === services.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#F1EEE6]/60 p-2.5 rounded-xl border border-[#D8D3C4]/60 max-h-32 overflow-y-auto">
          {services.map((s) => {
            const isChecked = selectedServices.includes(s.id);
            return (
              <label key={s.id} className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleServiceToggle(s.id)}
                  className="rounded text-[#2E8A81] focus:ring-0"
                />
                <span className="truncate">{s.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Weekly Operating Hours / Schedule */}
      <div>
        <label className="font-bold text-[#173E39] block mb-1">Weekly Groomer Schedule</label>
        <div className="space-y-1.5 bg-[#F1EEE6]/60 p-2.5 rounded-xl border border-[#D8D3C4]/60">
          {daysList.map(({ idx, label }) => {
            const daySlot = avail[idx];
            const isWorking = !!daySlot;
            return (
              <div key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                <label className="flex items-center gap-1.5 min-w-[70px] cursor-pointer font-bold text-[#173E39]">
                  <input
                    type="checkbox"
                    checked={isWorking}
                    onChange={() => handleDayToggle(idx)}
                    className="rounded text-[#2E8A81]"
                  />
                  <span>{label}</span>
                </label>

                {isWorking && daySlot ? (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={daySlot[0]}
                      onChange={(e) => handleHourChange(idx, 'start', parseInt(e.target.value))}
                      className="p-1 border border-[#D8D3C4] rounded-lg bg-white"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map((h) => (
                        <option key={h} value={h}>{h === 12 ? '12 PM' : `${h} AM`}</option>
                      ))}
                    </select>
                    <span className="text-[#5C716C]">to</span>
                    <select
                      value={daySlot[1]}
                      onChange={(e) => handleHourChange(idx, 'end', parseInt(e.target.value))}
                      className="p-1 border border-[#D8D3C4] rounded-lg bg-white"
                    >
                      {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => (
                        <option key={h} value={h}>{h > 12 ? `${h - 12} PM` : '12 PM'}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-[#5C716C] italic text-[10px]">Off / Not Available</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2 border-t border-[#D8D3C4]">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">
          Cancel
        </button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold shadow-sm">
          Save Groomer Profile
        </button>
      </div>
    </form>
  );
};

// 8. Inventory Form Modal
const InventoryFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { addInventoryItem, updateInventoryItem } = useApp();
  const existing = data?.item;

  const [name, setName] = useState(existing?.name || '');
  const [price, setPrice] = useState(existing?.price || 15);
  const [cost, setCost] = useState(existing?.cost || 6);
  const [stock, setStock] = useState(existing?.stock || 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      updateInventoryItem(existing.id, { name, price, cost, stock });
    } else {
      addInventoryItem({ name, price, cost, stock, lowAt: 5 });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">{existing ? 'Edit Product' : 'Add Product'}</h3>
      <div>
        <label className="font-bold text-[#173E39]">Product Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="font-bold text-[#173E39]">Price ($)</label>
          <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Cost ($)</label>
          <input type="number" value={cost} onChange={(e) => setCost(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Stock Qty</label>
          <input type="number" value={stock} onChange={(e) => setStock(parseInt(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Save Product</button>
      </div>
    </form>
  );
};

// 9. Gift Card Form Modal
const GiftCardFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addGiftCard } = useApp();
  const [code, setCode] = useState('GC-PAWS' + Math.floor(10 + Math.random() * 90));
  const [amount, setAmount] = useState(50);
  const [note, setNote] = useState('Gift voucher');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addGiftCard({ code, amount, balance: amount, note });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Issue Gift Card</h3>
      <div>
        <label className="font-bold text-[#173E39]">Voucher Code</label>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl font-mono font-bold" />
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Amount ($)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Note</label>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Issue Voucher</button>
      </div>
    </form>
  );
};

// 10. Expense Form Modal
const ExpenseFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addExpense } = useApp();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(45);
  const [category, setCategory] = useState<'supplies' | 'equipment' | 'vehicle' | 'insurance' | 'marketing' | 'other'>('supplies');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({ desc, amount, category, date: '2026-08-12' });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Log Studio Expense</h3>
      <div>
        <label className="font-bold text-[#173E39]">Description</label>
        <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} required placeholder="e.g. Shampoo restocking" className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Amount ($)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full mt-1 p-2 border rounded-xl">
            <option value="supplies">Supplies</option>
            <option value="equipment">Equipment</option>
            <option value="vehicle">Vehicle / Van</option>
            <option value="insurance">Insurance</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Record Expense</button>
      </div>
    </form>
  );
};

// 11. Waitlist Form Modal
const WaitlistFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addWaitlist, clients, services } = useApp();
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [pref, setPref] = useState('Weekday morning preferred');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWaitlist({ clientId, serviceId, staffId: '', pref });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Add to Waitlist</h3>
      <div>
        <label className="font-bold text-[#173E39]">Select Client & Pet</label>
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full mt-1 p-2 border rounded-xl">
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.breed})</option>)}
        </select>
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Preferred Service</label>
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full mt-1 p-2 border rounded-xl">
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Preference / Schedule Note</label>
        <input type="text" value={pref} onChange={(e) => setPref(e.target.value)} className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Add to Waitlist</button>
      </div>
    </form>
  );
};

// 12. Transformation Gallery Form Modal
const TransformationFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addTransformation, staff } = useApp();
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('Cockapoo');
  const [ownerName, setOwnerName] = useState('');
  const [styleNotes, setStyleNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransformation({
      petName,
      breed,
      ownerName,
      serviceName: 'Full Grooming',
      date: '2026-08-12',
      groomerName: staff[0]?.name || 'Dani Brooks',
      styleNotes,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Add Transformation Photo</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-bold text-[#173E39]">Pet Name</label>
          <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Breed</label>
          <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Owner Name</label>
        <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Style Cut Notes</label>
        <textarea value={styleNotes} onChange={(e) => setStyleNotes(e.target.value)} placeholder="e.g. #4 body, scissored teddy face..." className="w-full mt-1 p-2 border rounded-xl h-16" />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Publish Entry</button>
      </div>
    </form>
  );
};

// 13. Redeem Points & Promo Code Modal
const RedeemModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { clients, redeemPoints, createPromoCode, showToast, formatPrice } = useApp();
  const reward = data?.reward || { title: '$10 Off Next Groom', pts: 100 };
  const [selectedClientId, setSelectedClientId] = useState(data?.client?.id || clients[0]?.id || '');
  const [mode, setMode] = useState<'points' | 'custom'>(data?.mode || 'points');
  const [customTitle, setCustomTitle] = useState('15% Off Grooming Voucher');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [autoApplyInCheckout, setAutoApplyInCheckout] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const client = clients.find((c) => c.id === selectedClientId);
  const clientPoints = client?.points || 0;
  const canRedeem = mode === 'custom' || clientPoints >= reward.pts;

  const handleRedeem = () => {
    if (!client) return;
    if (mode === 'points') {
      const code = redeemPoints(client.id, reward.title, reward.pts, autoApplyInCheckout);
      if (code) {
        setGeneratedCode(code);
      }
    } else {
      const created = createPromoCode(
        client.id,
        customTitle,
        discountType,
        discountValue,
        0,
        autoApplyInCheckout
      );
      if (created) {
        setGeneratedCode(created.code);
        showToast(`Promo code ${created.code} created for ${client.name}!`, 'success');
      }
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      showToast(`Copied voucher code ${generatedCode}!`, 'success');
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="font-display font-bold text-xl text-[#173E39]">
            {generatedCode ? '🎉 Promo / Reward Code Issued!' : 'Client Promo & Loyalty Rewards'}
          </h3>
          <p className="text-[11px] text-[#5C716C]">
            Create client/dog-specific promo codes and redeem loyalty points
          </p>
        </div>
      </div>

      {!generatedCode ? (
        <>
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-[#F1EEE6] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('points')}
              className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                mode === 'points'
                  ? 'bg-white text-[#173E39] shadow-xs'
                  : 'text-[#7A6865] hover:text-[#173E39]'
              }`}
            >
              Redeem Catalog Reward
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                mode === 'custom'
                  ? 'bg-white text-[#173E39] shadow-xs'
                  : 'text-[#7A6865] hover:text-[#173E39]'
              }`}
            >
              + Create Custom Promo Code
            </button>
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Select Target Pet & Client</label>
            <select 
              value={selectedClientId} 
              onChange={(e) => setSelectedClientId(e.target.value)} 
              className="w-full mt-1 p-2.5 border border-[#D8D3C4] rounded-xl font-bold bg-white outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  🐾 {c.name} ({c.owner}) — {c.points || 0} pts available
                </option>
              ))}
            </select>
          </div>

          {mode === 'points' ? (
            <div className="bg-[#FFFBEB] p-3.5 rounded-2xl border border-[#E7A93C]/40 space-y-1">
              <div className="font-bold text-sm text-[#173E39]">{reward.title}</div>
              <div className="text-[#C98A22] font-bold">{reward.pts} Points Required</div>
              {!canRedeem && (
                <div className="p-2 bg-[#FEF2F2] border border-[#E7C0B5] text-[#991B1B] rounded-xl font-bold text-[11px] mt-2">
                  ⚠️ Not enough points. {client?.name} has {clientPoints} points, but {reward.pts} points are required.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#D8D3C4]">
              <div>
                <label className="font-bold text-[#173E39]">Promo Title / Description</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl bg-white text-xs font-semibold"
                  placeholder="e.g. 15% VIP Fall Grooming"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#173E39]">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                    className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl bg-white font-bold"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#173E39]">
                    Discount Value ({discountType === 'percent' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === 'percent' ? 100 : 500}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl bg-white font-bold text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Set to Applied in Checkout Checkbox */}
          <div className="p-3 bg-[#E1F0E7]/60 border border-[#357A54]/30 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="autoApplyInCheckout"
              checked={autoApplyInCheckout}
              onChange={(e) => setAutoApplyInCheckout(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#2E8A81] focus:ring-[#2E8A81]"
            />
            <label htmlFor="autoApplyInCheckout" className="cursor-pointer">
              <span className="font-bold text-[#173E39] block">
                Set to "Applied" in checkout
              </span>
              <span className="text-[11px] text-[#5C716C] block">
                When checking out {client?.name || 'this pet'}, this promo code will be automatically selected and applied to the invoice.
              </span>
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
            <button 
              onClick={handleRedeem} 
              disabled={!canRedeem}
              className="btn-primary text-xs px-5 py-2 rounded-xl font-bold disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {mode === 'points' ? 'Confirm Redemption & Issue Promo' : 'Create & Apply Promo Code'}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-3 pt-1">
          <div className="bg-[#E1F0E7] border border-[#357A54]/40 p-4 rounded-2xl text-center space-y-2">
            <p className="text-xs font-bold text-[#1E5638]">
              Promo code successfully created & linked to {client?.name}!
            </p>
            <div className="text-2xl font-mono font-black tracking-widest text-[#173E39] bg-white p-2.5 rounded-xl border border-[#D8D3C4] inline-block shadow-xs">
              {generatedCode}
            </div>
            {autoApplyInCheckout && (
              <div className="inline-block bg-[#10B981] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ✓ Set to APPLIED in checkout
              </div>
            )}
            <p className="text-[11px] text-[#2E8A81] font-semibold">
              This promo code will only show and apply during checkout for {client?.name} ({client?.owner}).
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Close</button>
            <button 
              onClick={handleCopy} 
              className="btn-primary text-xs px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Code & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 14. Send Reminder Modal
const ReminderModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { showToast } = useApp();
  const client = data?.client;
  const alertType = data?.alertType || 'overdue';

  const [msg, setMsg] = useState(
    alertType === 'vaccine'
      ? `Hi ${client?.owner}, Rabies vaccine record for ${client?.name} is due/expired. Please send updated record before your next groom!`
      : `Hi ${client?.owner}, ${client?.name} is due for their recurring grooming session at Bubbles & Barks! Reply to book or tap link.`
  );

  const handleSend = () => {
    showToast(`Automated ${alertType} reminder sent to ${client?.owner} (${client?.phone})!`, 'success');
    onClose();
  };

  return (
    <div className="space-y-4 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Send Client SMS Reminder</h3>
      <p className="text-[#5C716C]">To: {client?.owner} ({client?.phone})</p>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} className="w-full p-2.5 border rounded-xl h-24 text-xs" />
      <div className="pt-2 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button onClick={handleSend} className="btn-primary text-xs px-5 py-2 rounded-xl font-bold flex items-center gap-1">
          <Send className="w-3.5 h-3.5" /> Send Reminder
        </button>
      </div>
    </div>
  );
};

// 15. Generic Confirm Modal
const ConfirmModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const handleConfirm = () => {
    if (data?.onConfirm) {
      data.onConfirm();
    }
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[#C9503A]">
        <div className="p-3 bg-[#FEF2F2] rounded-2xl">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl text-[#173E39]">
            {data?.title || 'Confirm Action'}
          </h3>
          <p className="text-xs text-[#5C716C] mt-0.5">
            Please confirm your action below.
          </p>
        </div>
      </div>

      <div className="bg-[#F1EEE6] p-3.5 rounded-2xl text-xs text-[#173E39] font-medium leading-relaxed border border-[#D8D3C4]">
        {data?.message || 'Are you sure you want to proceed with this deletion?'}
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost text-xs px-4 py-2 rounded-xl"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="bg-[#C9503A] hover:bg-[#B03E29] text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm transition-all"
        >
          {data?.confirmLabel || 'Delete'}
        </button>
      </div>
    </div>
  );
};

// Helper to reliably trigger printing or popup print window (for iframe compatibility & Save PDF)
const triggerPrintDocument = (title: string, containerId: string) => {
  try {
    window.focus();
  } catch (e) {
    // ignore
  }

  const containerEl = document.getElementById(containerId);

  // If running inside an iframe (like AI Studio preview), open print popup window so browser allows print dialog
  const isIframe = window.self !== window.top;
  if (isIframe && containerEl) {
    const printWin = window.open('', '_blank', 'width=850,height=1100');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta charset="utf-8" />
            <style>
              @page {
                size: A4 portrait;
                margin: 12mm 15mm;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #240C0B;
                padding: 24px;
                margin: 0;
                background: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print { display: none !important; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
              th, td { border-bottom: 1px solid #E6DFD5; padding: 12px 14px; text-align: left; font-size: 12px; }
              th { border-bottom: 2px solid #240C0B !important; color: #240C0B !important; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
              tr:nth-child(even) { background-color: #FAF8F5; }
              .bg-white { background-color: #ffffff; }
              .bg-\\[\\#FAF8F5\\] { background-color: #FAF8F5; }
              .bg-\\[\\#E8F5E9\\] { background-color: #E8F5E9; }
              .border { border: 1px solid #E6DFD5; }
              .border-b-2 { border-bottom: 2px solid #240C0B; }
              .border-t-2 { border-top: 2px solid #240C0B; }
              .rounded-2xl { border-radius: 16px; }
              .rounded-xl { border-radius: 12px; }
              .font-bold { font-weight: 700; }
              .font-black { font-weight: 900; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .text-sm { font-size: 14px; }
              .text-xs { font-size: 12px; }
              .text-2xl { font-size: 24px; }
              .text-xl { font-size: 20px; }
              .text-\\[\\#FF6B00\\] { color: #FF6B00; }
              .text-\\[\\#240C0B\\] { color: #240C0B; }
              .text-\\[\\#2E7D32\\] { color: #2E7D32; }
              .text-\\[\\#6E5B58\\] { color: #6E5B58; }
              .text-\\[\\#7A6865\\] { color: #7A6865; }
              .space-y-4 > * + * { margin-top: 16px; }
              .space-y-6 > * + * { margin-top: 24px; }
              .space-y-8 > * + * { margin-top: 32px; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              .gap-4 { gap: 16px; }
              .gap-6 { gap: 24px; }
              .p-4 { padding: 16px; }
              .p-6 { padding: 24px; }
              .pb-6 { padding-bottom: 24px; }
              .pt-6 { padding-top: 24px; }
              .pt-8 { padding-top: 32px; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .items-center { align-items: center; }
              .items-start { align-items: flex-start; }
            </style>
          </head>
          <body>
            <div>${containerEl.innerHTML}</div>
            <script>
              window.onload = function() {
                window.focus();
                setTimeout(function() {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWin.document.close();
      return;
    }
  }

  // Fallback: direct window.print()
  setTimeout(() => {
    window.print();
  }, 100);
};

// 16. Print Daily Schedule Modal
const PrintScheduleModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { appointments, clients, services, staff, settings } = useApp();

  const [dateISO, setDateISO] = useState<string>(data?.dateISO || '2026-08-12');
  const [staffId, setStaffId] = useState<string>(data?.staffId || 'all');

  // Filter appointments for selected date and staff
  const dailyAppts = appointments
    .filter((a) => {
      if (a.date !== dateISO || a.status === 'cancelled') return false;
      if (staffId !== 'all' && a.staffId !== staffId) return false;
      return true;
    })
    .sort((a, b) => a.start.localeCompare(b.start));

  const selectedStaffObj = staff.find((s) => s.id === staffId);
  const formattedDate = new Date(dateISO + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const totalRev = dailyAppts.reduce((sum, a) => sum + a.price + (a.retail || 0), 0);
  const completedCount = dailyAppts.filter((a) => a.status === 'completed').length;

  const handlePrint = () => {
    triggerPrintDocument(`Daily Schedule (${dateISO}) - PawBook Pro`, 'printable-schedule-doc');
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print bg-[#F1EEE6] p-4 rounded-2xl border border-[#D8D3C4] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[11px] font-bold text-[#5C716C] uppercase mb-1">Schedule Date</label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="bg-white border border-[#D8D3C4] rounded-xl px-3 py-1.5 text-xs font-bold text-[#173E39] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5C716C] uppercase mb-1">Filter Stylist</label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="bg-white border border-[#D8D3C4] rounded-xl px-3 py-1.5 text-xs font-bold text-[#173E39] outline-none"
            >
              <option value="all">All Stylists</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="printable-btn bg-[#2E8A81] hover:bg-[#1F6660] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Schedule / Save PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost text-xs px-4 py-2.5 rounded-xl font-bold"
          >
            Close
          </button>
        </div>
      </div>

      {/* Printable Schedule Document Container */}
      <div id="printable-schedule-doc" className="printable-area bg-white p-2 sm:p-4 text-[#173E39] space-y-6">
        {/* Document Header */}
        <div className="border-b-2 border-[#173E39] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-[#E8734A]" />
              <h1 className="font-display font-bold text-2xl text-[#173E39] tracking-tight">
                {settings?.name || settings?.salonName || 'PawBook Pro Grooming Studio'}
              </h1>
            </div>
            <p className="text-xs text-[#5C716C] mt-1 font-semibold">
              {settings?.address || '100 Bark Avenue, Suite 4 • San Francisco, CA 94107'}
            </p>
            <p className="text-[11px] text-[#2E8A81] font-bold mt-0.5">
              Daily Master Operations Schedule • Tel: {settings?.phone || '(555) 123-PAWS'}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 bg-[#F1EEE6]/60 p-3 rounded-2xl border border-[#D8D3C4]/60">
            <div className="font-bold text-[#173E39] text-sm">{formattedDate}</div>
            <div className="text-[#5C716C]">
              Stylist View: <span className="font-bold text-[#173E39]">{selectedStaffObj ? selectedStaffObj.name : 'All Stylists'}</span>
            </div>
            <div className="text-[10px] text-[#5C716C]">
              Generated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#F1EEE6] p-3 rounded-2xl border border-[#D8D3C4] text-center">
            <div className="text-[10px] uppercase font-bold text-[#5C716C]">Total Bookings</div>
            <div className="text-xl font-display font-bold text-[#173E39] mt-0.5">{dailyAppts.length} sessions</div>
          </div>
          <div className="bg-[#F1EEE6] p-3 rounded-2xl border border-[#D8D3C4] text-center">
            <div className="text-[10px] uppercase font-bold text-[#5C716C]">Completed</div>
            <div className="text-xl font-display font-bold text-[#3E9B6E] mt-0.5">{completedCount} grooms</div>
          </div>
          <div className="bg-[#F1EEE6] p-3 rounded-2xl border border-[#D8D3C4] text-center">
            <div className="text-[10px] uppercase font-bold text-[#5C716C]">Scheduled</div>
            <div className="text-xl font-display font-bold text-[#E8734A] mt-0.5">{dailyAppts.length - completedCount} pending</div>
          </div>
          <div className="bg-[#F1EEE6] p-3 rounded-2xl border border-[#D8D3C4] text-center">
            <div className="text-[10px] uppercase font-bold text-[#5C716C]">Expected Revenue</div>
            <div className="text-xl font-display font-bold text-[#173E39] mt-0.5">${totalRev}</div>
          </div>
        </div>

        {/* Schedule List Table */}
        {dailyAppts.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-[#5C716C] bg-[#F1EEE6]/30 rounded-2xl border border-dashed border-[#D8D3C4]">
            No appointments scheduled for {formattedDate} {staffId !== 'all' ? `with ${selectedStaffObj?.name}` : ''}.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#173E39] rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#173E39] text-white font-bold">
                  <th className="p-3 border-r border-[#2E8A81]">Time</th>
                  <th className="p-3 border-r border-[#2E8A81]">Pet & Owner</th>
                  <th className="p-3 border-r border-[#2E8A81]">Service Details</th>
                  <th className="p-3 border-r border-[#2E8A81]">Stylist</th>
                  <th className="p-3 border-r border-[#2E8A81]">Care Notes / Sensitivities</th>
                  <th className="p-3 text-center">Sign-off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D3C4] bg-white">
                {dailyAppts.map((a) => {
                  const client = clients.find((c) => c.id === a.clientId);
                  const service = services.find((s) => s.id === a.serviceId);
                  const groomer = staff.find((st) => st.id === a.staffId);

                  return (
                    <tr key={a.id} className="hover:bg-[#F1EEE6]/40 print-page-break">
                      {/* Time */}
                      <td className="p-3 font-bold text-[#173E39] whitespace-nowrap border-r border-[#D8D3C4] bg-[#F1EEE6]/20">
                        <div className="text-sm font-display">{a.start}</div>
                        <div className="text-[10px] text-[#5C716C]">{a.duration} mins</div>
                      </td>

                      {/* Pet & Owner */}
                      <td className="p-3 border-r border-[#D8D3C4]">
                        <div className="font-bold text-sm text-[#173E39]">
                          {client?.name || 'Pet'} <span className="text-xs font-normal text-[#5C716C]">({client?.breed || 'Breed'})</span>
                        </div>
                        <div className="text-[11px] text-[#5C716C] mt-0.5">
                          Owner: <span className="font-semibold text-[#173E39]">{client?.owner}</span> • {client?.phone}
                        </div>
                      </td>

                      {/* Service Details */}
                      <td className="p-3 border-r border-[#D8D3C4]">
                        <div className="font-bold text-[#173E39]">{service?.name || 'Grooming'}</div>
                        <div className="text-[10px] text-[#5C716C] mt-0.5">
                          ${a.price} {a.retail ? `+ $${a.retail} retail` : ''}
                        </div>
                      </td>

                      {/* Stylist */}
                      <td className="p-3 border-r border-[#D8D3C4] whitespace-nowrap">
                        <span
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-white inline-block"
                          style={{ backgroundColor: groomer?.color || '#2E8A81' }}
                        >
                          {groomer?.name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Care Notes & Sensitivities */}
                      <td className="p-3 border-r border-[#D8D3C4]">
                        {client?.sensitivities ? (
                          <div className="bg-[#FEF2F2] border border-[#FCA5A5] p-1.5 rounded-xl text-[#991B1B] text-[10px] font-bold flex items-start gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#DC2626]" />
                            <span>{client.sensitivities}</span>
                          </div>
                        ) : (
                          <span className="text-[#5C716C] text-[11px] italic">{a.notes || 'No special alerts'}</span>
                        )}
                      </td>

                      {/* Groomer Signoff Checkbox */}
                      <td className="p-3 text-center align-middle whitespace-nowrap">
                        <div className="inline-flex items-center justify-center border-2 border-[#173E39] w-6 h-6 rounded-md bg-white">
                          {a.status === 'completed' && <Check className="w-4 h-4 text-[#3E9B6E]" />}
                        </div>
                        <div className="text-[9px] text-[#5C716C] font-bold uppercase mt-1">
                          {a.status}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Notes */}
        <div className="pt-4 border-t border-[#D8D3C4] text-[10px] text-[#5C716C] flex flex-col sm:flex-row items-center justify-between gap-2 font-medium">
          <div>PawBook Pro Pet Grooming Studio Operations • Confidential Internal Staff Schedule</div>
          <div>Reception Phone: (555) 123-PAWS • Page 1 of 1</div>
        </div>
      </div>
    </div>
  );
};

// 17. Official Invoice / Receipt Modal (Minimalist Premium A4 Layout)
const InvoiceModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { clients, services, packages, staff, settings, showToast, formatPrice } = useApp();
  const appt = data?.appointment;

  if (!appt) return null;

  const client = clients.find((c) => c.id === appt.clientId);
  const service = services.find((s) => s.id === appt.serviceId);
  const groomer = staff.find((st) => st.id === appt.staffId);

  // Look up spa package if selected
  const pkg = appt.packageId 
    ? packages.find((p) => p.id === appt.packageId)
    : (appt.packageName ? packages.find(p => p.name.toLowerCase() === appt.packageName?.toLowerCase()) : (data?.packageId ? packages.find(p => p.id === data.packageId) : null));

  const retailAddon = data?.retailAddon !== undefined ? data.retailAddon : appt.retail || 0;
  const servicePrice = pkg ? pkg.price : (service?.price || appt.price || 0);
  const subtotal = servicePrice + retailAddon;

  // Read client/dog promo code discount if applied
  const discountAmount = data?.discountAmount !== undefined ? data.discountAmount : appt.discountAmount || 0;
  const discountCode = data?.discountCode || appt.discountCode || '';
  const discountTitle = data?.discountTitle || appt.discountTitle || '';

  const taxableSubtotal = Math.max(0, subtotal - discountAmount);

  // Dynamic US tax rate from settings (0% to 20%)
  const taxRate = settings?.taxRate !== undefined ? settings.taxRate : 8.5;
  const tax = Math.round(taxableSubtotal * (taxRate / 100) * 100) / 100;
  const total = taxableSubtotal + tax;
  const pointsEarned = Math.floor(total);

  const invoiceNum = `INV-${appt.date.replace(/-/g, '')}-${appt.id.replace(/\D/g, '') || '101'}`;
  const isPaid = appt.status === 'completed';

  // Synchronized clinic data from settings
  const clinicName = settings?.name || settings?.salonName || 'PawBook Pro Grooming Studio';
  const clinicEmail = settings?.email || 'care@pawbookpro.com';
  const clinicWebsite = settings?.website || 'www.pawbookpro.com';
  const clinicPhone = settings?.phone || '(555) 123-PAWS';
  const clinicAddress = settings?.address || '100 Bark Avenue, Suite 4, San Francisco, CA 94107';
  const clinicPhoto = settings?.photo || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=240&q=80';

  const handlePrint = () => {
    triggerPrintDocument(`Invoice ${invoiceNum} - ${clinicName}`, 'printable-invoice-doc');
  };

  const handleWhatsAppShare = () => {
    if (!client) {
      showToast('Client details not found', 'error');
      return;
    }
    const ok = openWhatsAppInvoice({
      invoiceNum,
      client,
      appointment: { ...appt, retail: retailAddon },
      clinicSettings: settings,
      serviceName: service?.name,
      packageName: pkg?.name || appt.packageName,
      groomerName: groomer?.name,
      servicePrice,
      retailAddon,
      discountAmount,
      discountCode,
      discountTitle,
      taxRate,
      tax,
      total,
      pointsEarned,
      isPaid
    });
    if (ok) {
      showToast(`Redirecting to WhatsApp for ${client.owner}...`, 'success');
    }
  };

  const handleCopyTextReceipt = () => {
    if (!client) return;
    const text = generateWhatsAppInvoiceText({
      invoiceNum,
      client,
      appointment: { ...appt, retail: retailAddon },
      clinicSettings: settings,
      serviceName: service?.name,
      packageName: pkg?.name || appt.packageName,
      groomerName: groomer?.name,
      servicePrice,
      retailAddon,
      discountAmount,
      discountCode,
      discountTitle,
      taxRate,
      tax,
      total,
      pointsEarned,
      isPaid
    });
    navigator.clipboard.writeText(text);
    showToast('Invoice summary copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar (Hidden on print) */}
      <div className="no-print bg-[#FAF8F5] p-3.5 sm:p-4 rounded-2xl border border-[#E6DFD5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#240C0B] text-white rounded-xl shadow-xs shrink-0">
            <Receipt className="w-5 h-5 text-[#FF6B00]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-sm text-[#240C0B]">Official Invoice & Receipt</h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#240C0B] text-white">
                A4 Standard
              </span>
            </div>
            <p className="text-[11px] text-[#7A6865] mt-0.5">
              US Sales Tax: <strong className="text-[#FF6B00]">{taxRate}%</strong> • Client: <strong className="text-[#240C0B]">{client?.owner}</strong> ({client?.phone || 'No phone'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* WhatsApp Direct Share Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Share invoice directly to client on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Share via WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopyTextReceipt}
            className="bg-white border border-[#D8D3C4] hover:bg-[#FAF8F5] text-[#240C0B] font-bold text-xs px-3 py-2.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copy formatted text message"
          >
            <Share2 className="w-3.5 h-3.5 text-[#2E8A81]" />
            <span className="hidden sm:inline">Copy Text</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-[#240C0B] hover:bg-[#180504] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Print Invoice</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2.5 bg-white border border-[#E6DFD5] hover:bg-[#F1EEE6] text-[#240C0B] text-xs rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* A4 Printable Document Container (Exact 210mm standard proportions with spacious layout) */}
      <div className="flex justify-center overflow-x-auto p-2 sm:p-4 bg-[#EBE7DF] rounded-2xl">
        <div 
          id="printable-invoice-doc" 
          className="printable-area bg-white text-[#240C0B] w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 md:p-14 space-y-9 border border-[#D8D3C4] shadow-md print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none"
        >
          {/* Header Block: Studio Brand & Official Invoice Title (Spacious) */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-b-2 border-[#240C0B] pb-8">
            <div className="flex items-start gap-5">
              <img 
                src={clinicPhoto} 
                alt={clinicName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#240C0B] shadow-xs shrink-0"
              />
              <div className="space-y-1.5">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#240C0B] tracking-tight leading-tight">
                  {clinicName}
                </h1>
                <div className="text-xs text-[#6E5B58] space-y-1 leading-relaxed">
                  <p className="font-medium">{clinicAddress}</p>
                  <p className="flex flex-wrap items-center gap-x-2.5">
                    <span>Tel: <strong className="text-[#240C0B]">{clinicPhone}</strong></span>
                    <span>•</span>
                    <span>Email: <strong className="text-[#240C0B]">{clinicEmail}</strong></span>
                  </p>
                  <p className="text-[#2E8A81] font-semibold">Web: {clinicWebsite}</p>
                </div>
              </div>
            </div>

            {/* Document Meta & Status Pill */}
            <div className="text-left sm:text-right space-y-2.5 shrink-0">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#A08E8B] uppercase block">
                  Original Tax Invoice
                </span>
                <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-[#240C0B]">
                  {invoiceNum}
                </span>
              </div>
              <div className="text-xs text-[#6E5B58] space-y-1 font-medium">
                <div>Date: <strong className="text-[#240C0B]">{appt.date}</strong></div>
                <div>Time: <strong className="text-[#240C0B]">{appt.start}</strong></div>
              </div>
              <div className="pt-1.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isPaid 
                    ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                    : 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]'
                }`}>
                  ● {isPaid ? 'PAID IN FULL' : 'PAYMENT DUE'}
                </span>
              </div>
            </div>
          </div>

          {/* Minimalist 2-Column Details: Bill To & Care Session with Generous Spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6DFD5] space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A08E8B] block border-b border-[#E6DFD5] pb-1.5">
                Billed To Client & Patient
              </span>
              <div className="space-y-1.5">
                <div className="font-display font-bold text-base text-[#240C0B]">
                  {client?.owner || 'Pet Parent'}
                </div>
                <div className="text-xs text-[#6E5B58]">
                  Patient: <strong className="text-[#240C0B]">🐾 {client?.name || 'Pet'}</strong> ({client?.breed || 'Canine'}, {client?.size || 'Standard'})
                </div>
                <div className="text-xs text-[#6E5B58]">
                  Contact: <strong className="text-[#240C0B]">{client?.phone || 'N/A'}</strong> • {client?.email || 'N/A'}
                </div>
                {client?.sensitivities && (
                  <div className="text-[11px] text-[#C9503A] font-bold pt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Special Care: {client.sensitivities}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6DFD5] space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A08E8B] block border-b border-[#E6DFD5] pb-1.5">
                Clinical Details & Stylist
              </span>
              <div className="space-y-1.5">
                <div className="font-display font-bold text-base text-[#240C0B]">
                  {groomer?.name || 'Master Pet Stylist'}
                </div>
                <div className="text-xs text-[#6E5B58]">
                  Session Length: <strong className="text-[#240C0B]">{appt.duration} Minutes</strong>
                </div>
                <div className="text-xs text-[#6E5B58]">
                  Sales Tax Reg: US-94028-PAW • Rate: <strong className="text-[#240C0B]">{taxRate}%</strong>
                </div>
                <div className="text-xs text-[#6E5B58]">
                  Payment Method: Contactless POS / Card / Cash
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table with Modern Spacing */}
          <div className="space-y-4 pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#240C0B] text-[#240C0B] font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 pr-4">Description & Treatment</th>
                  <th className="py-3.5 px-3 text-center">Qty / Duration</th>
                  <th className="py-3.5 px-3 text-right">Unit Rate</th>
                  <th className="py-3.5 pl-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD5] text-[#240C0B]">
                {/* Main Service or Spa Package */}
                <tr>
                  <td className="py-4 pr-4">
                    <div className="font-display font-bold text-sm sm:text-base text-[#240C0B]">
                      {pkg ? `✨ ${pkg.name} (Spa Package Bundle)` : (service?.name || 'Full Grooming & Spa Treatment')}
                    </div>
                    <div className="text-xs text-[#7A6865] mt-1 leading-relaxed">
                      {pkg ? (
                        <span>
                          Includes complete bundled care treatments: {pkg.serviceIds.map(sid => services.find(s => s.id === sid)?.name).filter(Boolean).join(' + ')}. Hand blowout, coat conditioning, & luxury styling.
                        </span>
                      ) : (
                        <span>
                          Hydro-massage bath, coat conditioning, hand blowout, custom scissor style & hygiene trim.
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center font-medium text-[#7A6865]">
                    {pkg ? `${pkg.duration}m` : `${appt.duration}m`}
                  </td>
                  <td className="py-4 px-3 text-right font-medium text-[#7A6865]">
                    {formatPrice(servicePrice)}
                  </td>
                  <td className="py-4 pl-3 text-right font-bold text-base text-[#240C0B]">
                    {formatPrice(servicePrice)}
                  </td>
                </tr>

                {/* Retail Addon */}
                {retailAddon > 0 && (
                  <tr>
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-xs sm:text-sm text-[#240C0B]">
                        Retail Care & Spa Treatment Add-on
                      </div>
                      <div className="text-xs text-[#7A6865] mt-0.5">
                        Organic botanical paw balm & hypoallergenic leave-in mist.
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium text-[#7A6865]">1x</td>
                    <td className="py-3.5 px-3 text-right font-medium text-[#7A6865]">{formatPrice(retailAddon)}</td>
                    <td className="py-3.5 pl-3 text-right font-bold text-[#240C0B]">{formatPrice(retailAddon)}</td>
                  </tr>
                )}

                {/* Promo Code Discount */}
                {discountAmount > 0 && (
                  <tr className="bg-[#E8F5E9]/60">
                    <td className="py-3 pr-4 text-[#2E7D32]">
                      <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                        <Gift className="w-4 h-4 shrink-0" />
                        <span>Client Promo Code Discount ({discountCode ? `${discountCode} • ` : ''}{discountTitle || 'Special Voucher'})</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#2E7D32]">1x</td>
                    <td className="py-3 px-3 text-right font-bold text-[#2E7D32]">-{formatPrice(discountAmount)}</td>
                    <td className="py-3 pl-3 text-right font-black text-sm text-[#2E7D32]">-{formatPrice(discountAmount)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary & Tax Computation Row with Generous Spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 items-start border-t border-[#E6DFD5]">
            {/* Rewards & Client Notes */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6DFD5] text-xs space-y-2.5">
              <div className="flex items-center gap-1.5 font-display font-bold text-[#FF6B00] text-sm">
                <Award className="w-4 h-4" />
                <span>Loyalty Points Earned</span>
              </div>
              <p className="text-xs text-[#6E5B58] leading-relaxed">
                {client?.name || 'Pet'} earned <strong className="text-[#240C0B]">+{pointsEarned} Paw Points</strong> on this visit. Current account total: <strong className="text-[#240C0B]">{(client?.points || 0) + pointsEarned} pts</strong>.
              </p>
              <div className="pt-2.5 border-t border-[#E6DFD5] text-[11px] text-[#7A6865] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2E8A81]" />
                <span>Certified Organic & Hypoallergenic Grooming Care</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#6E5B58]">
                <span>Gross Subtotal:</span>
                <span className="font-bold text-[#240C0B]">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#2E7D32] font-semibold">
                  <span>Promo Code Savings:</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#6E5B58] pt-1.5 border-t border-[#E6DFD5]">
                <span>Taxable Amount:</span>
                <span className="font-bold text-[#240C0B]">{formatPrice(taxableSubtotal)}</span>
              </div>

              <div className="flex justify-between text-[#6E5B58]">
                <span>US Sales Tax ({taxRate}%):</span>
                <span className="font-bold text-[#FF6B00]">+{formatPrice(tax)}</span>
              </div>

              <div className="border-t-2 border-[#240C0B] pt-3 flex justify-between items-baseline">
                <span className="font-display font-black text-sm sm:text-base text-[#240C0B] uppercase tracking-wider">
                  Total Amount:
                </span>
                <span className="font-display font-black text-2xl sm:text-3xl text-[#240C0B]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Minimalist A4 Footer with Signature and Clinic Note */}
          <div className="pt-10 border-t-2 border-[#240C0B] space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left text-xs">
              <div className="space-y-1.5">
                <p className="font-display font-bold text-sm text-[#240C0B]">
                  Thank you for visiting {clinicName}! 🐾
                </p>
                <p className="text-xs text-[#7A6865]">
                  Questions or schedule follow-up? Email <strong className="text-[#240C0B]">{clinicEmail}</strong> or visit <strong className="text-[#240C0B]">{clinicWebsite}</strong>
                </p>
              </div>

              <div className="border border-dashed border-[#A08E8B] px-5 py-3 rounded-xl text-center shrink-0">
                <span className="text-[10px] font-bold text-[#A08E8B] uppercase tracking-widest block">
                  Authorized Signature / Stamp
                </span>
                <span className="font-display text-sm text-[#240C0B] font-bold">
                  {clinicName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 18. Vaccine Schedule Form Modal
const VaccineScheduleFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { clients, settings, addVaccineRecord } = useApp();

  const getTodayISO = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNextYearISO = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [clientId, setClientId] = useState(data?.clientId || clients[0]?.id || '');
  const [vaccineName, setVaccineName] = useState('Rabies (3-Year)');
  const [dateAdministered, setDateAdministered] = useState(getTodayISO());
  const [nextDueDate, setNextDueDate] = useState(getNextYearISO());
  const [veterinarian, setVeterinarian] = useState('Central Pet Hospital');
  const [batchNo, setBatchNo] = useState('');
  const [notes, setNotes] = useState('');

  const quickVaccines = [
    'Rabies (3-Year)',
    'Rabies (1-Year)',
    'Bordetella (Kennel Cough)',
    'DHPP (Distemper Combo)',
    'Parvovirus',
    'Lyme Disease',
    'Feline Leukemia'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    addVaccineRecord(clientId, {
      vaccineName,
      dateAdministered,
      nextDueDate,
      veterinarian,
      batchNo,
      notes
    });

    onClose();
  };

  return (
    <div className="space-y-4 text-[#240C0B]">
      <div className="border-b border-[#E8E1D1] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-[#240C0B]">
              Add Vaccination Schedule
            </h2>
            <p className="text-xs text-[#A08E8B]">
              Record medical vaccine dates & upcoming renewals for pets
            </p>
          </div>
        </div>

        {/* Shop Name & Owner Name Display Badge */}
        <div className="mt-3 bg-[#FFF8E7] border border-[#FFE7B3] p-2.5 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#240C0B]">{settings.salonName || 'PawBook Pro Studio'}</span>
            <span className="text-[#A08E8B]">|</span>
            <span className="text-[#FF6B00] font-semibold">Owner: {settings.name || 'FAHD ABRAR'}</span>
          </div>
          <span className="text-[10px] bg-[#FF6B00]/10 text-[#FF6B00] font-bold px-2 py-0.5 rounded-md">
            Official Health Record
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Pet / Client */}
        <div>
          <label className="block text-xs font-bold text-[#240C0B] mb-1">
            Select Pet / Owner <span className="text-[#FF6B00]">*</span>
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.breed}) — Owner: {c.owner}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Vaccine Presets */}
        <div>
          <label className="block text-xs font-bold text-[#240C0B] mb-1">
            Vaccine Name <span className="text-[#FF6B00]">*</span>
          </label>
          <input
            type="text"
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00] mb-2"
            placeholder="e.g. Rabies (3-Year)"
            required
          />
          <div className="flex flex-wrap gap-1.5">
            {quickVaccines.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVaccineName(v)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  vaccineName === v
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] font-bold shadow-xs'
                    : 'bg-[#F1EEE6] text-[#5C716C] border-[#D8D3C4] hover:bg-[#E8E1D1]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#240C0B] mb-1">
              Date Administered
            </label>
            <input
              type="date"
              value={dateAdministered}
              onChange={(e) => setDateAdministered(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#240C0B] mb-1">
              Next Due / Expiry Date <span className="text-[#FF6B00]">*</span>
            </label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              required
            />
          </div>
        </div>

        {/* Vet Clinic & Batch # */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#240C0B] mb-1">
              Veterinarian / Clinic
            </label>
            <input
              type="text"
              value={veterinarian}
              onChange={(e) => setVeterinarian(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              placeholder="e.g. Central Pet Hospital"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#240C0B] mb-1">
              Batch / Lot Number (Optional)
            </label>
            <input
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              placeholder="e.g. RB-9902"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-[#240C0B] mb-1">
            Notes / Health Instructions
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            placeholder="Special notes or vaccine verification info..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E1D1]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#F1EEE6] hover:bg-[#E8E1D1] text-[#5C716C] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF6B00]/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Vaccination Schedule</span>
          </button>
        </div>
      </form>
    </div>
  );
};

