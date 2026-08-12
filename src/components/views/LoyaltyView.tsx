import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Gift, Sparkles, Search, CheckCircle } from 'lucide-react';

export const LoyaltyView: React.FC = () => {
  const { clients, redemptions, openModal, settings } = useApp();
  const [query, setQuery] = useState('');

  const rewards = [
    { title: '$10 Off Next Groom', pts: 100, desc: 'Discount voucher on any full grooming service.' },
    { title: 'Free Teeth Brushing', pts: 120, desc: 'Fresh mint enzymatic teeth cleaning add-on.' },
    { title: 'Free Nail Grind', pts: 180, desc: 'Smooth nail grind and paw balm treatment.' },
    { title: '$25 Spa Day Voucher', pts: 250, desc: 'Premium discount voucher for full spa day.' },
    { title: 'Free De-shed Upgrade', pts: 300, desc: 'Undercoat blow-out & de-shed treatment.' },
  ];

  // Search clients for leaderboard
  const searchedClients = React.useMemo(() => {
    return clients
      .filter((c) => {
        const q = query.toLowerCase();
        return !q || c.name.toLowerCase().includes(q) || c.owner.toLowerCase().includes(q);
      })
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [clients, query]);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="card-box bg-gradient-to-br from-[#184540] via-[#0F2E2B] to-[#173E39] text-white p-6 rounded-3xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="text-xs font-extrabold tracking-widest text-[#F4B98A] uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4" /> PAWS & REWARDS LOYALTY PROGRAM
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
            Client Appreciation & Points Engine
          </h2>
          <p className="text-xs md:text-sm text-[#DCE9E5]">
            ${settings.ppd} spent = 1 pt • {settings.redeem} pts = $1 off • Birthday month ×{settings.bday} points bonus!
          </p>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-lg text-[#173E39] flex items-center gap-2">
          <Gift className="w-5 h-5 text-[#E7A93C]" />
          Available Reward Catalog
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((r, idx) => (
            <div
              key={idx}
              className="card-box bg-white border border-[#E7A93C]/30 p-4 flex flex-col justify-between hover:border-[#E7A93C] transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-base text-[#173E39]">
                    {r.title}
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#C98A22] border border-[#E7A93C]/40">
                    {r.pts} PTS
                  </span>
                </div>
                <p className="text-xs text-[#5C716C] mt-2">
                  {r.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#D8D3C4] flex items-center justify-end">
                <button
                  onClick={() => openModal('redeemModal', { reward: r })}
                  className="btn-primary text-xs px-3.5 py-1.5 rounded-full font-bold"
                >
                  Redeem Reward
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Leaderboard & Points Search */}
      <div className="card-box space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-[#173E39]">
              Client Points Leaderboard
            </h3>
            <p className="text-xs text-[#5C716C]">
              Select a client to redeem vouchers or adjust points.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C716C]" />
            <input
              type="text"
              placeholder="Search dog or owner..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D8D3C4] rounded-xl w-full outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D8D3C4] text-[#5C716C] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Pet Name</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">Points Balance</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D3C4]">
              {searchedClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#F1EEE6]/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-[#173E39]">
                    {client.name} <span className="text-[10px] text-[#5C716C] font-normal">({client.breed})</span>
                  </td>
                  <td className="py-3 px-3 text-[#5C716C]">{client.owner}</td>
                  <td className="py-3 px-3">
                    <span className="font-display font-bold text-sm text-[#C98A22] bg-[#FFFBEB] px-2.5 py-1 rounded-full border border-[#E7A93C]/30">
                      {client.points || 0} pts
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => openModal('redeemModal', { client })}
                      className="btn-teal text-xs px-3 py-1 rounded-xl font-bold"
                    >
                      Redeem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
