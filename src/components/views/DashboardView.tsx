import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatISO } from '../../data/initialData';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Plus, 
  ChevronRight,
  Check,
  Printer,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

// Pet avatar fallbacks
const PET_AVATARS: Record<string, string> = {
  cl1: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80',
  cl2: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=120&q=80',
  cl3: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=120&q=80',
  cl4: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=120&q=80',
  cl5: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=120&q=80',
  cl6: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=120&q=80',
  cl7: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=120&q=80',
};

const DEFAULT_DOG_AVATAR = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80';

export const DashboardView: React.FC = () => {
  const { 
    clients, 
    appointments, 
    services, 
    staff, 
    updateAppointmentStatus, 
    openModal, 
    setView,
    showToast 
  } = useApp();

  const todayStr = formatISO(new Date());
  const currentMonthStr = todayStr.slice(0, 7);
  const formattedTodayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formattedMonthLabel = new Date().toLocaleDateString('en-US', { month: 'short' });

  // Toggle for Appointments card: 'today' vs 'upcoming'
  const [apptFilter, setApptFilter] = useState<'today' | 'upcoming'>('today');

  // Hover tooltip state for daily revenue matrix bar chart
  const [hoveredDay, setHoveredDay] = useState<{ day: number; dateStr: string; rev: number; count: number } | null>(null);

  // Today's appointments sorted by start time
  const todaysAppts = React.useMemo(() => {
    return appointments
      .filter((a) => a.date === todayStr && a.status !== 'cancelled')
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [appointments, todayStr]);

  // Today's revenue (Sum of all active appointments scheduled today)
  const todayRevenue = React.useMemo(() => {
    return todaysAppts.reduce((sum, a) => sum + a.price + (a.retail || 0), 0);
  }, [todaysAppts]);

  // Month-To-Date Revenue across all valid appointments
  const mtdRevenue = React.useMemo(() => {
    return appointments
      .filter((a) => a.status !== 'cancelled' && a.date.startsWith(currentMonthStr))
      .reduce((sum, a) => sum + a.price + (a.retail || 0), 0);
  }, [appointments, currentMonthStr]);

  // Featured pet names for morning greeting
  const featuredPetsText = React.useMemo(() => {
    const todayPetNames = todaysAppts
      .map(a => clients.find(c => c.id === a.clientId)?.name)
      .filter(Boolean);
    if (todayPetNames.length >= 2) {
      return `${todayPetNames[0]} & ${todayPetNames[1]}`;
    } else if (todayPetNames.length === 1) {
      return `${todayPetNames[0]} & friends`;
    } else if (clients.length >= 2) {
      return `${clients[0].name} & ${clients[1].name}`;
    }
    return 'your pet clients';
  }, [todaysAppts, clients]);

  // Upcoming Appointments List (strictly dates after today)
  const upcomingApptsList = React.useMemo(() => {
    return appointments
      .filter(a => a.status !== 'cancelled' && a.date > todayStr)
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  }, [appointments, todayStr]);

  // List of appointments to show in the Appointments card
  const displayedCardAppts = apptFilter === 'today' ? todaysAppts : upcomingApptsList;

  // Pets Data Summary Table List
  const petDataSummary = React.useMemo(() => {
    const today = new Date();
    return clients.map(client => {
      let healthStatus = 'Good';
      let statusBg = 'bg-[#3BB221] text-white';
      if (client.rabiesExpiry) {
        const exp = new Date(client.rabiesExpiry);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays < 0) {
          healthStatus = 'Expired';
          statusBg = 'bg-[#DC2626] text-white';
        } else if (diffDays <= 30) {
          healthStatus = 'Due Soon';
          statusBg = 'bg-[#D97706] text-white';
        }
      }

      const clientAppts = appointments
        .filter(a => a.clientId === client.id && a.status !== 'cancelled')
        .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

      const nextAppt = clientAppts.find(a => a.date >= todayStr) || clientAppts[0];
      const nextApptStr = nextAppt 
        ? `${nextAppt.date.split('-').slice(1).join('/')} ${nextAppt.start}` 
        : 'None';

      return {
        client,
        petId: client.id.toUpperCase(),
        healthStatus,
        statusBg,
        nextApptStr
      };
    }).slice(0, 4);
  }, [clients, appointments, todayStr]);

  // Current Month Daily Revenue Breakdown Array
  const augustDailyData = React.useMemo(() => {
    const [yearStr, monthStr] = todayStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${yearStr}-${monthStr}-${String(dayNum).padStart(2, '0')}`;
      const dayAppts = appointments.filter(a => a.date === dateStr && a.status !== 'cancelled');
      const rev = dayAppts.reduce((sum, a) => sum + a.price + (a.retail || 0), 0);
      return { day: dayNum, dateStr, rev, count: dayAppts.length };
    });
    const maxRev = Math.max(...days.map(d => d.rev), 100);
    return { days, maxRev };
  }, [appointments, todayStr]);

  // Service Category Breakdown Ratios for Health & Care Radial
  const careCategoryRatio = React.useMemo(() => {
    const totals: Record<string, number> = { fullgroom: 0, bath: 0, deshed: 0, nails: 0, other: 0 };
    let grandTotal = 0;

    appointments.forEach(a => {
      const svc = services.find(s => s.id === a.serviceId);
      const cat = svc?.category || 'other';
      if (cat in totals) {
        totals[cat] += 1;
      } else {
        totals.other += 1;
      }
      grandTotal += 1;
    });

    if (grandTotal === 0) grandTotal = 1;

    return {
      fullgroom: Math.round((totals.fullgroom / grandTotal) * 100) || 45,
      bath: Math.round((totals.bath / grandTotal) * 100) || 30,
      deshed: Math.round((totals.deshed / grandTotal) * 100) || 15,
      nails: Math.round((totals.nails / grandTotal) * 100) || 10,
    };
  }, [appointments, services]);

  const handleComplete = (id: string, petName: string) => {
    updateAppointmentStatus(id, 'completed');
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF6B00', '#A855F7', '#10B981'],
    });
    showToast(`Completed grooming for ${petName}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Playful Hero Greeting Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#240C0B] tracking-tight flex items-center gap-2">
            GOOD MORNING GUYS <span className="text-3xl sm:text-4xl">🐕</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6865] font-semibold mt-1">
            here's today's overview for <span className="text-[#FF6B00] font-bold">{featuredPetsText}</span>.
          </p>
        </div>

        <button
          onClick={() => openModal('appointmentForm', { date: todayStr })}
          className="self-start sm:self-center px-5 py-2.5 bg-[#240C0B] hover:bg-[#381514] text-white rounded-full text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#FF6B00]" />
          <span>New Booking</span>
        </button>
      </motion.div>

      {/* Top Row: 3 Premium Pastel Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Appointments Today (Lavender) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => setView('calendar')}
          className="bg-gradient-to-br from-[#ECE5FF] via-[#E1D4FF] to-[#D3C0FF] text-[#321360] p-6 rounded-[28px] relative overflow-hidden shadow-xs hover:shadow-md transition-all border border-white/60 flex justify-between items-center cursor-pointer"
        >
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#321360] text-white flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total Appointments Today</span>
            </div>
            <div className="font-display font-extrabold text-4xl tracking-tight text-[#321360]">
              {todaysAppts.length}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 bg-white/70 text-[#321360] rounded-full shadow-2xs">
              <span>{appointments.length} Total</span>
              <span className="opacity-70 font-normal">on calendar</span>
            </div>
          </div>

          {/* 3D Paw Graphic Motif */}
          <div className="w-20 h-20 opacity-90 shrink-0 transform rotate-12 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-[#A885EE]">
              <ellipse cx="50" cy="65" rx="22" ry="18" />
              <circle cx="28" cy="40" r="10" />
              <circle cx="50" cy="30" r="11" />
              <circle cx="72" cy="40" r="10" />
            </svg>
          </div>
        </motion.div>

        {/* Card 2: Total Revenue Today (Peach) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => setView('revenue')}
          className="bg-gradient-to-br from-[#FFE4D3] via-[#FFD7BE] to-[#FFC5A1] text-[#541900] p-6 rounded-[28px] relative overflow-hidden shadow-xs hover:shadow-md transition-all border border-white/60 flex justify-between items-center cursor-pointer"
        >
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#541900] text-white flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total Revenue Today</span>
            </div>
            <div className="font-display font-extrabold text-4xl tracking-tight text-[#541900]">
              ${todayRevenue.toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 bg-white/70 text-[#541900] rounded-full shadow-2xs">
              <span>${mtdRevenue.toLocaleString()}</span>
              <span className="opacity-70 font-normal">MTD {formattedMonthLabel}</span>
            </div>
          </div>

          {/* Pet Bowl Graphic Motif */}
          <div className="w-20 h-20 opacity-90 shrink-0 transform -rotate-6 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-[#E27C44]">
              <path d="M 15 50 Q 50 85 85 50 Z" />
              <ellipse cx="50" cy="50" rx="35" ry="10" fill="#F49561" />
              <circle cx="50" cy="48" r="4" fill="#541900" />
            </svg>
          </div>
        </motion.div>

        {/* Card 3: Active Clients / Pets (Pink) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => setView('clients')}
          className="bg-gradient-to-br from-[#FFE2F2] via-[#FFD0E8] to-[#FFBBDC] text-[#560A38] p-6 rounded-[28px] relative overflow-hidden shadow-xs hover:shadow-md transition-all border border-white/60 flex justify-between items-center cursor-pointer"
        >
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#560A38] text-white flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Active Clients / Pets</span>
            </div>
            <div className="font-display font-extrabold text-4xl tracking-tight text-[#560A38]">
              {clients.length}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 bg-white/70 text-[#560A38] rounded-full shadow-2xs">
              <span>{clients.filter(c => c.points > 0).length} Rewards</span>
              <span className="opacity-70 font-normal">members</span>
            </div>
          </div>

          {/* Food Bag Motif */}
          <div className="w-20 h-20 opacity-90 shrink-0 transform rotate-6 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-[#E25C9E]">
              <path d="M 25 35 L 75 35 L 80 80 Q 80 85 75 85 L 25 85 Q 20 85 20 80 Z" />
              <path d="M 30 25 L 70 25 L 75 35 L 25 35 Z" fill="#F47BB4" />
              <ellipse cx="50" cy="60" rx="8" ry="6" fill="#560A38" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Middle Row: Appointments, Pets Summary, Grooming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Soft Yellow Appointments Card with Options for Booking & Printing Invoice */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-[#FFF8E7] text-[#331D00] p-6 rounded-[28px] border border-[#FFE7B3] shadow-xs space-y-4"
        >
          {/* Header & Quick Booking Action */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-extrabold text-xl text-[#331D00] flex items-center gap-1.5">
                Appointments
              </h2>
              <p className="text-[11px] font-semibold text-[#8C6D38]">
                {apptFilter === 'today' ? `Today (${todaysAppts.length} scheduled)` : 'All Upcoming'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openModal('appointmentForm', { date: todayStr })}
                className="px-2.5 py-1 bg-[#FF6B00] hover:bg-[#E55C00] text-white text-[11px] font-extrabold rounded-full shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                title="Book New Appointment"
              >
                <Plus className="w-3.5 h-3.5" /> Book
              </button>
            </div>
          </div>

          {/* Sub-toggle: Today vs Upcoming */}
          <div className="flex items-center justify-between bg-[#F7ECCE] p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setApptFilter('today')}
              className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                apptFilter === 'today' ? 'bg-[#331D00] text-white shadow-2xs' : 'text-[#8C6D38] hover:text-[#331D00]'
              }`}
            >
              Today ({formattedTodayLabel})
            </button>
            <button
              onClick={() => setApptFilter('upcoming')}
              className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                apptFilter === 'upcoming' ? 'bg-[#331D00] text-white shadow-2xs' : 'text-[#8C6D38] hover:text-[#331D00]'
              }`}
            >
              Upcoming ({upcomingApptsList.length})
            </button>
          </div>

          {/* Appointment Items List */}
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {displayedCardAppts.length === 0 ? (
              <div className="p-6 text-center text-[#8C6D38] text-xs space-y-2 bg-white/60 rounded-2xl border border-[#FFEBBF]">
                <p>No appointments found for this view.</p>
                <button
                  onClick={() => openModal('appointmentForm', { date: todayStr })}
                  className="px-3 py-1.5 bg-[#FF6B00] text-white text-xs font-extrabold rounded-full shadow-2xs"
                >
                  Book Appointment
                </button>
              </div>
            ) : (
              displayedCardAppts.map((item) => {
                const client = clients.find(c => c.id === item.clientId);
                const service = services.find(s => s.id === item.serviceId);
                const petAvatar = PET_AVATARS[item.clientId] || DEFAULT_DOG_AVATAR;
                const isCompleted = item.status === 'completed';

                let tagBg = 'bg-[#FF6B00] text-white';
                if (isCompleted) tagBg = 'bg-[#3BB221] text-white';
                else if (item.status === 'confirmed') tagBg = 'bg-[#240C0B] text-white';
                else if (item.status === 'booked') tagBg = 'bg-[#FF9F00] text-white';

                return (
                  <div 
                    key={item.id}
                    className="bg-white/95 hover:bg-white p-3 rounded-2xl border border-[#FFEBBF] shadow-2xs transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div 
                        onClick={() => openModal('appointmentForm', { appointment: item })}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                      >
                        <img 
                          src={petAvatar} 
                          alt={client?.name || 'Pet'} 
                          className="w-9 h-9 rounded-full object-cover border border-[#FF6B00] shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-display font-extrabold text-sm text-[#331D00] truncate">
                            {client?.name || 'Unknown Pet'}
                          </h3>
                          <p className="text-[10px] text-[#8C6D38] font-bold truncate flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#FF6B00]" />
                            {item.date === todayStr ? 'Today' : item.date.split('-').slice(1).join('/')} {item.start} • {service?.name || 'Grooming'}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${tagBg}`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Quick Options Bar: Invoice, Complete, Details */}
                    <div className="pt-1.5 border-t border-[#FFEBBF]/60 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#331D00] text-xs">
                        ${item.price + (item.retail || 0)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Print Invoice Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('invoiceModal', { appointment: item });
                          }}
                          className="px-2 py-1 bg-[#FFF3EB] hover:bg-[#FFE0CD] text-[#FF6B00] text-[10px] font-bold rounded-lg border border-[#FFD0B3] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-3 h-3" /> Invoice
                        </button>

                        {/* Mark Done Button */}
                        {!isCompleted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(item.id, client?.name || 'Pet');
                            }}
                            className="px-2 py-1 bg-[#10B981] hover:bg-[#0D9668] text-white text-[10px] font-extrabold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            title="Mark Completed"
                          >
                            <Check className="w-3 h-3" /> Done
                          </button>
                        )}

                        {/* Edit Booking Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('appointmentForm', { appointment: item });
                          }}
                          className="px-2 py-1 bg-[#331D00]/5 hover:bg-[#331D00]/10 text-[#331D00] text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Col 2: Pistachio Green Pets Data Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-[#E3F6D8] text-[#1D3A0E] p-6 rounded-[28px] border border-[#C5EBBA] shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-xl text-[#1D3A0E]">
              Pets Data Summary
            </h2>
            <button 
              onClick={() => setView('clients')}
              className="text-xs font-bold text-[#2A6E12] hover:underline cursor-pointer"
            >
              Manage Pets
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#C5EBBA] text-[10px] font-black text-[#4B7A38] uppercase">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Breed</th>
                  <th className="pb-2">Rabies Status</th>
                  <th className="pb-2 text-right">Next Appt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5EBBA]/60 font-semibold">
                {petDataSummary.map((item) => (
                  <tr 
                    key={item.client.id} 
                    onClick={() => setView('clients')}
                    className="hover:bg-white/50 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 font-bold text-[#1D3A0E]">
                      {item.client.name}
                      <span className="block text-[9px] font-normal text-[#4B7A38]">Owner: {item.client.owner}</span>
                    </td>
                    <td className="py-2.5 text-[#3C6E28] text-[11px] truncate max-w-[80px]">
                      {item.client.breed}
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${item.statusBg}`}>
                        {item.healthStatus}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-[10px] text-[#2A6E12] font-bold">
                      {item.nextApptStr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Col 3: Grooming Schedule Timeline Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white text-[#240C0B] p-6 rounded-[28px] border border-[#E6DFD5] shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-xl text-[#240C0B]">
              Grooming Schedule
            </h2>
            <span className="text-[11px] font-bold text-[#FF6B00] bg-[#FFF3EB] px-2.5 py-1 rounded-full">
              Today (Aug 12)
            </span>
          </div>

          <div className="space-y-3.5">
            {todaysAppts.length === 0 ? (
              <div className="p-6 text-center text-[#A08E8B] text-xs space-y-2">
                <p>No grooming sessions scheduled for today yet.</p>
                <button
                  onClick={() => openModal('appointmentForm', { date: todayStr })}
                  className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-bold rounded-full shadow-sm"
                >
                  Book Session
                </button>
              </div>
            ) : (
              todaysAppts.map((appt, idx) => {
                const client = clients.find(c => c.id === appt.clientId);
                const service = services.find(s => s.id === appt.serviceId);
                const groomer = staff.find(st => st.id === appt.staffId);
                const isCompleted = appt.status === 'completed';
                const petAvatar = PET_AVATARS[appt.clientId] || DEFAULT_DOG_AVATAR;

                // Highlight first non-completed appointment as Active
                const isActiveSlot = idx === 0 || (!isCompleted && todaysAppts.findIndex(a => a.status !== 'completed') === idx);

                if (isActiveSlot) {
                  return (
                    <div 
                      key={appt.id}
                      className="bg-[#3B1F70] text-white p-4 rounded-2xl shadow-md space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold text-[#C2B1E5]">
                          {appt.start} ({appt.duration}m)
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          isCompleted ? 'bg-[#10B981] text-white' : 'bg-[#FF6B00] text-white'
                        }`}>
                          {isCompleted ? 'Completed' : 'Active Session'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <img 
                          src={petAvatar} 
                          alt={client?.name || 'Pet'} 
                          className="w-9 h-9 rounded-full object-cover border border-[#A885EE] shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-display font-extrabold text-sm text-white truncate">
                            {client?.name || 'Pet'} ({client?.breed})
                          </h4>
                          <p className="text-[10px] text-[#D1C3F0] truncate">
                            {service?.name || 'Grooming'} • {groomer ? groomer.name.split(' ')[0] : 'Stylist'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-white/10">
                        <div>
                          <span className="text-[9px] text-[#C2B1E5] block uppercase font-semibold">Total Price</span>
                          <span className="font-display font-extrabold text-base text-white">
                            ${appt.price + (appt.retail || 0)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal('invoiceModal', { appointment: appt })}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {!isCompleted && (
                            <button
                              onClick={() => handleComplete(appt.id, client?.name || 'Pet')}
                              className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white text-xs font-extrabold rounded-full shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Mark Done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={appt.id}
                    className="flex gap-3 text-xs items-center justify-between p-2.5 bg-[#FAF8F5] rounded-2xl border border-[#E6DFD5]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-bold text-[#FF6B00] shrink-0 w-12 text-right">
                        {appt.start}
                      </span>
                      <div className="min-w-0">
                        <p className="font-extrabold text-[#240C0B] truncate">{client?.name || 'Pet'}</p>
                        <p className="text-[10px] text-[#A08E8B] truncate">{service?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-[#240C0B]">${appt.price}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted ? 'bg-[#E1F0E7] text-[#10B981]' : 'bg-[#FFE7B3] text-[#331D00]'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Care & Services Radial Index & Monthly Revenue Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Care & Services Index Radial Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="bg-white p-6 rounded-[28px] border border-[#E6DFD5] shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-lg text-[#240C0B]">
              Services Index
            </h3>
            <span className="text-[10px] text-[#A08E8B] font-bold">Studio Breakdown</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B1F70]" /> 
                Full Groom ({careCategoryRatio.fullgroom}%)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" /> 
                Bath & Brush ({careCategoryRatio.bath}%)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3BB221]" /> 
                De-shed ({careCategoryRatio.deshed}%)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F00]" /> 
                Nails & Trim ({careCategoryRatio.nails}%)
              </div>
            </div>

            {/* SVG Dynamic Radial Rings */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#F1EEE6" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="50" cy="50" r="42" 
                  stroke="#3B1F70" strokeWidth="8" 
                  strokeDasharray="264" 
                  strokeDashoffset={264 - (264 * careCategoryRatio.fullgroom) / 100} 
                  fill="transparent" strokeLinecap="round" 
                />
                <circle 
                  cx="50" cy="50" r="32" 
                  stroke="#FF6B00" strokeWidth="8" 
                  strokeDasharray="200" 
                  strokeDashoffset={200 - (200 * careCategoryRatio.bath) / 100} 
                  fill="transparent" strokeLinecap="round" 
                />
                <circle 
                  cx="50" cy="50" r="22" 
                  stroke="#3BB221" strokeWidth="8" 
                  strokeDasharray="138" 
                  strokeDashoffset={138 - (138 * careCategoryRatio.deshed) / 100} 
                  fill="transparent" strokeLinecap="round" 
                />
              </svg>
              <div className="absolute w-8 h-8 rounded-full bg-[#FFF8E7] border border-[#FFE7B3] flex items-center justify-center text-[#FF6B00] text-sm">
                🐾
              </div>
            </div>
          </div>
        </motion.div>

        {/* Monthly Revenue Matrix Bar Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 rounded-[28px] border border-[#E6DFD5] shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-lg text-[#240C0B]">
                Monthly Revenue Matrix
              </h3>
              <p className="text-[11px] text-[#A08E8B]">August 2026 Daily Revenue Graph</p>
            </div>
            <button
              onClick={() => setView('revenue')}
              className="text-xs font-extrabold text-[#3B1F70] bg-[#ECE5FF] hover:bg-[#DCD0FF] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              ${mtdRevenue.toLocaleString()} MTD Revenue
            </button>
          </div>

          {/* Dynamic Interactive Bar Visualizer for August (Days 1 to 31) */}
          <div className="pt-2 relative">
            {hoveredDay && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#240C0B] text-white text-[10px] font-extrabold px-3 py-1 rounded-lg shadow-md z-20">
                Aug {hoveredDay.day}: ${hoveredDay.rev} ({hoveredDay.count} grooms)
              </div>
            )}

            <div className="flex gap-1 h-32 items-end justify-between">
              {augustDailyData.days.map((item) => {
                const heightPct = item.rev > 0 
                  ? Math.max(12, Math.round((item.rev / augustDailyData.maxRev) * 100))
                  : 6;

                const isToday = item.day === 12;

                return (
                  <div 
                    key={item.day} 
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredDay(item)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setView('revenue')}
                  >
                    <div 
                      className={`w-full rounded-md transition-all ${
                        isToday
                          ? 'bg-[#FF6B00] shadow-sm ring-1 ring-[#FF6B00]/40'
                          : item.rev > 0
                          ? 'bg-[#3B1F70] group-hover:bg-[#FF6B00]'
                          : 'bg-[#F1EEE6]'
                      }`} 
                      style={{ height: `${heightPct}%` }}
                      title={`Aug ${item.day}: $${item.rev}`}
                    />
                    <span className={`text-[7.5px] font-extrabold ${isToday ? 'text-[#FF6B00]' : 'text-[#A08E8B]'}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
