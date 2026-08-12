import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Gift, 
  DollarSign, 
  Clock, 
  Plus, 
  AlertTriangle, 
  Trash2, 
  Edit 
} from 'lucide-react';

export const BusinessView: React.FC = () => {
  const { 
    inventory, 
    giftCards, 
    expenses, 
    waitlist, 
    clients, 
    services, 
    openModal, 
    deleteExpense, 
    deleteWaitlist, 
    deleteInventoryItem,
    confirmDelete 
  } = useApp();

  const [tab, setTab] = useState<'inventory' | 'gift' | 'expenses' | 'waitlist'>('inventory');

  return (
    <div className="space-y-6">
      {/* Operations Navigation Tabs */}
      <div className="card-box p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="bg-[#EAE7DC] p-1 rounded-2xl flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setTab('inventory')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'inventory' ? 'bg-[#173E39] text-white' : 'text-[#5C716C]'
            }`}
          >
            📦 Retail Stock ({inventory.length})
          </button>
          <button
            onClick={() => setTab('gift')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'gift' ? 'bg-[#173E39] text-white' : 'text-[#5C716C]'
            }`}
          >
            🎁 Gift Cards ({giftCards.length})
          </button>
          <button
            onClick={() => setTab('expenses')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'expenses' ? 'bg-[#173E39] text-white' : 'text-[#5C716C]'
            }`}
          >
            💸 Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setTab('waitlist')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'waitlist' ? 'bg-[#173E39] text-white' : 'text-[#5C716C]'
            }`}
          >
            ⏳ Waitlist ({waitlist.length})
          </button>
        </div>

        <div>
          {tab === 'inventory' && (
            <button
              onClick={() => openModal('inventoryForm')}
              className="btn-primary text-xs px-4 py-2 rounded-full font-bold shadow-md"
            >
              + Add Product
            </button>
          )}
          {tab === 'gift' && (
            <button
              onClick={() => openModal('giftCardForm')}
              className="btn-primary text-xs px-4 py-2 rounded-full font-bold shadow-md"
            >
              + Issue Gift Card
            </button>
          )}
          {tab === 'expenses' && (
            <button
              onClick={() => openModal('expenseForm')}
              className="btn-primary text-xs px-4 py-2 rounded-full font-bold shadow-md"
            >
              + Log Expense
            </button>
          )}
          {tab === 'waitlist' && (
            <button
              onClick={() => openModal('waitlistForm')}
              className="btn-primary text-xs px-4 py-2 rounded-full font-bold shadow-md"
            >
              + Add to Waitlist
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Retail Inventory */}
      {tab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => {
            const isLow = item.stock <= item.lowAt;

            return (
              <div key={item.id} className="card-box p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-base text-[#173E39]">
                      {item.name}
                    </h3>
                    <span className="font-display font-bold text-base text-[#2E8A81]">
                      ${item.price}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-[#5C716C] space-y-1">
                    <div>Cost: ${item.cost} • Margin: ${item.price - item.cost}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                        isLow ? 'bg-[#FEF2F2] text-[#C9503A]' : 'bg-[#E1F0E7] text-[#357A54]'
                      }`}>
                        {item.stock} in stock {isLow ? '(LOW STOCK)' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D8D3C4] flex items-center justify-end gap-1">
                  <button
                    onClick={() => openModal('inventoryForm', { item })}
                    className="p-1.5 text-[#5C716C] hover:text-[#2E8A81] rounded-lg text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      confirmDelete({
                        title: 'Remove Inventory Item',
                        message: `Remove "${item.name}" from inventory?`,
                        confirmLabel: 'Remove Item',
                        onConfirm: () => deleteInventoryItem(item.id),
                      });
                    }}
                    className="p-1.5 text-[#5C716C] hover:text-[#C9503A] rounded-lg text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Gift Cards */}
      {tab === 'gift' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {giftCards.map((gc) => (
            <div key={gc.id} className="card-box p-4 bg-gradient-to-br from-[#FFFBEB] to-[#F1EEE6] border border-[#E7A93C]/40">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-lg text-[#173E39]">{gc.code}</span>
                <span className="font-display font-bold text-lg text-[#2E8A81]">${gc.balance} / ${gc.amount}</span>
              </div>
              <p className="text-xs text-[#5C716C] mt-2">{gc.note}</p>
              <div className="text-[10px] text-[#5C716C] mt-2 pt-2 border-t border-[#D8D3C4]">
                Issued: {gc.issued}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Expenses */}
      {tab === 'expenses' && (
        <div className="card-box space-y-3">
          <div className="divide-y divide-[#D8D3C4]">
            {expenses.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#173E39] text-sm">{exp.desc}</div>
                  <div className="text-[#5C716C] mt-0.5">Category: {exp.category} • Date: {exp.date}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-sm text-[#C9503A]">${exp.amount.toFixed(2)}</span>
                  <button
                    onClick={() => {
                      confirmDelete({
                        title: 'Delete Expense Log',
                        message: `Delete expense log for "${exp.desc}" ($${exp.amount.toFixed(2)})?`,
                        confirmLabel: 'Delete Expense',
                        onConfirm: () => deleteExpense(exp.id),
                      });
                    }}
                    className="p-1 text-[#5C716C] hover:text-[#C9503A]"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Waitlist */}
      {tab === 'waitlist' && (
        <div className="card-box space-y-3">
          <div className="divide-y divide-[#D8D3C4]">
            {waitlist.map((wl) => {
              const client = clients.find((c) => c.id === wl.clientId);
              const service = services.find((s) => s.id === wl.serviceId);

              return (
                <div key={wl.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#173E39] text-sm">{client?.name} ({client?.breed})</div>
                    <div className="text-[#5C716C] mt-0.5">Requested Service: {service?.name} • Preference: "{wl.pref}"</div>
                  </div>

                  <button
                    onClick={() => {
                      confirmDelete({
                        title: 'Remove Waitlist Entry',
                        message: `Remove ${client?.name || 'client'} from the waitlist?`,
                        confirmLabel: 'Remove Entry',
                        onConfirm: () => deleteWaitlist(wl.id),
                      });
                    }}
                    className="btn-ghost text-xs px-3 py-1 rounded-xl text-[#C9503A] hover:bg-[#FEF2F2]"
                  >
                    Clear Waitlist
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
