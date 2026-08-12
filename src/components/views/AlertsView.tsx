import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Send, Phone, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { clients, openModal } = useApp();
  const today = new Date(2026, 7, 12);

  // Categorize Vaccine Expiry
  const alertsList = React.useMemo(() => {
    return clients
      .map((c) => {
        if (!c.rabiesExpiry) return null;
        const exp = new Date(c.rabiesExpiry);
        const daysTo = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (daysTo <= 30) {
          return {
            client: c,
            daysTo,
            isExpired: daysTo < 0,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => (a?.daysTo || 0) - (b?.daysTo || 0));
  }, [clients]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="card-box bg-gradient-to-r from-[#FEF2F2] to-[#FFFBEB] border border-[#E7C0B5] p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#C9503A]/10 text-[#C9503A] flex items-center justify-center font-bold flex-none">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-[#173E39]">
            Vaccination & Health Alert Radar
          </h2>
          <p className="text-xs text-[#5C716C]">
            Rabies vaccine records must be up to date before grooming sessions. Contact owners directly or send 1-click reminders.
          </p>
        </div>
      </div>

      {/* Vaccine Radar Table / List */}
      <div className="card-box space-y-4">
        <h3 className="font-display font-bold text-lg text-[#173E39]">
          Upcoming & Expired Vaccine Warnings ({alertsList.length})
        </h3>

        {alertsList.length === 0 ? (
          <div className="p-8 text-center text-[#5C716C] text-xs">
            🎉 All registered pets have up-to-date rabies vaccinations!
          </div>
        ) : (
          <div className="divide-y divide-[#D8D3C4]">
            {alertsList.map((item) => {
              if (!item) return null;
              const { client, daysTo, isExpired } = item;

              return (
                <div key={client.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl flex items-center justify-center font-bold ${
                      isExpired ? 'bg-[#FEF2F2] text-[#C9503A]' : 'bg-[#FFFBEB] text-[#9A6E1B]'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-[#173E39]">
                          {client.name}
                        </span>
                        <span className="text-[10px] bg-[#EAE7DC] text-[#5C716C] px-2 py-0.5 rounded-full">
                          {client.breed}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isExpired ? 'bg-[#FEF2F2] text-[#C9503A]' : 'bg-[#FFFBEB] text-[#9A6E1B]'
                        }`}>
                          {isExpired ? `EXPIRED (${Math.abs(daysTo)} days ago)` : `Expires in ${daysTo} days`}
                        </span>
                      </div>

                      <div className="text-[#5C716C] mt-1">
                        Owner: <strong className="text-[#173E39]">{client.owner}</strong> • {client.phone} • {client.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={`tel:${client.phone}`}
                      className="btn-ghost text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#2E8A81]" /> Call
                    </a>
                    <button
                      onClick={() => openModal('reminderModal', { client, alertType: 'vaccine' })}
                      className="btn-primary text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 font-bold"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Reminder
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
